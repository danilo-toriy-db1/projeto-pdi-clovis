# Spec: Admin

## Overview

Painel administrativo protegido por autenticação, onde uma sessão `admin` ou `super` alterna o tema da aplicação, gerencia os usuários do domínio Login e mantém os dados dinâmicos de Sobre Mim e Habilidades consumidos pela Landing Page de cada pessoa. O diretório de execução ainda não tem nenhum código deste domínio — esta spec cobre a materialização completa do domínio Admin a partir desse ponto de partida em branco.

## Domain

- Slug: `admin`
- Skill: [`.agents/skills/admin/SKILL.md`](../../skills/admin/SKILL.md)

## Scope

**In:**

- Painel administrativo com 3 páginas navegáveis pelo header — Página Inicial, Editar Dados, Editar Usuários — acessível em `/admin/{id}` (sessão `admin`) e `/admin/super` (sessão `super`).
- Página Inicial com 3 cards: alternar o tema da aplicação, voltar para `/landing-page`, ir para "Editar Dados".
- "Editar Dados": uma sessão `admin` cria e edita sua própria entrada de Sobre Mim (`ArrayAboutModel`/`AboutModel`), criada automaticamente na primeira vez que essa sessão acessa a tela; uma sessão `super` cria, edita e remove a entrada de Sobre Mim de qualquer pessoa. Em ambos os casos, a tela também gerencia as habilidades (`ArrayHabilitiesModel`/`HabilitiesModel`) associadas a cada entrada, cada uma com seu ícone SVG local.
- "Editar Usuários": listagem de usuários do domínio Login escopada pela role de quem está autenticado, criação de um novo usuário restrita às roles que a role de quem cria permite, e exclusão de um usuário existente (exceto a conta `superAdmin`).
- Modal de confirmação compartilhado, exigido antes de qualquer remoção (entrada de Sobre Mim, habilidade ou usuário).
- Componente de feedback visual compartilhado (carregando, sucesso, mensagens customizadas ou padrão), reaproveitado pelas operações das duas telas.
- Resolução entre a sessão autenticada e sua entrada correspondente em `ArrayAboutModel`, incluindo a criação dessa entrada quando uma conta `admin` ainda não tiver nenhuma vinculada.
- Extensão do header compartilhado para exibir as 3 páginas navegáveis do painel.

**Out:**

- Autenticação, modelo de usuário, enum `Role`, `AuthGuard` e a invariante de não exclusão da `superAdmin` — pertencem ao domínio `login`; este domínio apenas os consome.
- Mecanismo de exclusão de contas `super` — já registrado como trabalho futuro pela fonte de negócio, sem detalhamento nesta rodada.
- Renderização das páginas públicas da Landing Page a partir de `ArrayAboutModel`/`ArrayHabilitiesModel` — domínio `landing-page`.
- Funcionalidades aprimoradas de `/landing-page` para sessões role `user` — ainda não detalhadas pela fonte de negócio.

## Domain boundary

**This spec implements:**

- Entidades `ArrayAboutModel`, `AboutModel`, `DescricaoAbout`, `ArrayHabilitiesModel`, `HabilitiesModel` e o enum `TipoHabilidade` (`SOFT`, `HARD`).
- Módulo lazy-loaded `admin`, com as rotas `/admin/:id` e `/admin/super`, cada uma com as 3 páginas navegáveis (Página Inicial na raiz, `editar-dados` e `editar-usuarios`).
- Componentes de página "Página Inicial", "Editar Dados" e "Editar Usuários".
- Serviço com Generics (`shared/services`) responsável pela persistência em `localStorage` e pelas regras de `ArrayAboutModel`/`ArrayHabilitiesModel`, incluindo a resolução entre o usuário da sessão autenticada e sua entrada correspondente em `ArrayAboutModel` (criando uma nova entrada quando uma conta `admin` ainda não tiver nenhuma vinculada).
- Extensão do `AuthService` do domínio Login (`shared/services`) com a listagem de usuários escopada por role, consumida pela tela "Editar Usuários".
- Componente de feedback visual compartilhado (`shared/components`), com os estados de carregando, sucesso e mensagem customizada ou padrão; o `LoginModal` do domínio Login passa a consumir esse componente em vez de implementar seus próprios estados visuais.
- Componente de modal de confirmação de exclusão compartilhado (`shared/components`), consumido pelas telas "Editar Dados" e "Editar Usuários".
- Extensão do componente `Header` compartilhado (`shared/components`) para receber e exibir os links de navegação das 3 páginas do painel.
- Gestão dos ícones SVG das habilidades, incluindo o ícone placeholder genérico, conforme a technical-skill `gestao-icones-svg-locais`.

