# Esteira de Catalogação DSpace Insper

Aplicação estática que prepara metadados e arquivos para importação em lote no DSpace. Não depende do ChatGPT, de APIs de IA ou de um servidor de aplicação. PDFs e metadados são processados localmente no navegador.

## Publicação via Cloudflare Pages

1. No Cloudflare Pages, conecte este repositório do GitHub.
2. Selecione o preset `None`.
3. Deixe o comando de build em branco e use `/` como diretório de saída.
4. Publique. Novos commits no branch conectado podem gerar implantações automáticas.

Este repositório é público. O site publicado também fica acessível publicamente por padrão; configure Cloudflare Access na conta Cloudflare se quiser restringir quem pode acessá-lo. A aplicação não envia arquivos ou metadados para um servidor: cada usuário gera o ZIP SAF no próprio navegador.

## Limitações

- Os PDFs precisam ser anexados pelo usuário; a aplicação não os baixa dos URLs de origem.
- As áreas CNPq precisam ser informadas e conferidas.
- A associação de pesquisadores Insper pela lupa continua sendo feita no DSpace.
- O rascunho local guarda metadados no navegador atual, mas não guarda PDFs.
