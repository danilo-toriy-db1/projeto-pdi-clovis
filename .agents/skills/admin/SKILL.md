---
name: admin
description: >
  Esta é a documentação autoritativa do domínio Admin: cobre a área
  administrativa protegida por `AuthGuard`, suas 3 páginas (Página Inicial,
  Editar Dados, Editar Usuários), os modelos `ArrayAboutModel`/`AboutModel` e
  `ArrayHabilitiesModel`/`HabilitiesModel`/`TipoHabilidade` que alimentam a
  Landing Page, a tela de criação/exclusão de usuários e a alternância de
  tema pelo painel. Use ao criar, revisar ou alterar o módulo `/admin`,
  Editar Dados, Editar Usuários, `AboutModel`, `HabilitiesModel`,
  `ArrayAboutModel`, `ArrayHabilitiesModel` ou `TipoHabilidade`.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Admin

> **Maintaining this skill**
>
> Atualize este documento sempre que o comportamento de negócio deste domínio
> mudar de propósito, mantendo a skill fiel ao comportamento implementado.
> Uma divergência semântica entre esta skill e o código, sem uma decisão
> humana registrada que a resolva diretamente, é escalada para decisão
> humana — nunca ajustada por conta própria, nem aqui nem no código.

## Visão geral do domínio

O domínio Admin oferece a área administrativa da aplicação, acessível apenas
a usuários autenticados com a role adequada. É onde um usuário gerencia o
tema ativo da aplicação, os usuários do sistema (que pertencem ao domínio
Login / Autenticação) e os dados dinâmicos exibidos na Landing Page — os
dados pessoais e as habilidades de cada pessoa. Toda a persistência desses
dados é feita em `localStorage`, já que o projeto não tem backend, API ou
banco de dados.

O Admin depende do domínio Login / Autenticação: as rotas `/admin/{id}` e
`/admin/super` só são alcançáveis por uma sessão autenticada com role `admin`
ou `super`, através do `AuthGuard` desse domínio. Uma conta com role `admin`
recém-criada chega a um painel administrativo vazio, sem nenhum registro em
`ArrayAboutModel` — cabe ao próprio usuário preencher seus dados através da
tela "Editar Dados" para que sua Landing Page tenha conteúdo.

O domínio Landing Page depende do Admin: os dados de "Sobre Mim" e de
Habilidades exibidos em `/landing-page/:id` são exatamente os cadastrados
aqui, na tela "Editar Dados"; sem o Admin, a Landing Page não teria conteúdo
dinâmico para exibir. O `:id` refere-se ao id cadastrado.

## Regras de negócio

- O domínio Admin é servido por um único módulo lazy-loaded, alcançável por
  duas rotas: `/admin/{id}`, o painel de um `admin`, escopado à sua própria
  entrada em `ArrayAboutModel` identificada por esse mesmo `{id}`; e
  `/admin/super`, o ponto de entrada de acesso integral da role `super`.
  Ambas as rotas são protegidas pelo `AuthGuard` do domínio Login /
  Autenticação: sem sessão ativa, ou com sessão ativa de role `user`, o
  acesso é bloqueado.
- O header do Admin oferece exatamente 3 páginas navegáveis: Página Inicial,
  Editar Dados e Editar Usuários.
- **Página Inicial do Admin** apresenta uma breve descrição sobre o painel e
  3 cards:
  1. alternar o tema (claro/escuro) da aplicação;
  2. voltar para `/landing-page`;
  3. ir para a tela "Editar Dados".
- **Editar Usuários** é a tela deste domínio onde usuários do domínio Login /
  Autenticação são criados e excluídos. A listagem de usuários exibida
  nesta tela é escopada pela role de quem está autenticado: uma sessão com
  role `super` vê todos os usuários, incluindo outras contas `super`; uma
  sessão com role `admin` vê apenas os usuários com role `user` e a própria
  conta `admin`, além das outras contas `admin`. A exclusão nunca pode remover 
  a conta `superAdmin` (role `super`) — essa restrição é uma invariante do modelo 
  de usuário do domínio Login, aplicada aqui onde os usuários são listados e 
  removidos. A exclusão de um usuário exige confirmação prévia em um modal que 
  alerte sobre a exclusão ser permanente, só sendo efetivada depois que o usuário
  confirmar — a mesma exigência de confirmação que o domínio Login /
  Autenticação impõe para evitar exclusões acidentais. A criação de um novo
  usuário exige selecionar uma role válida do enum de roles do domínio
  Login (nunca uma string livre digitada), para não produzir um papel
  inválido; a role disponível para seleção é limitada pela role de quem está
  criando — uma sessão com role `super` pode criar um usuário com qualquer
  role (inclusive outra conta `super`), enquanto uma sessão com role `admin`
  só pode criar usuários com role `user` ou `admin`. Os usuários com role 
  `super` terão uma forma de ser excluída POSTERIORMENTE, mas a princípio,
  deixe apenas registrado que haverá essa forma no futuro.
