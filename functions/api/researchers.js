const COLLECTION_UUID = "e2b5a375-5a4a-4541-85a5-663a6d02882f";
const API_BASES = [
  "https://repositorio.insper.edu.br/server/api",
  "https://repositorio-api.insper.edu.br/server/api"
];
const VERIFIED_FALLBACK_NAMES = ["JARED PARKER SCRUGGS","LUIZA RIBEIRO ALVES CUNHA","NICOLAS PIMENTEL DE SOUZA","OTAVIO YAZBEK","PEDRO VITALE SIMON","NATALIA NETO PEREIRA CERIZE","LUIGI BENEDUCI CALOI","GUILHERME DE ALENCAR RAMOS","EVANDRO PROENCA SUSSEKIND","EDUARDO OLIVEIRA MARINHO","EDUARDO FERREIRA JORDÃO","VANESSA RAHAL CANADO","MARCIO FERNANDO STABILE JUNIOR","MARCEL PAROLIN JACKOWSKI","KENYTH ALVES DE FREITAS","GIOVANNA ABREU ALVES","GABRIELLE BEZERRA SALES SARLET","CLIO NUDEL RADOMYSLER","CASSIA DE OLIVEIRA FERNANDEZ","IGOR DOS SANTOS MONTAGNER","EDUARDO POZZI LUCCHESI","ADALTO BARBACEIA GONCALVES","VINICIUS LICKS","TOMÁS RODRIGUEZ MARTINEZ","TIAGO FERNANDES TAVARES","SILVIO SZAFIR","RODRIGO CARARETO","RODOLFO DA SILVA AVELINO","RAULISON ALVES RESENDE","RAUL IKEDA GOMES DA SILVA","RAPHAEL GALDINO DOS SANTOS","RAFAEL CORSI FERRÃO","PAULO ROBERTO BUFACCHI MENDES","PAULINA ALEJANDRA ACHURRA BURGOS","MAURA FERREIRA RODRIGUES","MARIA CAROLINA FOSS","MARCO ANTONIO LEONEL CAETANO","MARCELO HASHIMOTO","MACIEL CALEBE VIDAL","LUCIANO PEREIRA SOARES","LUCIANA CAMPOS LIMA","LIE PABLO GRALA PINTO","LEONIDAS SANDOVAL JUNIOR","LAURA MULLER MACHADO","JOSÉ GERALDO SETTER FILHO","JOICE MIAGAVA","ISRAEL FERREIRA ALVES","GUILHERME SILVEIRA MARTINS","GRAZIELA SIMONE TONIN","FREDERICO AUGUSTO ALEM BARBIERI","FLAVIA FERREIRA PIAZZA","FERNANDO LUIS SCHULER","FERNANDO GONÇALVES PICASSO","FABRÍCIO JAILSON BARTH","FABIO TURRI","FÁBIO SISMOTTO EL HAGE","FABIO ROBERTO DE MIRANDA","FABIO PELICANO BORGES VIEIRA","FABIO ORFALI","FABIO FERRAZ JUNIOR","ERIC AVERSARI MARTINS","EDVALTER BECKER HOLZ","DARCIO GENICOLO MARTINS","CAROLINA PEDROSA GOMES DE MELO","CARLOS MAGNO DE OLIVEIRA VALENTE","CARLOS EDUARDO DE BRITO NOVAES","CAIO FERNANDO RODRIGUES DOS SANTOS","BRUNA ARRUDA DE OLIVEIRA","ANTONIO CARLOS ROSSO JUNIOR","ANDREW TOSHIAKI NAKAYAMA KURAUCHI","ANDRE FILIPE DE MORAES BATISTA","ANA PAULA RODRIGUES DINIZ","ALEX CAMILLI BOTTENE","ADRIANO BORGES FERREIRA DA COSTA","PATRICIA RODRIGUES PESSÔA VALENTE","MARIANA CHIES SANTIAGO SANTOS","LUIZ FERNANDO GOMES ESTEVES","RAFAEL SCAVONE BELLEM DE LIMA","GUILHERME DA FRANCA COUTO FERNANDES DE ALMEIDA","GABRIELA DE OLIVEIRA JUNQUEIRA","ALLYNE ANDRADE E SILVA","FERNANDO RIBEIRO LEITE NETO","SÉRGIO RICARDO MARTINS","CAMILA PEREIRA BOSCOV","CAIO FARAH RODRIGUEZ","FABIO JOSE AYRES","LUIZ FELIPE CAMPOS FONTES","PEDRO JIMENEZ CANTISANO","URSULA MATTIOLI MELLO","PEDRO FERNANDES MAKHOUL","LUIZ FRANCISCO MODENESE VIEIRA","PAULO SERGIO OLIVEIRA RIBEIRO","SILVIO ABRAHAO LABAN NETO","JOÃO MANOEL PINHO DE MELLO","GUSTAVO RAMOS SAMPAIO","FABIO ADRIANO MIESSI SANCHES","LAURA DE ANDRADE KARPUSKA SANTOS","PAULO CILAS MARQUES FILHO","RODRIGO REIS SOARES","RINALDO ARTES","LETICIA FARIA DE CARVALHO NUNES","HEDIBERT FREITAS LOPES","TATIANA IWAI","CHARLES KIRSCHBAUM","NAERCIO AQUINO MENEZES FILHO","EDUARDO CORREIA DE SOUZA","BERNARDO DE OLIVEIRA GUERRA RICCA","SERGIO GIOVANETTI LAZZARINI","CRISTINE CAMPOS DE XAVIER PINTO","NATALIA PIRES DE VASCONCELOS","THIAGO JOSE CYSNEIROS CAVALCANTI SOARES","ADHEMAR VILLANI JUNIOR","ANTÔNIO BRUNO DE CARVALHO MORALES","CAMILA DE FREITAS SOUZA CAMPOS","IGOR FELIZATTI CARNEIRO DA CUNHA","DIOGO ABRY GUILLEN","GINO ABRAHAM OLIVARES LEANDRO","GUSTAVO BARBOSA SOARES","MARCOS SAWAYA JANK","MARCELO RODRIGUES DOS SANTOS","MARCO ANTONIO CESAR BONOMO","CARLOS ALBERTO FURTADO DE MELO","PRISCILA FERNANDES RIBEIRO","GUSTAVO MONTEIRO DE ATHAYDE","PRISCILA BORIN DE OLIVEIRA CLARO","EDUARDO FAINGOLD","DIEGO WERNECK ARGUELHES","IVAR ALBERTO GLASHERSTER MARTINS LANGE HARTMANN","ANDRÉ LUIS DE CASTRO MOURA DUARTE","PAULO DE PAIVA ROSA AMARAL","BRUNO VARELLA MIRANDA","GUILHERME FOWLER DE AVILA MONTEIRO","JOSÉ HELENO FARO","VINICIUS PICANÇO RODRIGUES","DANNY PIMENTEL CLARO","ADRIANA BRUSCATO BORTOLUZZO","PAULO FURQUIM DE AZEVEDO","CARLA SOFIA DIAS MOREIRA RAMOS","ROGERIO BIANCHI SANTARROSA","GIULIANA ISABELLA","SERGIO PINHEIRO FIRPO","MARCELO MARCHESINI DA COSTA","RICARDO PAES DE BARROS","NELSON RICARDO LAVERDE CUBILLOS","JULIANA INHASZ","SANDRO CABRAL","RUY MONTEIRO RIBEIRO","LUCAS MARTINS NOVAES","ISABELA BRANDÃO FURTADO","ANDREA MARIA ACCIOLY FONSECA MINARDI","LUCIANA YEUNG LUK TAI","PEDRO GARCIA DUARTE","MIGUEL MARIA CHARTERS DE OLIVEIRA BANDEIRA DA SILVA","GUSTAVO MOREIRA TAVARES"];
const VERIFIED_FALLBACKS = VERIFIED_FALLBACK_NAMES.map((name) => ({
  name,
  uuid: "",
  orcid: name.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() === "clio nudel radomysler" ? "0000-0003-3879-2421" : "",
  handle: "",
  source: "lista de pesquisadores Insper enviada pelo usuário"
}));

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
