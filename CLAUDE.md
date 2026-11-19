# Esteira de Catalogação DSpace Insper

Aplicação estática que prepara metadados e arquivos (PDFs) para importação em lote no DSpace do Insper. Não usa IA nem servidor de aplicação: os PDFs são lidos no navegador com PDF.js (carregado de CDN) e o resultado é um ZIP para importação.

## Estrutura
- `index.html`: a aplicação inteira (HTML, CSS e JS no mesmo arquivo).
- `functions/api/`: Cloudflare Pages Functions usadas como proxy de consulta:
  - `doi.js`: metadados por DOI.
  - `cnpq.js`: apoio às sugestões de área CNPq.
  - `researchers.js`: pesquisadores Insper.

## Como rodar
- Local, só a interface: `python3 -m http.server 8080` e abrir http://localhost:8080 (as rotas `/api/*` não funcionam assim).
- Local com as Functions: `npx wrangler pages dev .`
- Deploy: Cloudflare Pages, preset `None`, build em branco, diretório de saída `.`. Cada commit no branch conectado publica automaticamente.

## Convenções
- O repositório e o site são públicos: não incluir dados internos, credenciais ou listas que não possam ser públicas.
- PDFs nunca saem do navegador; manter assim.
- Sugestões CNPq são preliminares (correspondência de palavras) e precisam de revisão humana.
- PDFs digitalizados sem camada de texto não são lidos (sem OCR).
- Não há testes automatizados; validar com PDFs reais com e sem DOI.
