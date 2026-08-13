# Test cases: Admin

## Preconditions

- Aplicação acessível em `http://localhost:4200` (servidor de desenvolvimento), no navegador, nos temas claro e escuro.
- `localStorage` contendo as três contas fixas semeadas pelo domínio Login (ver `.agents/specs/001-login/data-model.md`): `user`/`123U`/role `user`; `admin`/`123@`/role `admin`; `superAdmin`/`123Super`/role `super`.
- Onde um caso exige uma sessão ativa, ela é estabelecida por um login bem-sucedido anterior em `/login` com a conta correspondente — fluxo do domínio Login, fora do escopo desta unidade.
- Antes de cada caso que dependa do estado de `ArrayAboutModel`/`ArrayHabilitiesModel`, considere `localStorage` sem as chaves `admin.pessoas`, `admin.habilidades` e `admin.vinculo-usuarios`, exceto quando o próprio caso as popula em um passo anterior.

## Story 1 e 2 — Acesso ao painel

### TC-1 (mandatory) — sessão `admin` acessa `/admin/{id}` da própria conta

1. Acesse `/login`.
2. Clique no botão "Login" e entre com `usuario` `admin` e `senha` `123@`.

**Expected:** a navegação segue para `/admin/admin` e a Página Inicial do Admin é exibida, com o header mostrando as 3 páginas navegáveis (Página Inicial, Editar Dados, Editar Usuários).

### TC-2 (mandatory) — sessão `super` acessa `/admin/super`

1. Acesse `/login`.
2. Clique no botão "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`.

**Expected:** a navegação segue para `/admin/super` e a Página Inicial do Admin é exibida, com acesso integral às telas "Editar Dados" e "Editar Usuários".

### TC-3 (mandatory) — sessão role `user` navega direto para `/admin/admin` pela URL → bloqueada

1. Acesse `/login`, clique em "Login" e entre com `usuario` `user` e `senha` `123U`, chegando a `/landing-page`.
2. Digite diretamente a URL `/admin/admin` na barra de endereço e navegue até ela.

**Expected:** o `AuthGuard` do domínio Login bloqueia o acesso com o feedback de "Acesso Negado"; a Página Inicial do Admin não é exibida.

### TC-4 (mandatory) — sessão `admin` tenta acessar o painel de outra conta pela URL → redirecionada para o próprio painel

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin`.
2. Digite diretamente a URL `/admin/superAdmin` na barra de endereço e navegue até ela.

**Expected:** a navegação é redirecionada para `/admin/admin`, o painel da própria sessão `admin`; o conteúdo de outra conta nunca é exibido.

## Story 3 — Página Inicial

### TC-5 (mandatory) — card 1 alterna o tema da aplicação

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando à Página Inicial do Admin em `/admin/admin`.
2. Observe o tema ativo (claro ou escuro) e clique no card 1.

**Expected:** o tema ativo alterna entre claro e escuro; a escolha persiste ao navegar para as demais páginas do painel.

### TC-6 (mandatory) — card 2 volta para `/landing-page`

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando à Página Inicial do Admin.
2. Clique no card 2.

**Expected:** a navegação segue para `/landing-page`.

### TC-7 (mandatory) — card 3 vai para "Editar Dados"

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando à Página Inicial do Admin em `/admin/admin`.
2. Clique no card 3.

**Expected:** a navegação segue para `/admin/admin/editar-dados`, exibindo a tela "Editar Dados".

## Story 4 — Editar Dados (sessão `admin`)

### TC-8 (mandatory) — primeira vez que a sessão `admin` abre "Editar Dados" → nova entrada criada vazia

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin`.
2. No header, clique em "Editar Dados" (ou navegue para `/admin/admin/editar-dados`).

**Expected:** o formulário de `AboutModel` é exibido vazio; a imagem exibida é a logo do projeto (placeholder padrão); uma nova entrada é associada a essa sessão em `ArrayAboutModel` (chave `admin.pessoas`), e o vínculo `usuario → id` da conta `admin` passa a existir sob a chave `admin.vinculo-usuarios`.

