---
name: functional-map
description: Mapeamento completo dos três domínios do projeto (Login/Autenticação, Landing Page, Admin), com regras de negócio, modelos de dados finais (AboutModel, HabilitiesModel), rotas e dependências incorporados; sem gaps abertos.
metadata:
  author: clovis-cli
  responsibility: Mapa de identificação dos domínios de negócio (bounded contexts), seus limites, dependências e ordem de implementação sugerida. Índice de domínios para geração de skills e para o fluxo spec-driven; não detalha regras de negócio nem duplica as decisões transversais, que vivem no discovery-answers.md.
---

# Domínios identificados

## Login / Autenticação

**Objetivo de negócio:** autenticar usuários da aplicação por papel (role), sem depender de
backend — usuários, senhas e sessão residem inteiramente no `localStorage` do navegador — e
liberar o acesso ao módulo Admin apenas a usuários autenticados.

**Evidência em material fornecido:** "AuthGuard para a rota de admin" e "Login" como um dos três
módulos (`business-input.md`, seção "Arquitetura de módulos e componentes"); estrutura de
usuários, roles e conta protegida, e confirmação do layout mínimo da rota `/login`
(`business-input.md`, seção "Autenticação e proteção de rota" e respostas aos gaps
`auth-mechanism-sem-backend` e `quantidade-paginas-landing-page`).

**Dependências:** nenhuma — é o domínio de base que os demais consultam para saber se o
usuário está autenticado e qual é o seu papel.

**Regras inferidas:**
- Rota raiz `/login`, módulo lazy-loaded, com formulário reativo (Reactive Forms) de
  usuário/senha.
- A rota `/login` exibe apenas o header reduzido, com o ícone de alternância de tema — não exibe
  as demais páginas do header público da Landing Page.
- Um `AuthGuard` bloqueia o acesso à rota `/admin` para usuários não autenticados.
- Existem dois usuários fixos semeados no `localStorage`: `user` (senha `123U`, role `user`) e
  `admin` (senha `123@`, role `admin`).
- Existe uma conta `superAdmin` com role `super`; é a única conta que não pode ser excluída pela
  tela de "Editar Usuários" do Admin.
- O armazenamento desses usuários deve ser no `localStorage` e armazenado utilizando o `encrypter.js` para uma maior segurança. As Roles devem ser criados como um enum.
- É possível criar novos usuários pela tela de "Editar Usuários" do módulo Admin (ver domínio
  Admin) e também ao clicar em um botão nessa tela (Olhar skill).
- A Landing Page (`/landing-page` e `/landing-page/:id`) é acessível tanto para visitantes não
  autenticados quanto para usuários autenticados; as diferenças de conteúdo entre os dois estados
  serão detalhadas pelo usuário em uma rodada futura (fora do escopo desta descoberta).
- O header da Landing Page exibe um botão de logout apenas quando há uma sessão ativa.

**Domain technical dependencies:**
- `localStorage` — único mecanismo de persistência para usuários, roles e sessão.
- Uso do `Encrypter.js` para criptografar os dados e aumentar a segurança.
- Roles DEVEM ser um Enum para evitar erros de escrita no futuro.
- Deve haver uma tela que abrirá o modal do Reactive Forms e apresentar feedbacks visuais (Carregando, acesso negado, sucesso).
- Reactive Forms (Angular) — formulário de login.
- Deve haver o botão de acessar a Landing Page sem login.
- Sistema de temas claro/escuro (SASS, paleta de cores fornecida) — a rota `/login` renderiza o
  mesmo header reduzido com alternância de tema usado nas demais rotas.
- Header responsivo em mobile — em telas mobile, o header reduzido de `/login` também colapsa em
  um ícone de menu hambúrguer, abrindo uma sidebar com o mesmo conteúdo reduzido (só o ícone de
  tema).

**Confiança:** alta — usuários iniciais, roles, proteção da conta `superAdmin`, a possibilidade
de criar novos usuários e o layout mínimo da rota `/login` têm evidência direta nas respostas do
usuário.

---

## Landing Page

**Objetivo de negócio:** apresentar publicamente o conteúdo institucional de uma pessoa (dados
pessoais, habilidades, contato) para qualquer visitante, com ou sem autenticação, permitindo que
cada usuário tenha sua própria Landing Page e servindo como ponto de entrada para a criação de
conta no Admin.

