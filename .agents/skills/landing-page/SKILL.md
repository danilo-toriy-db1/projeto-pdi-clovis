---
name: landing-page
description: >
  Esta é a documentação autoritativa do domínio Landing Page: cobre as rotas
  públicas `/landing-page` e `/landing-page/:id`, a rota `/landing-page/control`
  exclusiva à role `super`, as páginas de URL inválida e de Landing Page não
  encontrada, o header público com as 4 páginas (Página Inicial, Sobre Mim,
  Habilidades, Contato e Sobre), os 3 cards e as animações da Página Inicial
  e de Habilidades, e o consumo dos dados dinâmicos de
  `AboutModel`/`HabilitiesModel` do domínio Admin. Use ao criar, revisar ou
  alterar a Landing Page, o header público, a Página Inicial, Sobre Mim,
  Habilidades, Contato e Sobre, `/landing-page/:id`, `/landing-page/control`,
  ou as páginas de URL inválida/não encontrada.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Landing Page

> **Maintaining this skill**
>
> Atualize este documento sempre que o comportamento de negócio deste domínio
> mudar de propósito, mantendo a skill fiel ao comportamento implementado.
> Uma divergência semântica entre esta skill e o código, sem uma decisão
> humana registrada que a resolva diretamente, é escalada para decisão
> humana — nunca ajustada por conta própria, nem aqui nem no código.

## Visão geral do domínio

O domínio Landing Page apresenta publicamente o conteúdo institucional de uma
pessoa — dados pessoais, habilidades e contato — para qualquer visitante, com
ou sem sessão ativa. Cada pessoa tem sua própria Landing Page, replicável a
partir do mesmo modelo de dados, e a rota pública também funciona como ponto
de entrada para a criação de conta no domínio Admin, permitindo que um novo
visitante passe a ter a sua.

Este domínio depende do domínio Admin: os dados de "Sobre Mim" e de
Habilidades exibidos aqui são exatamente os cadastrados na tela "Editar
Dados" do Admin (`ArrayAboutModel`/`AboutModel` e
`ArrayHabilitiesModel`/`HabilitiesModel`) — sem o Admin, a Landing Page não
teria conteúdo dinâmico para exibir. Depende também, indiretamente através do
Admin, do domínio Login / Autenticação: o card de criação de uma nova pessoa
na Página Inicial encaminha o visitante ao fluxo de criação de conta desse
domínio. A Landing Page em si não gerencia usuários, sessão ou os modelos de
dados que exibe — apenas os consome e os renderiza.

## Regras de negócio

- Este domínio é servido por um único módulo lazy-loaded, com três formas de
  acesso por rota: `/landing-page/:id`, a Landing Page de uma pessoa
  específica, identificada pelo `id` da entrada correspondente em
  `ArrayAboutModel`; `/landing-page/control`, exclusiva a uma sessão com role
  `super`; e `/landing-page`, sem nenhum `id`, que não corresponde ao
  conteúdo de nenhuma pessoa, em caso isso aconteça, deve apresentar uma página
  estilizada que oriente o usuário a digitar um número para tentar encontrar o id
  correto. Ou seja, se o usuário esquecer de por o `/:id`, deve haver um input na
  tela para que o usuário digite, e também ter instruções e uma página personalizada
  para isso.
- Ao acessar `/landing-page` sem nenhum `id`, é exibida uma página informando
  que a URL é inválida, assim como citado acima — esta rota nunca resolve o 
  conteúdo de uma pessoa.
- Ao acessar `/landing-page/:id` com um `id` que não corresponde a nenhuma
  entrada de `ArrayAboutModel`, é exibida uma página de erro estilizada
  informando que a Landing Page não foi encontrada, com o mesmo espírito
  visual da página de erro 404 do GitHub, usada aqui como referência de
  estilo.
- Uma sessão com role `super` tem acesso a todas as Landing Pages cadastradas
  através da rota `/landing-page/control`, que exibe uma navegação paginada
  pessoa a pessoa sobre todas as entradas de `ArrayAboutModel`, um cartão por
  página; sem uma sessão `super` ativa, essa mesma rota exibe a página de
  Landing Page não encontrada, sem revelar sua existência a outras sessões.
  Uma sessão com role `admin` tem acesso apenas à sua própria Landing Page (a
  entrada de `ArrayAboutModel` vinculada à sua conta, ver domínio Admin); a
  role `user` não tem nenhuma Landing Page própria nem acesso a essa
  listagem.
- O header público oferece exatamente 4 páginas navegáveis, alinhadas à
  esquerda: Página Inicial, Sobre Mim, Habilidades e uma única página de nome
  composto "Contato e Sobre".
- À direita do header ficam dois controles, ambos com texto de tooltip (
  exigência de acessibilidade do projeto): um botão de alternância de tema
  (ícone de lua/sol, refletindo o tema ativo) e um botão de logout, visível
  apenas quando há uma sessão ativa — a existência de sessão é uma condição
  definida pelo domínio Login / Autenticação, e o clique aciona o fluxo de
  logout desse mesmo domínio.