- **Editar Dados** é a tela deste domínio onde os dados dinâmicos da Landing
  Page de cada pessoa são geridos, através de dois modelos:
  - uma lista de entradas `ArrayAboutModel`, uma por pessoa/Landing Page,
    cada uma identificada pelo seu `id`; essa tela permite criar uma nova
    entrada (uma nova pessoa/Landing Page), editar os dados de uma entrada
    existente e removê-la, com a remoção exigindo a mesma confirmação prévia
    em modal usada na exclusão de usuários em "Editar Usuários";
  - uma lista de entradas `ArrayHabilitiesModel`, cada uma associando um
    `id` de pessoa/Landing Page a uma habilidade (`HabilitiesModel`); como o
    mesmo domínio Landing Page consome `ArrayHabilitiesModel` para exibir as
    habilidades da pessoa correspondente ao `id` da rota
    `/landing-page/:id`, múltiplas entradas podem compartilhar o mesmo `id`
    (uma por habilidade daquela pessoa); a remoção de uma entrada também
    exige a mesma confirmação prévia em modal.
- Cada habilidade cadastrada tem um tipo (`TipoHabilidade`: `SOFT` ou
  `HARD`) e um ícone SVG local próprio, independente do tipo.
- O tema alternado pelo primeiro card da Página Inicial do Admin é o mesmo
  tema global da aplicação (o mesmo alternado no header da Landing Page e da
  tela `/login`) — não existe um tema exclusivo do painel Admin.

## Fluxos e ciclo de vida

- **Acesso ao painel:** uma sessão autenticada com role `admin` navega para
  `/admin/{id}` (o `{id}` vinculado à própria conta) e uma sessão `super`
  navega para `/admin/super`; em ambos os casos a navegação chega à Página
  Inicial do Admin.
- **Alternância de tema (card 1):** ao clicar no primeiro card da Página
  Inicial, o tema ativo da aplicação alterna entre claro e escuro,
  persistindo a escolha para as demais rotas.
- **Retorno à Landing Page (card 2):** ao clicar no segundo card, a navegação
  volta para `/landing-page`.
- **Edição de dados (card 3 e página "Editar Dados"):** ao clicar no
  terceiro card, ou ao navegar direto pelo header, o usuário chega à tela
  "Editar Dados", de onde:
  - cria uma nova entrada `ArrayAboutModel` (uma nova pessoa/Landing Page) ou
    edita uma existente, preenchendo `AboutModel` (nome, idade, carreira,
    profissão, empresa, imagem e a descrição composta); a remoção de uma
    entrada existente passa por um modal de confirmação antes de ser
    efetivada. Essa criação ou edição deve-se a conta que está com sessão ativa.
    O `admin` tem uma página sua de apresentação, logo, ele vê e edita as 
    informações referentes ao `/landing-page/:id`, onde o id será referente
    ao seu próprio. Caso esse admin não esteja vinculado a nenhum `id`, aí
    sim deverá ser criado um novo, onde os dados serão inseridos por ele.
  - cria, edita ou remove entradas `ArrayHabilitiesModel` associadas ao `id`
    de uma pessoa, cada uma com sua habilidade, tipo e ícone; a remoção
    também passa pelo mesmo modal de confirmação.
