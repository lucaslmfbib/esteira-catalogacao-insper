const API_BASES = [
  "https://repositorio.insper.edu.br/server/api",
  "https://repositorio-api.insper.edu.br/server/api"
];
const COLLECTIONS = [
  "2363934b-9ec5-4892-b201-b43636140c9e",
  "6d2d131b-e7c3-46e9-896e-d80458c17079",
  "e3bae2cd-5c3e-4374-abbd-70c0a7440e7d",
  "a4e7fd5c-b0fa-457c-ac11-cc09a8be363e",
  "171f475f-4a4d-4c0c-84d2-70927bc75184",
  "668c36e1-7c18-421b-9abf-dd79edc9eb5b"
];

export async function onRequestGet() {
  for (const base of API_BASES) {
    try {
      const terms = new Set();
      await Promise.all(COLLECTIONS.map(async (scope) => {
        let page = 0;
        let totalPages = 1;
        while (page < totalPages && page < 8) {
          const url = new URL(base + "/discover/search/objects");
          url.searchParams.set("scope", scope);
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
            const values = item.metadata?.["local.subject.cnpq"] || [];
            for (const entry of values) {
              const value = String(entry?.value || "").trim();
              if (value) terms.add(value);
            }
          }
          totalPages = Number(result?.page?.totalPages || data?.page?.totalPages || 1);
          if (!objects.length || !result?._links?.next) break;
          page += 1;
        }
      }));
      const values = [...terms].sort((a, b) => a.localeCompare(b, "pt-BR"));
      return Response.json(
        { values, count: values.length, source: "metadados públicos local.subject.cnpq do DSpace Insper" },
        { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } }
      );
    } catch (error) {
      if (base === API_BASES[API_BASES.length - 1]) {
        return Response.json(
          { error: "Não foi possível carregar valores CNPq do DSpace Insper.", detail: String(error?.message || error) },
          { status: 502, headers: { "Cache-Control": "no-store" } }
        );
      }
    }
  }
  return Response.json({ error: "Serviço DSpace indisponível." }, { status: 502 });
}