- **Página Inicial** exibe a logo do projeto, o nome do projeto ("My Landing
  Page"), uma descrição, e 3 cards com o efeito visual de brilho diagonal
  (`--brilho-card`):
  1. um ícone e um texto explicativo sobre o repositório GitHub do projeto;
     ao ser clicado, direciona para esse repositório;
  2. um convite para criar uma nova pessoa/Landing Page; sem sessão ativa, ao
     ser clicado encaminha o visitante ao fluxo de criação de conta do
     domínio Admin — como a rota `/admin` é protegida pelo `AuthGuard` desse
     domínio, o visitante precisa criar conta antes de poder alcançar o
     Admin; com uma sessão já ativa, o clique pula esse fluxo e leva
     diretamente à tela "Editar Dados" do Admin;
  3. uma explicação sobre a responsividade do projeto e a troca de tema; ao
     ser clicado, alterna o tema ativo da aplicação (claro/escuro), o mesmo
     mecanismo usado pelo botão de tema do header.
- **Página de Habilidades** exibe um card central dividido ao meio por uma
  linha tracejada, com uma animação de "descida" no momento em que a linha
  aparece. A partir dessa linha central, surgem ramificações tracejadas,
  também animadas: para a esquerda quando a habilidade (`HabilitiesModel`)
  tem `tipo` igual a `TipoHabilidade.SOFT`, e para a direita quando é
  `TipoHabilidade.HARD`. Cada habilidade é exibida como um cartão individual,
  com animação fade-in ao aparecer e um ícone SVG local próprio (não
  determinado pelo tipo da habilidade). Abaixo do card central há botões de
  adicionar e de remover habilidade, alinhados em linha (row); a
  funcionalidade completa desses botões ainda não foi detalhada pela fonte
  de negócio e fica fora do escopo desta documentação até ser fornecida.
  Esses botões a princípio devem apenas existir. Funcionalidade dele será
  fornecida depois. Essa página deve ser a terceira no header.
- **Página "Sobre Mim"** exibe os dados de `AboutModel` da pessoa
  correspondente ao `id` da rota: nome, idade, carreira, profissão, empresa,
  a imagem de perfil (campo `imagem` de `AboutModel`, usando a logo do
  projeto como placeholder padrão na ausência de imagem própria) e a
  descrição — biografia, hobbies, desgostos e objetivos.
  Essa página deve ser a segunda no header.
- **Página "Contato e Sobre"** tem conteúdo estático; seu modelo de dados
  completo ainda não foi fornecido pela fonte de negócio e fica fora do
  escopo desta documentação até ser fornecido. Será fornecido posteriormente.
- Os dados exibidos nas páginas Sobre Mim e Habilidades (`AboutModel` e
  `HabilitiesModel`) são inteiramente dinâmicos, provenientes do que estiver
  cadastrado na tela "Editar Dados" do domínio Admin para o `id`
  correspondente — este domínio não permite editar esses dados diretamente,
  apenas os exibe.

## Fluxos e ciclo de vida

- **Acesso à Landing Page de uma pessoa:** um visitante (autenticado ou não)
  navega para `/landing-page/:id`; o domínio busca a entrada de
  `ArrayAboutModel` com aquele `id` para alimentar a página "Sobre Mim" e as
  entradas de `ArrayHabilitiesModel` com o mesmo `id` para alimentar a página
  de Habilidades.
- **Acesso a `/landing-page` sem id:** um visitante navega para
  `/landing-page` sem informar nenhum `id`; o domínio exibe a página de URL
  inválida, sem tentar resolver o conteúdo de nenhuma pessoa, e nessa página
  deve haver um input para que caso o usuário informe o id, ele já seja 
  redirecionado para a Landing Page desse ID.
- **Acesso a uma Landing Page inexistente:** um visitante navega para
  `/landing-page/:id` com um `id` que não corresponde a nenhuma entrada de
  `ArrayAboutModel`; o domínio exibe a página estilizada de Landing Page não
  encontrada, semelhante a tela do erro 404 do GitHub.
- **Acesso do super a todas as Landing Pages:** uma sessão com role `super`
  navega para `/landing-page/control` e recebe uma navegação paginada pessoa a
  pessoa sobre todas as entradas de `ArrayAboutModel` (ordenadas por `id`), com
  um único cartão por página combinando os dados de Sobre Mim e as
  Habilidades da entrada atual; sem uma sessão `super` ativa, essa mesma
  navegação resulta na página de Landing Page não encontrada, a mesma usada
  para um `id` inexistente. Essa paginação é exclusiva do usuário `super`, que
  precisa de acesso a todas as Landing Pages cadastradas.
- **Navegação entre páginas:** a partir de qualquer uma das 4 páginas, o
  visitante navega pelas demais através dos links do header, sem perder o
  `id` da rota quando presente.
- **Ir para o repositório do projeto (card 1 da Página Inicial):** ao
  clicar, o visitante é direcionado ao repositório GitHub do projeto.
- **Criar uma nova pessoa/Landing Page (card 2 da Página Inicial):** sem
  sessão ativa, ao clicar o visitante é encaminhado ao domínio Admin; como a
  rota `/admin` é protegida pelo `AuthGuard` desse domínio, a navegação é
  interceptada e o visitante precisa criar conta antes de prosseguir. Ao
  concluir a criação de conta com uma role `admin`, o visitante passa a ter
  uma conta que, inicialmente, não possui nenhuma entrada própria em
  `ArrayAboutModel` — cabe a ele cadastrar seus próprios dados pela tela
  "Editar Dados" do Admin para que sua Landing Page tenha conteúdo. Com uma
  sessão já ativa, o clique pula o fluxo de criação de conta e leva
  diretamente à tela "Editar Dados" do Admin.
- **Alternar tema (card 3 da Página Inicial, ou botão do header):** ao
  clicar em qualquer um dos dois controles, o tema ativo da aplicação
  alterna entre claro e escuro, persistindo a escolha para as demais rotas.
- **Logout (botão do header):** visível apenas com sessão ativa; ao clicar,
  aciona o mesmo fluxo de logout do domínio Login / Autenticação, encerrando
  a sessão.

## Entidades e dados

Este domínio não gerencia nenhuma entidade própria — ele apenas consome e
exibe entidades geridas pelo domínio Admin:

- **`AboutModel`** (via `ArrayAboutModel { id, dados: AboutModel }`) —
  campos exibidos na página "Sobre Mim": `nome`, `idade`, `carreira`,
  `profissao`, `empresa`, `imagem` (caminho da foto de perfil, com a logo do
  projeto como placeholder padrão na ausência de imagem própria) e
  `descricao` (`biografia`, `hobbies`, `desgostos`, `objetivos`).
- **`HabilitiesModel`** (via `ArrayHabilitiesModel { id, habilidade:
  HabilitiesModel }`) — campos exibidos na página de Habilidades:
  `habilidade` (nome da habilidade), `tipo` (`TipoHabilidade.SOFT` ou
  `TipoHabilidade.HARD`, que determina a ramificação para a esquerda ou para
  a direita a partir do card central) e o ícone SVG local associado a cada
  habilidade.
- **`TipoHabilidade`** (enum) — `SOFT = "soft-skill"`, `HARD = "hard-skill"`;
  o valor determina apenas o lado da ramificação na página de Habilidades,
  nunca o ícone exibido.

A definição completa desses modelos (tipos, validações de cadastro e regras
de ciclo de vida de criação/edição/remoção) pertence ao domínio Admin, que os
gerencia; este domínio apenas lê e exibe os dados por `id`. A listagem
exibida em `/landing-page/control` enumera as entradas existentes de
`ArrayAboutModel` para permitir a navegação até cada uma, sem introduzir
nenhuma entidade própria deste domínio.

## Restrições e validações

- As 4 páginas navegáveis pelo header são fixas: Página Inicial, Sobre Mim,
  Habilidades e a página única "Contato e Sobre" — nenhuma página adicional
  é exposta por este domínio.
- Este domínio nunca cria, edita ou remove `AboutModel` ou `HabilitiesModel`
  — essas operações pertencem exclusivamente à tela "Editar Dados" do
  domínio Admin.
- O ícone de cada habilidade exibida nunca é resolvido por URL de CDN
  externo — é sempre um arquivo SVG armazenado localmente no projeto (ver
  `references/technical-dependencies.md`).
- O botão de logout do header só é exibido com sessão ativa; sua exibição
  segue a mesma condição de sessão definida pelo domínio Login /
  Autenticação, nunca uma condição própria deste domínio.
- Os botões de tema (header e card 3 da Página Inicial) e de logout (header)
  exigem texto de tooltip, conforme a exigência de acessibilidade do
  projeto.
- A rota `/landing-page/control` só exibe a listagem de todas as Landing Pages
  para uma sessão com role `super`; qualquer outra sessão, ou nenhuma sessão
  ativa, recebe a mesma página de Landing Page não encontrada usada para um
  `id` inexistente, sem revelar a existência dessa listagem.
- `/landing-page` sem `id` e `/landing-page/:id` com um `id` inexistente
  nunca exibem conteúdo de nenhuma pessoa — a primeira sempre resulta na
  página de URL inválida, a segunda sempre na página de Landing Page não
  encontrada.

## Integrações e dependências externas

O repositório GitHub do projeto é a única integração externa nomeada deste
domínio: o primeiro card da Página Inicial contém um link estático para
esse repositório. Fora esse link, o domínio não integra nenhum serviço
externo (sem backend, sem API, sem provedor de terceiros) — toda a
persistência dos dados que exibe é local ao navegador, via `localStorage`,
gerida pelo domínio Admin. As demais dependências técnicas internas ao
projeto que este domínio exige para funcionar de forma completa e utilizável
estão detalhadas em `references/technical-dependencies.md`.