**Belongs to other domains (cross-domain, does not become a task here):**

- Enum `Role`, entidade `Usuario`, `AuthGuard`, `Encrypter` e a validação de credenciais → skill `login`.
- Regras de criação (`criarUsuario`) e exclusão (`excluirUsuario`) de usuário, incluindo a invariante de não exclusão da `superAdmin` → skill `login`; esta spec apenas expõe a tela que as aciona.
- Renderização das páginas Sobre Mim e Habilidades da Landing Page a partir dos dados geridos aqui → skill `landing-page`.
- Mecanismo futuro de exclusão de contas `super` → ainda não detalhado, trabalho futuro.

## User stories

1. Como sessão `admin`, quero acessar meu próprio painel em `/admin/{id}`, para gerenciar o tema, os dados da minha Landing Page e os usuários do sistema aos quais tenho acesso.
2. Como sessão `super`, quero acessar o painel de acesso integral em `/admin/super`, para gerenciar o tema, os dados de qualquer Landing Page e qualquer usuário do sistema.
3. Como sessão autenticada no painel, quero usar os 3 cards da Página Inicial — alternar tema, voltar para a Landing Page, ir para "Editar Dados" —, para navegar rapidamente pelas ações mais comuns do painel.
4. Como sessão `admin`, quero editar minha própria entrada de Sobre Mim na tela "Editar Dados", criada automaticamente na primeira vez que acesso essa tela, para manter minha Landing Page atualizada sem depender de outra pessoa.
5. Como sessão `super`, quero criar, editar e remover a entrada de Sobre Mim de qualquer pessoa na tela "Editar Dados", para administrar o conteúdo de todas as Landing Pages.
6. Como sessão autenticada no painel, quero criar, editar e remover as habilidades associadas a uma entrada de Sobre Mim, cada uma com tipo e ícone próprios, para manter a página de Habilidades da Landing Page correspondente atualizada.
7. Como sessão autenticada no painel, quero confirmar em um modal antes de remover qualquer entrada de Sobre Mim, habilidade ou usuário, para não perder dados por um clique acidental.
8. Como sessão autenticada no painel, quero ver, na tela "Editar Usuários", apenas os usuários que minha role tem permissão de gerenciar, para não visualizar contas fora do meu alcance.
9. Como sessão autenticada no painel, quero criar um novo usuário escolhendo uma role entre as que minha própria role permite atribuir, para não conseguir produzir uma conta com privilégio maior que o meu.
10. Como sessão autenticada no painel, quero excluir um usuário existente, exceto a conta `superAdmin`, após confirmar a remoção em modal, para manter a base de usuários sem risco de exclusão acidental ou da conta protegida.

## Acceptance criteria

**Story 1 e 2 — Acesso ao painel:**

- Given uma sessão com role `admin`, when ela navega para `/admin/{id}` correspondente à própria conta, then a Página Inicial do Admin é exibida.
- Given uma sessão com role `super`, when ela navega para `/admin/super`, then a Página Inicial do Admin é exibida com acesso integral às demais telas.
- Given uma sessão sem role `admin`/`super`, ou nenhuma sessão ativa, when a navegação é direcionada a qualquer rota do painel, then o acesso é bloqueado pelo `AuthGuard` do domínio Login antes de qualquer página do Admin ser exibida.

**Story 3 — Página Inicial:**

- Given a Página Inicial do Admin, when o card 1 é clicado, then o tema ativo da aplicação alterna entre claro e escuro, persistindo a escolha para as demais rotas.
- Given a Página Inicial do Admin, when o card 2 é clicado, then a navegação segue para `/landing-page`.
- Given a Página Inicial do Admin, when o card 3 é clicado, then a navegação segue para a tela "Editar Dados" da mesma base de rota (`/admin/{id}/editar-dados` ou `/admin/super/editar-dados`).

**Story 4 — Editar Dados (sessão `admin`):**