### TC-9 (mandatory) — sessão `admin` edita e salva sua própria entrada

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-dados` (repetindo os passos do TC-8 se a entrada ainda não existir).
2. Preencha `nome`, `idade`, `carreira`, `profissao`, `empresa` e os quatro campos de `descricao` (biografia, hobbies, desgostos, objetivos).
3. Envie o formulário.

**Expected:** o estado de carregando é exibido e, em seguida, o de sucesso; a entrada correspondente ao `id` vinculado a essa sessão é atualizada em `ArrayAboutModel` com os dados informados; ao recarregar a tela, o formulário aparece preenchido com esses mesmos dados.

### TC-10 (recommended) — submissão de "Editar Dados" com campo obrigatório vazio

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-dados`.
2. Deixe o campo `nome` vazio e envie o formulário.

**Expected:** o campo `nome` recebe foco e a borda é pintada de vermelho; o formulário não é submetido.

## Story 5 — Editar Dados (sessão `super`)

### TC-11 (mandatory) — sessão `super` vê a lista completa de entradas em "Editar Dados"

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`, chegando a `/admin/super`.
2. No header, clique em "Editar Dados" (ou navegue para `/admin/super/editar-dados`).

**Expected:** a lista completa de entradas de `ArrayAboutModel` é exibida (incluindo qualquer entrada já criada por contas `admin`), com as opções de criar uma nova, editar ou remover qualquer uma delas.

### TC-12 (mandatory) — sessão `super` cria uma nova entrada de Sobre Mim para outra pessoa

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`, chegando a `/admin/super/editar-dados`.
2. Acione a criação de uma nova entrada e preencha `nome`, `idade`, `carreira`, `profissao`, `empresa` e `descricao`.
3. Envie o formulário.

**Expected:** o estado de carregando é exibido e, em seguida, o de sucesso; uma nova entrada é adicionada a `ArrayAboutModel` com um `id` que não colide com nenhum já existente, e passa a aparecer na lista da tela.

### TC-13 (mandatory) — sessão `super` remove uma entrada de Sobre Mim, junto com suas habilidades

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`, chegando a `/admin/super/editar-dados`, com uma entrada existente (criada no TC-12) que já tenha ao menos uma habilidade cadastrada (ver TC-14).
2. Acione a remoção dessa entrada na lista.
3. No modal de confirmação exibido, confirme a exclusão.

**Expected:** a entrada é removida de `ArrayAboutModel` e todas as entradas de `ArrayHabilitiesModel` com o mesmo `id` são removidas junto; nenhuma delas aparece mais na lista.

## Story 6 — Habilidades

### TC-14 (mandatory) — cadastro de habilidade com nome, tipo e ícone

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-dados` (com a entrada já criada pelo TC-8).
2. Na lista de habilidades, preencha o formulário com o nome da habilidade, selecione o tipo `SOFT` (ou `HARD`) e escolha um ícone.
3. Envie o formulário de habilidade.

**Expected:** uma nova entrada é adicionada a `ArrayHabilitiesModel` com o mesmo `id` da entrada de Sobre Mim dessa sessão, contendo o nome, o `TipoHabilidade` e o ícone informados; a nova habilidade passa a aparecer na lista.

### TC-15 (recommended) — cadastro de habilidade sem ícone específico → ícone placeholder

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-dados`.
2. Preencha o formulário de habilidade com nome e tipo, sem selecionar nenhum ícone específico.
3. Envie o formulário.

**Expected:** a habilidade é salva com o ícone placeholder genérico (`placeholder.svg`) como valor de `icone`.

### TC-16 (mandatory) — remoção de uma habilidade com confirmação

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-dados`, com ao menos uma habilidade cadastrada (TC-14).
2. Na lista de habilidades, acione a remoção da habilidade cadastrada.
3. No modal de confirmação exibido, confirme a exclusão.

