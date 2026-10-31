const COLLECTION_UUID = "e2b5a375-5a4a-4541-85a5-663a6d02882f";
const API_BASES = [
  "https://repositorio.insper.edu.br/server/api",
  "https://repositorio-api.insper.edu.br/server/api"
];
const VERIFIED_FALLBACKS = [{
  name: "Clio Nudel Radomysler",
  uuid: "",
  orcid: "0000-0003-3879-2421",
  handle: "",
  source: "cadastro público do Insper + ORCID"
}];

function metadataValue(metadata, key) {
  const values = metadata?.[key];
  return Array.isArray(values) ? String(values[0]?.value || "").trim() : "";
}

function asProfile(item) {
  const metadata = item?.metadata || {};
  const given = metadataValue(metadata, "person.givenName");
  const family = metadataValue(metadata, "person.familyName");
  const name = String(
    item?.name ||
    metadataValue(metadata, "dc.title") ||
    [given, family].filter(Boolean).join(" ")
  ).trim();
  if (!name) return null;
  return {
    name,
    uuid: String(item?.uuid || "").trim(),
    handle: String(item?.handle || "").trim(),
    orcid: metadataValue(metadata, "person.identifier.orcid") ||
      metadataValue(metadata, "dc.identifier.orcid")
  };
}

function normalizedName(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function onRequestGet() {
  const profiles = [];
  let lastError = "";
  for (const base of API_BASES) {
    try {
      let page = 0;
      let totalPages = 1;
      while (page < totalPages && page < 10) {
        const url = new URL(base + "/discover/search/objects");
        url.searchParams.set("scope", COLLECTION_UUID);
        url.searchParams.set("dsoType", "item");
        url.searchParams.set("size", "100");
        url.searchParams.set("page", String(page));
        const response = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
          cf: { cacheTtl: 86400, cacheEverything: true }
        });
        if (!response.ok) throw new Error("DSpace respondeu HTTP " + response.status);
        const data = await response.json();
        const result = data?._embedded?.searchResults || data?._embedded?.searchResult;
        const objects = result?._embedded?.objects || [];
        for (const hit of objects) {
          const item = hit?._embedded?.indexableObject || {};
          const profile = asProfile(item);
          if (profile) profiles.push(profile);
        }
        totalPages = Number(result?.page?.totalPages || data?.page?.totalPages || 1);
        if (!objects.length || !result?._links?.next) break;
        page += 1;
      }
      if (profiles.length) break;
    } catch (error) {
      lastError = String(error?.message || error);
    }
  }

  const unique = new Map();
  for (const profile of [...profiles, ...VERIFIED_FALLBACKS]) {
    const key = normalizedName(profile.name);
    if (key) {\n      const prior = unique.get(key);\n      unique.set(key, prior ? { ...profile, ...prior, uuid: prior.uuid || profile.uuid, handle: prior.handle || profile.handle, orcid: prior.orcid || profile.orcid } : profile);\n    }
  }
  const merged = [...unique.values()];
  if (!merged.length) {
    return Response.json(
      { error: "Não foi possível carregar perfis de pesquisadores Insper.", detail: lastError || "Lista vazia." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
  return Response.json(
    {
      profiles: merged,
      count: merged.length,
      source: profiles.length ? "DSpace Insper + correspondências verificadas" : "correspondências verificadas",
      dspaceUnavailable: !profiles.length,
      detail: lastError
    },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } }
  );
}
