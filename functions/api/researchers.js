const COLLECTION_UUID = "e2b5a375-5a4a-4541-85a5-663a6d02882f";
const API_BASES = [
  "https://repositorio.insper.edu.br/server/api",
  "https://repositorio-api.insper.edu.br/server/api"
];

export async function onRequestGet() {
  for (const base of API_BASES) {
    try {
      const profiles = [];
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
          const name = String(item.name || item.metadata?.["dc.title"]?.[0]?.value || "").trim();
          if (name) profiles.push({
            name,
            uuid: item.uuid || "",
            handle: item.handle || ""
          });
        }

        totalPages = Number(result?.page?.totalPages || data?.page?.totalPages || 1);
        if (!objects.length || !result?._links?.next) break;
        page += 1;
      }

      if (!profiles.length) throw new Error("A busca não retornou perfis públicos.");
      return Response.json(
        { profiles, count: profiles.length, source: "DSpace Insper" },
        { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } }
      );
    } catch (error) {
      if (base === API_BASES[API_BASES.length - 1]) {
        return Response.json(
          { error: "Não foi possível carregar a coleção de pesquisadores do DSpace.", detail: String(error?.message || error) },
          { status: 502, headers: { "Cache-Control": "no-store" } }
        );
      }
    }
  }
  return Response.json({ error: "Serviço DSpace indisponível." }, { status: 502 });
}
