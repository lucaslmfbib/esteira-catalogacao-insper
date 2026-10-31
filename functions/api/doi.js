function xmlText(fragment) {
  return String(fragment || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, " ").trim();
}

function xmlField(xml, tag) {
  const match = String(xml || "").match(new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tag + ">", "i"));
  return match ? xmlText(match[1]) : "";
}

function parsePubMed(xml) {
  const article = String(xml || "");
  const authorBlock = (article.match(/<AuthorList\b[^>]*>([\s\S]*?)<\/AuthorList>/i) || [])[1] || "";
  const authors = [...authorBlock.matchAll(/<Author\b[^>]*>([\s\S]*?)<\/Author>/gi)].map(([, block]) => {
    const family = xmlField(block, "LastName");
    const given = xmlField(block, "ForeName") || xmlField(block, "Initials");
    return family ? { family, given, name: [family, given].filter(Boolean).join(", ") } : { name: xmlField(block, "CollectiveName") };
  }).filter(x => x.name);
  const abstract = [...article.matchAll(/<AbstractText(?:\s+[^>]*)?>([\s\S]*?)<\/AbstractText>/gi)]
    .map(([, value]) => xmlText(value)).filter(Boolean).join(" ");
  const keywords = [...article.matchAll(/<Keyword(?:\s+[^>]*)?>([\s\S]*?)<\/Keyword>/gi)]
    .map(([, value]) => xmlText(value)).filter(Boolean);
  return {
    title: xmlField(article, "ArticleTitle"),
    authors,
    abstract,
    keywords: [...new Set(keywords)],
    journal: xmlField(article, "Title"),
    year: xmlField(article, "Year"),
    volume: xmlField(article, "Volume"),
    issue: xmlField(article, "Issue"),
    pages: xmlField(article, "MedlinePgn"),
    issn: xmlField(article, "ISSN")
  };
}

async function crossref(doi) {
  const response = await fetch("https://api.crossref.org/works/" + encodeURIComponent(doi), {
    headers: { Accept: "application/json", "User-Agent": "EsteiraCatalogacaoInsper/1.0" },
    cf: { cacheTtl: 86400, cacheEverything: true }
  });
  if (!response.ok) throw new Error("Crossref HTTP " + response.status);
  const item = (await response.json())?.message || {};
  const date = item["published-print"]?.["date-parts"]?.[0] || item["published-online"]?.["date-parts"]?.[0] || item.issued?.["date-parts"]?.[0] || [];
  return {
    title: item.title?.[0] || "",
    authors: (item.author || []).map(a => {
      const family = a.family || "";
      const given = a.given || "";
      return { family, given, name: [family, given].filter(Boolean).join(", ") || a.name || "" };
    }).filter(a => a.name),
    abstract: xmlText(item.abstract || ""),
    keywords: item.subject || [],
    journal: item["container-title"]?.[0] || "",
    year: date[0] ? String(date[0]) : "",
    volume: item.volume || "",
    issue: item.issue || "",
    pages: item.page || "",
    issn: item.ISSN?.[0] || "",
    publisher: item.publisher || "",
    url: item.URL || ""
  };
}

async function pubmed(doi) {
  const search = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
  search.searchParams.set("db", "pubmed");
  search.searchParams.set("term", doi + "[doi]");
  search.searchParams.set("retmode", "json");
  const searchResponse = await fetch(search, { headers: { Accept: "application/json" } });
  if (!searchResponse.ok) throw new Error("PubMed search HTTP " + searchResponse.status);
  const ids = (await searchResponse.json())?.esearchresult?.idlist || [];
  if (!ids.length) return null;
  const detail = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi");
  detail.searchParams.set("db", "pubmed");
  detail.searchParams.set("id", ids[0]);
  detail.searchParams.set("retmode", "xml");
  const detailResponse = await fetch(detail, { headers: { Accept: "application/xml" } });
  if (!detailResponse.ok) throw new Error("PubMed record HTTP " + detailResponse.status);
  const xml = await detailResponse.text();
  const result = parsePubMed(xml);
  result.pmid = ids[0];
  return result;
}

export async function onRequestGet({ request }) {
  const params = new URL(request.url).searchParams;
  const doi = (params.get("doi") || "").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/[\s.,;]+$/g, "");
  if (!/^10\.\d{4,9}\//i.test(doi)) {
    return Response.json({ error: "Informe um DOI válido para buscar metadados." }, { status: 400 });
  }

  let crossrefData = null;
  let pubmedData = null;
  const errors = [];
  try { crossrefData = await crossref(doi); } catch (error) { errors.push("Crossref: " + String(error?.message || error)); }
  try { pubmedData = await pubmed(doi); } catch (error) { errors.push("PubMed: " + String(error?.message || error)); }

  if (!crossrefData && !pubmedData) {
    return Response.json({ error: "Não encontrei metadados para este DOI.", detail: errors.join(" · ") }, { status: 404 });
  }
  const c = crossrefData || {};
  const p = pubmedData || {};
  const authors = p.authors?.length ? p.authors : (c.authors || []);
  const metadata = {
    doi,
    title: p.title || c.title || "",
    authors,
    year: p.year || c.year || "",
    journal: c.journal || p.journal || "",
    volume: p.volume || c.volume || "",
    issue: p.issue || c.issue || "",
    pages: p.pages || c.pages || "",
    issn: p.issn || c.issn || "",
    publisher: c.publisher || "",
    url: c.url || "https://doi.org/" + doi,
    abstract: p.abstract || c.abstract || "",
    abstractLanguage: p.abstract ? "en" : (c.abstract ? "en" : ""),
    keywords: p.keywords?.length ? p.keywords : (c.keywords || []),
    sources: [pubmedData ? "PubMed" : "", crossrefData ? "Crossref" : ""].filter(Boolean),
    pmid: p.pmid || ""
  };
  return Response.json(
    { metadata },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } }
  );
}