**Evidência em material fornecido:** estrutura de páginas, header, página inicial e página de
Habilidades (`business-input.md`, resposta ao gap `conteudo-landing-page`); confirmação da
quantidade de páginas, rota dinâmica por pessoa e campo de imagem em `AboutModel`
(`business-input.md`, resposta ao gap `quantidade-paginas-landing-page`); modelos finais de dados
(`business-input.md`, respostas aos gaps `estrutura-descricao-aboutme` e
`estrutura-entidade-skill`).

**Dependências:** `admin` — os dados dinâmicos de "Sobre Mim" e "Habilidades" exibidos aqui são
os mesmos cadastrados na tela de "Editar Dados" do módulo Admin; sem o Admin, a Landing Page não
teria conteúdo dinâmico para exibir.

**Regras inferidas:**
- Rotas raiz `/landing-page` (Landing Page padrão/demonstração) e `/landing-page/:id` (Landing
  Page de uma pessoa específica, de acordo com o `id` do array `AboutModel`), módulo lazy-loaded.
- Exatamente 4 páginas navegáveis pelo header: Página Inicial, Sobre Mim, Habilidades e uma única
  página de nome composto "Contato e Sobre" (conteúdo estático, modelo de dados completo a ser
  fornecido pelo usuário em rodada futura).
- Header com as páginas alinhadas à esquerda e, à direita, um botão de alternância de tema (ícone
  lua/sol, com tooltip) e um botão de logout com tooltip, visível apenas quando há sessão ativa.
- Página Inicial: logo, nome do projeto ("My Landing Page"), descrição, e 3 cards com efeito de
  brilho (`--brilho-card`) — (1) ícone + texto sobre o repositório GitHub do projeto, com link
  para esse repositório; (2) convite para criar uma nova pessoa/Landing Page, que ao ser clicado
  redireciona para o Admin exigindo criação de conta; (3) explicação sobre responsividade e troca
  de tema, que ao ser clicado alterna o tema da página.
- Página de Habilidades: card central dividido por uma linha tracejada com animação de "descida"
  ao aparecer; a partir dela surgem ramificações tracejadas também animadas — para a esquerda
  quando `HabilitiesModel.tipo` é `TipoHabilidade.SOFT`, para a direita quando é
  `TipoHabilidade.HARD`; cada habilidade é exibida como um cartão com animação fade-in e um ícone
  SVG local (ver dependência técnica de ícones no domínio Admin); abaixo do card central há
  botões de adicionar e remover habilidades alinhados em linha (row), cuja funcionalidade
  completa será detalhada pelo usuário em rodada futura.
- Página "Sobre Mim": exibe os dados de `AboutModel` da pessoa correspondente ao `id` da rota —
  nome, idade, carreira, profissão, empresa, a imagem de perfil (`AboutModel.imagem`, com a logo
  do projeto como placeholder padrão quando ausente) e a descrição (biografia, hobbies,
  desgostos, objetivos).
- Os dados de "Sobre Mim" (`AboutModel`) e de Habilidades (`HabilitiesModel`) exibidos nesta
  página são dinâmicos, provenientes do que for cadastrado na tela "Editar Dados" do Admin.

**Domain technical dependencies:**
- Sistema de temas claro/escuro (SASS, paleta de cores fornecida em `discovery-answers.md`) —
  alternância lua/sol no header e no terceiro card da página inicial.
- Ícones e imagens — placeholders temporários até a entrega definitiva dos ativos reais pelo
  usuário; a imagem de perfil de `AboutModel` usa a logo do projeto como placeholder padrão na
  ausência de imagem própria.
- `ArrayAboutModel` e `ArrayHabilitiesModel` do domínio Admin — fonte dos dados dinâmicos
  exibidos nas páginas Sobre Mim e Habilidades.
- `login` (indireto, via Admin) — o card de criação de nova pessoa redireciona para o fluxo de
  criação de conta do Admin.
- Header responsivo em mobile — em telas mobile, o header da Landing Page (páginas de navegação,
  tema, logout) colapsa em um ícone de menu hambúrguer que abre uma sidebar com o mesmo conteúdo.

**Confiança:** alta — estrutura de rotas, quantidade de páginas, header, página inicial e os
modelos de dados dinâmicos têm evidência direta nas respostas do usuário.

---

## Admin

**Objetivo de negócio:** oferecer uma área administrativa protegida por autenticação onde um
usuário autenticado gerencia o tema da aplicação, os usuários do sistema e os dados dinâmicos
exibidos na Landing Page (dados pessoais e habilidades de cada pessoa), tudo persistido em
`localStorage`.