**Expected:** a entrada correspondente é removida de `ArrayHabilitiesModel` e deixa de aparecer na lista.

### TC-17 (recommended) — edição de uma habilidade existente

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-dados`, com ao menos uma habilidade cadastrada (TC-14).
2. Acione a edição dessa habilidade e altere o nome ou o tipo.
3. Envie o formulário.

**Expected:** a entrada correspondente em `ArrayHabilitiesModel` é atualizada com os novos valores, mantendo o mesmo `id`.

## Story 7 — Confirmação de exclusão

### TC-18 (mandatory) — cancelar o modal de confirmação não efetiva a remoção

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`, chegando a `/admin/super/editar-usuarios`.
2. Acione a remoção de um usuário existente (que não seja `superAdmin`).
3. No modal de confirmação exibido, cancele a remoção.

**Expected:** o modal informa que a exclusão é permanente antes da confirmação; ao cancelar, o usuário permanece na lista e nenhum registro é removido de `localStorage`.

## Story 8 — Listagem de usuários

### TC-19 (mandatory) — sessão `super` vê todos os usuários, incluindo outras contas `super`

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`.
2. No header, clique em "Editar Usuários" (ou navegue para `/admin/super/editar-usuarios`).

**Expected:** a lista exibe todos os usuários cadastrados no domínio Login, incluindo a própria conta `superAdmin` e qualquer outra conta com role `super`.

### TC-20 (mandatory) — sessão `admin` vê apenas usuários `user`/`admin`, sem nenhuma conta `super`

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`.
2. No header, clique em "Editar Usuários" (ou navegue para `/admin/admin/editar-usuarios`).

**Expected:** a lista exibe apenas usuários com role `user` ou `admin` (incluindo a própria conta `admin`); nenhuma conta com role `super` (incluindo `superAdmin`) aparece na lista.

## Story 9 — Criação de usuário

### TC-21 (mandatory) — sessão `super` cria usuário com role `super`

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`, chegando a `/admin/super/editar-usuarios`.
2. No formulário de criação, preencha `usuario` com um identificador novo, `senha` com um valor qualquer, e selecione a role `super`.
3. Envie o formulário.

**Expected:** o novo usuário é criado com role `super` e passa a aparecer na listagem dessa mesma sessão.

### TC-22 (mandatory) — sessão `admin` cria usuário com role `user` ou `admin`

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-usuarios`.
2. No formulário de criação, preencha `usuario` com um identificador novo, `senha` com um valor qualquer, selecione a role `user` e envie.
3. Repita com outro `usuario` novo, selecionando a role `admin`.

**Expected:** os dois usuários são criados normalmente e passam a aparecer na listagem dessa sessão.

### TC-23 (mandatory) — sessão `admin` não tem a opção de role `super` disponível na criação

1. Acesse `/login`, clique em "Login" e entre com `usuario` `admin` e `senha` `123@`, chegando a `/admin/admin/editar-usuarios`.
2. Abra o formulário de criação de usuário e observe as opções de role disponíveis para seleção.

**Expected:** apenas as roles `user` e `admin` são oferecidas; a role `super` não aparece como opção selecionável.

## Story 10 — Exclusão de usuário

### TC-24 (mandatory) — exclusão de um usuário existente após confirmação

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`, chegando a `/admin/super/editar-usuarios`, com um usuário criado previamente (TC-21 ou TC-22) ainda presente na lista.
2. Acione a remoção desse usuário.
3. No modal de confirmação, confirme a exclusão.

**Expected:** o usuário é removido do domínio Login e deixa de aparecer em qualquer listagem da tela "Editar Usuários".

### TC-25 (mandatory) — a conta `superAdmin` nunca é exibida como removível

1. Acesse `/login`, clique em "Login" e entre com `usuario` `superAdmin` e `senha` `123Super`, chegando a `/admin/super/editar-usuarios`.
2. Localize a linha da conta `superAdmin` na lista.

**Expected:** a linha da conta `superAdmin` não exibe nenhuma ação de remoção.