- Given uma sessão `admin` sem nenhuma entrada vinculada em `ArrayAboutModel`, when ela abre "Editar Dados", then uma nova entrada é associada a essa sessão e o formulário de `AboutModel` é apresentado vazio para preenchimento.
- Given uma sessão `admin` com uma entrada já vinculada, when ela abre "Editar Dados", then o formulário é apresentado preenchido com os dados dessa entrada, e apenas essa entrada pode ser editada por essa sessão.
- Given o formulário de `AboutModel` preenchido, when a sessão salva sem informar o campo `imagem`, then a entrada é salva usando a logo do projeto como imagem padrão.

**Story 5 — Editar Dados (sessão `super`):**

- Given uma sessão `super`, when ela abre "Editar Dados", then a lista completa de entradas de `ArrayAboutModel` é exibida, com opção de criar uma nova, editar ou remover qualquer uma delas.
- Given uma tentativa de remover uma entrada de `ArrayAboutModel`, when a sessão `super` confirma a remoção no modal de confirmação, then a entrada e as habilidades associadas ao mesmo `id` são removidas.

**Story 6 — Habilidades:**

- Given uma entrada de `ArrayAboutModel` aberta em "Editar Dados", when a sessão cadastra uma nova habilidade informando nome, `TipoHabilidade` (`SOFT` ou `HARD`) e ícone, then uma nova entrada de `ArrayHabilitiesModel` é criada com o mesmo `id` da entrada de Sobre Mim.
- Given uma habilidade sem ícone específico informado, when ela é salva, then o ícone placeholder genérico de `gestao-icones-svg-locais` é usado.

**Story 7 — Confirmação de exclusão:**

- Given uma tentativa de remover uma entrada de `ArrayAboutModel`, uma habilidade ou um usuário, when a ação de remover é acionada, then o modal de confirmação compartilhado é exibido alertando que a exclusão é permanente, e a remoção só é efetivada após a confirmação nesse modal.

**Story 8 — Listagem de usuários:**

- Given uma sessão `super` na tela "Editar Usuários", then a lista exibe todos os usuários, incluindo outras contas `super`.
- Given uma sessão `admin` na tela "Editar Usuários", then a lista exibe apenas usuários com role `user` ou `admin` (incluindo a própria conta), sem exibir nenhuma conta `super`.

**Story 9 — Criação de usuário:**

- Given uma sessão `super` criando um novo usuário, when qualquer role do enum é selecionada, incluindo `super`, then a criação é permitida.
- Given uma sessão `admin` criando um novo usuário, when a role selecionada é `user` ou `admin`, then a criação é permitida; when a role selecionada é `super`, then a opção não é oferecida no formulário.

**Story 10 — Exclusão de usuário:**

- Given uma sessão autenticada na tela "Editar Usuários", when ela aciona a remoção de um usuário e confirma no modal, then o usuário é removido do domínio Login.
- Given a conta `superAdmin` (role `super`) listada na tela "Editar Usuários", then ela nunca é exibida como removível.

## Cross-domain dependencies

- **`login`** — fornece o `AuthGuard` que protege `/admin/{id}` e `/admin/super`, o enum `Role`, a entidade `Usuario`, o `Encrypter` e a validação de credenciais; o `AuthService` desse domínio é estendido com a listagem de usuários escopada por role e continua sendo o único responsável por criar, excluir e proteger a conta `superAdmin`. O `LoginModal` desse domínio passa a consumir o componente de feedback visual extraído nesta spec.
- **`landing-page`** — consome `ArrayAboutModel`/`AboutModel` e `ArrayHabilitiesModel`/`HabilitiesModel` geridos aqui para renderizar as páginas Sobre Mim e Habilidades de cada pessoa.

## Risks and observations

- A resolução entre o `usuario` (string) da sessão do domínio Login e o `ArrayAboutModel.id` (`number`) é mantida como uma responsabilidade interna deste domínio: o Admin guarda e resolve esse vínculo, sem exigir nenhuma mudança no modelo `Usuario`/`Sessao` do domínio Login.
- O componente de feedback visual compartilhado extrai os estados hoje embutidos no `LoginModal` (domínio Login) para `shared/components`; o `LoginModal` passa a consumir esse componente extraído em vez de renderizar seus próprios estados, sem alterar nenhuma das regras de negócio já documentadas na skill `login`.
- O mecanismo futuro de exclusão de contas `super`, já anotado nas skills de `login` e `admin`, continua sem detalhamento nesta rodada — apenas registrado como trabalho futuro.
- Os ícones de habilidade e a imagem de perfil seguem placeholders temporários até a entrega dos ativos definitivos, conforme decisão já registrada em `discovery-answers.md`.