**Evidência em material fornecido:** estrutura da página inicial, header e modelos de dados
finais (`business-input.md`, respostas aos gaps `dados-administrados-pelo-admin`,
`estrutura-descricao-aboutme`, `estrutura-entidade-skill` e `quantidade-paginas-landing-page`);
estrutura de usuários e roles (resposta ao gap `auth-mechanism-sem-backend`).

**Dependências:** `login` — a rota `/admin` é protegida pelo `AuthGuard` do domínio
Login / Autenticação; sem ele, a rota de Admin ficaria acessível a qualquer visitante.

**Regras inferidas:**
- Rota raiz `/admin`, módulo lazy-loaded, protegida por `AuthGuard`.
- Exatamente 3 páginas navegáveis pelo header do Admin: Página Inicial, Editar Dados e Editar
  Usuários.
- Página Inicial do Admin: breve apresentação sobre o painel e 3 cards — (1) alternar o tema da
  aplicação; (2) voltar para `/landing-page`; (3) ir para a página "Editar Dados".
- "Editar Usuários": cria novos usuários e exclui usuários existentes do domínio
  Login/Autenticação, exceto a conta `superAdmin` (role `Super`), que não pode ser excluída.
- "Editar Dados": gerencia os dados dinâmicos exibidos na Landing Page de cada pessoa, através de
  dois modelos:
  - `ArrayAboutModel { id: number, dados: AboutModel }`, em que `AboutModel` contém `nome`
    (string), `idade` (number), `carreira` (string), `profissao` (string), `empresa` (string),
    `imagem` (string — caminho da foto do usuário; usa a logo do projeto como placeholder padrão
    quando ausente) e `descricao: { biografia: string, hobbies: string, desgostos: string,
    objetivos: string }`. O `id` do array identifica a Landing Page de cada pessoa, permitindo
    replicar o modelo para múltiplas Landing Pages (consumido pela rota
    `/landing-page/:id` do domínio Landing Page).
  - `ArrayHabilitiesModel { id: number, habilidade: HabilitiesModel }`, em que `HabilitiesModel`
    contém `habilidade` (string) e `tipo: TipoHabilidade` (enum `SOFT = "soft-skill"`,
    `HARD = "hard-skill"`), além de uma referência a um ícone SVG local (ver dependência técnica
    abaixo).

**Domain technical dependencies:**
- `AuthGuard` do domínio Login / Autenticação — sem ele, a rota `/admin` fica desprotegida.
- `localStorage` — meio de persistência de usuários, do tema ativo e das entidades
  `ArrayAboutModel` e `ArrayHabilitiesModel`.
- Reactive Forms (Angular) — os formulários de "Editar Dados" e "Editar Usuários" usam formulário
  reativo.
- Sistema de temas claro/escuro (SASS, paleta de cores fornecida) — o primeiro card da página
  inicial do Admin alterna o tema.
- Ícones SVG locais — cada `HabilitiesModel` referencia um ícone SVG armazenado localmente no
  projeto (sem dependência de CDN externo), consumido tanto na tela "Editar Dados" quanto na
  página de Habilidades da Landing Page.
- Header responsivo em mobile — em telas mobile, o header do Admin colapsa em um ícone de menu
  hambúrguer que abre uma sidebar com o mesmo conteúdo (páginas de navegação, tema, logout).

**Confiança:** alta — a estrutura de páginas e os modelos finais de `AboutModel` e
`HabilitiesModel` têm evidência direta nas respostas do usuário.

---

# Decisões transversais refletidas nos domínios (referência)

Paleta de cores/tipografia, temas claro/escuro, responsividade, acessibilidade, Reactive Forms,
Lazy Loading, o runner de testes Jest, a arquitetura dumb components, Object Calisthenics nos
modelos e a estrutura da pasta `shared` são decisões transversais que afetam os três domínios e
estão registradas com seu destino em `discovery-answers.md` — não repetidas aqui além das
dependências técnicas listadas em cada domínio.

# Gaps abertos

Nenhum gap aberto nesta rodada.

# Ordem de implementação sugerida

0. `login` — módulo de autenticação, necessário antes de proteger qualquer rota; define usuários,
   roles e a conta `superAdmin`.
1. `admin` — depende do `AuthGuard` fornecido pelo domínio `login`; define o tema ativo e os
   modelos `ArrayAboutModel`/`ArrayHabilitiesModel` que a Landing Page consome.
2. `landing-page` — depende dos dados dinâmicos definidos no domínio `admin` e do fluxo de
   criação de conta exposto pelo `login`.
