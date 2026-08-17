# User Stories — SEO

Comportamento transversal, compartilhado entre os módulos Login, Admin e Landing Page.

## Título e descrição por página

Como motor de busca ou rede social que acessa a aplicação,
quero encontrar um `<title>` e uma meta description específicos de cada página,
para exibir um resultado de busca ou preview de compartilhamento relevante.

**Critérios de aceite**
- Cada página de nível de rota (Login, Painel Administrativo, Controle de Landing Pages, URL
  inválida e a Landing Page de uma pessoa) chama `SeoService.atualizar` com um título e uma
  descrição próprios.
- Na Landing Page de uma pessoa (`/landing-page/:id`), o título usa o nome da pessoa e a
  descrição é derivada da profissão e empresa cadastradas (ou da biografia, na ausência delas).
- As tags `og:title`, `og:description`, `twitter:title` e `twitter:description` acompanham o
  título e a descrição da página atual.

## Bloqueio de indexação de áreas privadas

Como responsável por SEO da aplicação,
quero que áreas administrativas e de gate (login, painel admin, controle do super, URL inválida,
landing page não encontrada) nunca sejam indexadas,
para que motores de busca só indexem o conteúdo público de cada Landing Page.

**Critérios de aceite**
- Login, Painel Administrativo, Controle de Landing Pages, URL inválida e a Landing Page quando o
  id não corresponde a nenhuma entrada definem a meta `robots` como `noindex, nofollow`.
- A Landing Page de uma pessoa existente define a meta `robots` como `index, follow`.
- `public/robots.txt` reforça o mesmo bloqueio em nível de rota, desautorizando `/admin` e
  `/login` para todos os agentes.

## Limite estrutural da indexação

Como responsável por SEO da aplicação,
quero que fique registrado por que nem toda Landing Page pode ser encontrada por um motor de
busca externo,
para não prometer uma indexação que a arquitetura atual não permite entregar.

**Critérios de aceite**
- Como a única persistência é o `localStorage` do navegador de cada usuário (sem banco de dados
  ou API, conforme `AGENTS.md`), o conteúdo de uma Landing Page específica nunca chega a um
  servidor: nenhum crawler externo consegue rastreá-lo, independentemente das metatags.
- Por isso, não existe `sitemap.xml` listando Landing Pages individuais — apenas as metatags e o
  `robots.txt` acima, que cobrem o que é tecnicamente indexável nesta arquitetura.
