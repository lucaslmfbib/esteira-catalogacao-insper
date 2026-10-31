# Esteira de Catalogação DSpace Insper

Aplicação estática que prepara metadados e arquivos para importação em lote no DSpace. Não depende do ChatGPT, de APIs de IA ou de um servidor de aplicação. PDFs e metadados são processados localmente no navegador.

## Publicação via Cloudflare Pages

1. No Cloudflare Pages, conecte este repositório do GitHub.
2. Selecione o preset `None`.
3. Deixe o comando de build em branco e use `.` como diretório de saída.
4. Publique. Novos commits no branch conectado podem gerar implantações automáticas.

Este repositório é público. O site publicado também fica acessível publicamente por padrão; configure Cloudflare Access na conta Cloudflare se quiser restringir quem pode acessá-lo. A aplicação não envia arquivos ou metadados para um servidor: cada usuário gera o ZIP SAF no próprio navegador.

## Fluxo de entrada por PDF

1. Selecione os PDFs em **Começar pelos PDFs** e clique em **Ler PDFs e criar registros**.
2. Arquivos com o mesmo DOI são agrupados no mesmo registro e os campos multilíngues são preparados para revisão.
3. Arquivos sem DOI ficam em registros separados para evitar reunir obras diferentes por engano.
4. Revise a coleção, os metadados extraídos e as sugestões CNPq antes de gerar o ZIP. A planilha continua disponível como fluxo alternativo.

## Limitações

- Os PDFs precisam ser anexados pelo usuário; a aplicação não os baixa dos URLs de origem.
- O navegador pode extrair texto dos PDFs e sugerir metadados multilíngues; revise os campos antes da exportação. PDFs digitalizados sem camada de texto não são lidos por OCR.
- A leitura usa PDF.js carregado de CDN, mas o conteúdo dos PDFs é processado no navegador e não é enviado à CDN.
- As sugestões CNPq são preliminares, baseadas em correspondências locais de palavras, e devem ser conferidas na tabela oficial e no vocabulário do DSpace. A validação da plataforma não certifica a pertinência da classificação.
- A associação de pesquisadores Insper pela lupa continua sendo feita no DSpace.
- O rascunho local guarda metadados no navegador atual, mas não guarda PDFs.