- **Gestão de usuários ("Editar Usuários"):** o usuário autenticado vê a
  lista de usuários escopada pela própria role (uma sessão `super` vê todos
  os usuários; uma sessão `admin` vê apenas usuários `user` e `admin`, cria 
  um novo usuário do domínio Login (definindo usuário, senha e uma role 
  permitida para a sua própria role) ou exclui um usuário existente da lista, 
  confirmando a exclusão em um modal de aviso antes de efetivá-la;
  a conta `superAdmin` nunca aparece como removível nessa lista. Lembre-se
  que o usuário pode ser criado no Login.
- **Conta admin recém-criada:** ao ser criada uma nova conta com role
  `admin`, essa conta chega a um painel Admin vazio (sem entrada própria em
  `ArrayAboutModel`), até que o próprio usuário cadastre seus dados pela tela
  "Editar Dados".

## Entidades e dados

- **`ArrayAboutModel`** — `{ id: number, dados: AboutModel }`. O `id`
  identifica a pessoa/Landing Page correspondente, permitindo replicar o
  modelo para múltiplas Landing Pages; é consumido pela rota
  `/landing-page/:id` do domínio Landing Page. Esse `id` deverá se relacionar
  com a conta do `admin` referente à ele, pois cada landing page tem seu responsável,
  ou seja, seu `admin`.
- **`AboutModel`** — Entidade:
```typescript  
  type AboutModel = { 
    nome: string, 
    idade: number, 
    carreira: string,
    profissao: string, 
    empresa: string, 
    imagem: string, 
    descricao: DescricaoAbout 
  } 
```
  O campo `imagem` é o caminho da foto do usuário; na
  ausência de imagem própria, usa a logo do projeto como placeholder padrão.
- **`DescricaoAbout`** — Entidade:
```typescript
  type DescricaoAbout = { 
    biografia: string, 
    hobbies: string, 
    desgostos: string, 
    objetivos: string 
  }
```
  A estrutura interna do campo `descricao` de `AboutModel`.
- **`ArrayHabilitiesModel`** — `{ id: number, habilidade: HabilitiesModel }`.
  O `id` identifica a pessoa/Landing Page a que aquela habilidade pertence,
  no mesmo espaço de identificadores usado por `ArrayAboutModel`.
- **`HabilitiesModel`** — Entidade: 
```typescript
  type HabilitiesModel = { 
    habilidade: string, 
    tipo: TipoHabilidade, 
    icone: string 
    }
``` 
  O campo `icone` contém apenas o nome do arquivo SVG local da
  habilidade (por exemplo, `"javascript.svg"`), nunca uma URL externa.
- **`TipoHabilidade`** (enum) — `SOFT = "soft-skill"`, `HARD = "hard-skill"`.

Este domínio gerencia diretamente `ArrayAboutModel`/`AboutModel` e
`ArrayHabilitiesModel`/`HabilitiesModel`/`TipoHabilidade`. Os modelos de
usuário, a role e a proteção da conta `superAdmin` manipulados pela tela
"Editar Usuários" pertencem ao domínio Login / Autenticação — este domínio
apenas expõe a tela onde esses dados são criados e excluídos.

## Restrições e validações

- A conta `superAdmin` (role `super`) nunca pode ser excluída pela tela
  "Editar Usuários" — invariante herdada do domínio Login / Autenticação.
- A listagem de usuários na tela "Editar Usuários" é escopada pela role de
  quem está autenticado: uma sessão `super` vê todos os usuários (incluindo
  outras contas `super`); uma sessão `admin` vê apenas usuários com role
  `user` e `admin`.
- A exclusão de qualquer usuário pela tela "Editar Usuários", e a remoção de
  qualquer entrada `ArrayAboutModel` ou `ArrayHabilitiesModel` pela tela
  "Editar Dados", exigem confirmação prévia em um modal de aviso sobre a
  exclusão ser permanente — invariante herdada do domínio Login /
  Autenticação para evitar exclusões acidentais, aplicada às duas telas
  deste domínio.
- Toda role atribuída a um usuário criado nesta tela deve ser um valor do
  enum de roles do domínio Login — nunca uma string livre — e restrita ao
  que a role de quem está criando permite: uma sessão `super` pode atribuir
  qualquer role, uma sessão `admin` só pode atribuir `user` ou `admin`.
- O acesso a qualquer página deste domínio exige uma sessão ativa válida com
  role `admin` ou `super`; sem isso, o `AuthGuard` do domínio Login bloqueia
  a navegação antes de qualquer página do Admin ser exibida.
- Um ícone de habilidade nunca é resolvido por URL de CDN externo — é sempre
  um arquivo SVG armazenado localmente no projeto.
- Deve-se priorizar a abstração para `Services` que utilizem Generics, para
  que a arquitetura seja de Dumb Components. Caso seja necessário ou um regra
  esteja restrita à apenas uma classe, aí a regra deve estar presente nela, 
  sendo exceção, enquanto a regra é implementar Dumb Components. 

## Integrações e dependências externas

Este domínio não integra nenhum serviço externo nomeado (sem backend, sem
API, sem provedor de terceiros) — toda a persistência é local ao navegador,
via `localStorage`. As dependências técnicas internas ao projeto que este
domínio exige para funcionar de forma completa e utilizável estão detalhadas
em `references/technical-dependencies.md`.
