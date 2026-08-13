# Test cases: Login / Autenticação

## Preconditions

- Aplicação acessível em `http://localhost:4200` (servidor de desenvolvimento), no navegador, nos temas claro e escuro.
- `localStorage` contendo as três contas fixas semeadas por este domínio (ver `data-model.md`): `user`/`123U`/role `user`; `admin`/`123@`/role `admin`; `superAdmin`/`123Super`/role `super`.
- Onde um caso exige uma sessão ativa como pré-condição, ela é estabelecida por um login bem-sucedido anterior com a conta da role correspondente (Story 1).
- Os casos da Story 4 exercitam regras do `AuthService` que ainda não têm uma tela própria neste domínio — a tela "Editar Usuários" que as consumirá pertence ao domínio `admin` e está fora do escopo desta unidade. Esses casos chamam os métodos do `AuthService` diretamente (por exemplo, por um teste automatizado com `TestBed`), não por uma navegação de tela.
- Ferramentas do navegador para emular viewport mobile (até 767px) e a preferência `prefers-reduced-motion`, usadas pelos casos que dependem dessas condições.

## Story 1 — Login pelo botão "Login"

### TC-1 (mandatory) — usuário e senha inexistentes → Usuário Não Encontrado

1. Acesse a rota `/login`.
2. Clique no botão "Login".
3. No modal exibido, preencha `usuario` com um valor que não corresponda a nenhuma conta cadastrada (ex.: `conta-inexistente`) e `senha` com qualquer valor (ex.: `qualquer123`).
4. Envie o formulário.

**Expected:** o modal exibe o estado "Carregando" durante os 3 segundos simulados e, em seguida, muda para "Usuário Não Encontrado"; nenhuma sessão é gravada em `localStorage` e nenhuma navegação ocorre.

### TC-2 (mandatory) — usuário válido com senha errada → Credenciais Inválidas

1. Acesse `/login`.
2. Clique no botão "Login".
3. No modal, preencha `usuario` com `admin` (conta existente) e `senha` com um valor que não corresponda a nenhum registro (ex.: `senha-errada`).
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Credenciais Inválidas"; nenhuma sessão é gravada e nenhuma navegação ocorre.

### TC-3 (recommended) — senha válida com usuário errado → Credenciais Inválidas

1. Acesse `/login`.
2. Clique no botão "Login".
3. No modal, preencha `usuario` com um valor que não corresponda a nenhuma conta (ex.: `usuario-errado`) e `senha` com `123U` (senha válida da conta `user`).
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Credenciais Inválidas"; nenhuma sessão é gravada e nenhuma navegação ocorre.

### TC-4 (mandatory) — login bem-sucedido de conta role `user` → redireciona a `/landing-page`

1. Acesse `/login`.
2. Clique no botão "Login".
3. No modal, preencha `usuario` com `user` e `senha` com `123U`.
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Sucesso"; a sessão (usuário `user`, role `user`) é gravada em `localStorage` e a navegação segue para `/landing-page`.

### TC-5 (mandatory) — login bem-sucedido de conta role `admin` → redireciona a `/admin/{id}`

1. Acesse `/login`.
2. Clique no botão "Login".
3. No modal, preencha `usuario` com `admin` e `senha` com `123@`.
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Sucesso"; a sessão (usuário `admin`, role `admin`) é gravada em `localStorage` e a navegação segue para `/admin/{id}`, sendo `{id}` o identificador vinculado à conta `admin` usada no teste.

### TC-6 (mandatory) — login bem-sucedido de conta role `super` → redireciona a `/admin/super`

1. Acesse `/login`.
2. Clique no botão "Login".
3. No modal, preencha `usuario` com `superAdmin` e `senha` com `123Super`.
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Sucesso"; a sessão (usuário `superAdmin`, role `super`) é gravada em `localStorage` e a navegação segue para `/admin/super`.

## Story 2 — Painel Admin e `AuthGuard`

### TC-7 (mandatory) — role `user` tenta entrar pelo botão "Painel Admin" → Acesso Negado

1. Acesse `/login`.
2. Clique no botão "Painel Admin".
3. No modal, preencha `usuario` com `user` e `senha` com `123U`.
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Acesso Negado"; a sessão (usuário `user`, role `user`) ainda é gravada em `localStorage`, mas nenhuma navegação para o painel administrativo ocorre — o visitante permanece em `/login`.

### TC-8 (mandatory) — role `admin` entra pelo botão "Painel Admin" → mesmo resultado de Sucesso

1. Acesse `/login`.
2. Clique no botão "Painel Admin".
3. No modal, preencha `usuario` com `admin` e `senha` com `123@`.
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Sucesso"; a sessão é gravada e a navegação segue para `/admin/{id}`, o mesmo resultado do TC-5.

### TC-9 (recommended) — role `super` entra pelo botão "Painel Admin" → mesmo resultado de Sucesso

1. Acesse `/login`.
2. Clique no botão "Painel Admin".
3. No modal, preencha `usuario` com `superAdmin` e `senha` com `123Super`.
4. Envie o formulário.

**Expected:** o modal exibe "Carregando" por 3 segundos e, em seguida, "Sucesso"; a sessão é gravada e a navegação segue para `/admin/super`, o mesmo resultado do TC-6.

### TC-10 (mandatory) — sessão role `user` navega direto para `/admin/{id}` pela URL → `AuthGuard` bloqueia

1. Com a sessão de role `user` ativa (estabelecida pelo TC-4), digite diretamente a URL `/admin/{id}` na barra de endereço do navegador (usando o `{id}` de qualquer conta `admin`) e navegue até ela.

**Expected:** o `AuthGuard` bloqueia o acesso e apresenta o mesmo feedback de "Acesso Negado" do TC-7; a rota `/admin/{id}` não é exibida.

### TC-11 (mandatory) — sessão role `user` navega direto para `/admin/super` pela URL → `AuthGuard` bloqueia

1. Com a sessão de role `user` ativa (estabelecida pelo TC-4), digite diretamente a URL `/admin/super` na barra de endereço do navegador e navegue até ela.

**Expected:** o `AuthGuard` bloqueia o acesso e apresenta o mesmo feedback de "Acesso Negado"; a rota `/admin/super` não é exibida.

### TC-12 (mandatory) — visitante sem sessão ativa navega direto para `/admin/{id}` pela URL → `AuthGuard` bloqueia

1. Sem nenhuma sessão ativa (`localStorage` sem a chave `login.sessao`), digite diretamente a URL `/admin/{id}` na barra de endereço do navegador (usando o `{id}` de qualquer conta `admin`) e navegue até ela.

**Expected:** o `AuthGuard` bloqueia o acesso e apresenta o mesmo feedback de "Acesso Negado"; a rota `/admin/{id}` não é exibida.

### TC-13 (recommended) — visitante sem sessão ativa navega direto para `/admin/super` pela URL → `AuthGuard` bloqueia

1. Sem nenhuma sessão ativa, digite diretamente a URL `/admin/super` na barra de endereço do navegador e navegue até ela.

**Expected:** o `AuthGuard` bloqueia o acesso e apresenta o mesmo feedback de "Acesso Negado"; a rota `/admin/super` não é exibida.

## Story 3 — Criação de conta

### TC-14 (mandatory) — criação de conta tipo `user` pelo modal, sem sessão prévia

1. Sem nenhuma sessão ativa, acesse `/login`.
2. Clique no botão "Login" (ou "Painel Admin" — qualquer um abre o mesmo modal).
3. No modal, acesse o sub-fluxo de criação de conta.
4. Preencha `usuario` com um identificador novo (ex.: `novo-usuario-teste`), `senha` com um valor qualquer (ex.: `SenhaTeste1`) e selecione o tipo de conta `user`.
5. Confirme a criação.

**Expected:** a conta é criada com role `user`; a senha é armazenada em `localStorage` de forma criptografada, nunca em texto puro; a criação é concluída sem exigir nenhuma sessão prévia.

### TC-15 (mandatory) — criação de conta tipo `admin` pelo modal → painel administrativo vazio

1. Sem nenhuma sessão ativa, acesse `/login`.
2. Clique no botão "Login" (ou "Painel Admin").
3. No modal, acesse o sub-fluxo de criação de conta.
4. Preencha `usuario` com um identificador novo (ex.: `novo-admin-teste`), `senha` com um valor qualquer e selecione o tipo de conta `admin`.
5. Confirme a criação.
6. Faça login com a conta recém-criada pelo botão "Login".

**Expected:** a conta é criada com role `admin`; ao logar com ela, a navegação segue para o painel administrativo (`/admin/{id}`) correspondente a essa conta, chegando vazio — sem nenhuma entrada própria em `ArrayAboutModel` — até que seus dados sejam cadastrados pela tela "Editar Dados" do Admin.

### TC-16 (mandatory) — tipo de conta `super` nunca é oferecido na criação

1. Acesse `/login`.
2. Clique no botão "Login" (ou "Painel Admin").
3. No modal, acesse o sub-fluxo de criação de conta.
4. Observe as opções de tipo de conta disponíveis para seleção.

**Expected:** apenas as opções `user` e `admin` estão disponíveis; a opção `super` não é oferecida em nenhum momento desse fluxo.

## Story 4 — Regras do modelo de usuário

### TC-17 (mandatory) — sessão `super` cria usuário com qualquer role, incluindo `super`

1. Com uma sessão ativa de role `super` (estabelecida pelo TC-6), chame o método de criação de usuário do `AuthService` informando um `usuario` novo, uma `senha` e `role: super`.

**Expected:** o novo usuário é criado com role `super` e passa a constar no array sob a chave `login.usuarios` em `localStorage`.

### TC-18 (mandatory) — sessão `admin` cria usuário com role `user` ou `admin`

1. Com uma sessão ativa de role `admin` (estabelecida pelo TC-5), chame o método de criação de usuário do `AuthService` informando um `usuario` novo, uma `senha` e `role: user`.
2. Repita a chamada com outro `usuario` novo e `role: admin`.

**Expected:** os dois usuários são criados normalmente e passam a constar no array sob a chave `login.usuarios` em `localStorage`.

### TC-19 (mandatory) — sessão `admin` tenta criar usuário com role `super` → rejeitado

1. Com uma sessão ativa de role `admin` (estabelecida pelo TC-5), chame o método de criação de usuário do `AuthService` informando um `usuario` novo, uma `senha` e `role: super`.

**Expected:** a criação é rejeitada; nenhum novo registro com role `super` é adicionado ao array sob a chave `login.usuarios` em `localStorage`.

### TC-20 (mandatory) — tentativa de excluir a conta `superAdmin` é sempre rejeitada

1. Com uma sessão que teria permissão para excluir usuários (ex.: a sessão `super` do TC-6), chame o método de exclusão de usuário do `AuthService` informando o `usuario` `superAdmin`.

**Expected:** a exclusão é rejeitada; o registro `superAdmin`/role `super` permanece no array sob a chave `login.usuarios` em `localStorage`.

## Story 5 — Acesso à Landing Page sem login

### TC-21 (mandatory) — acessar a Landing Page sem autenticação pelo botão dedicado

1. Sem nenhuma sessão ativa, acesse `/login`.
2. Clique no botão de acesso à Landing Page sem autenticação.

**Expected:** a navegação segue para `/landing-page` sem exigir nenhuma credencial e sem abrir o modal de login.

## Story 6 — Logout

### TC-22 (mandatory) — logout remove a sessão e bloqueia o painel administrativo novamente

1. Realize o login bem-sucedido com a conta `admin` (TC-5), chegando a `/admin/{id}`.
2. No header exibido nessa rota, clique no botão de logout.
3. Digite diretamente a URL `/admin/{id}` na barra de endereço do navegador e navegue até ela.

**Expected:** após o clique no passo 2, o registro sob a chave `login.sessao` é removido do `localStorage`; a navegação do passo 3 é bloqueada pelo `AuthGuard`, com o mesmo feedback de "Acesso Negado" do TC-12.

### TC-23 (mandatory) — botão de logout não aparece sem sessão ativa

1. Sem nenhuma sessão ativa (por exemplo, logo após o TC-22, ou em uma aba anônima), acesse a rota `/landing-page`.
2. Observe o header exibido.

**Expected:** o botão de logout não é exibido no header.

## Story 7 — Composição animada da tela `/login`

### TC-24 (mandatory) — composição decorativa animada visível no estado inicial de `/login`

1. Sem nenhuma sessão ativa, acesse `/login` no tema claro.
2. Observe o plano de fundo da tela, atrás do header reduzido e dos botões "Login"/"Painel Admin".
3. Clique no ícone de alternância de tema do header e observe o mesmo plano de fundo no tema escuro.

**Expected:** em ambos os temas, uma composição decorativa é exibida com um efeito de brilho diagonal em looping suave e bolhas em movimento contínuo, atrás do header e dos botões, sem interferir na leitura ou no clique desses elementos.

### TC-25 (mandatory) — animações suprimidas sob `prefers-reduced-motion`

1. Configure o navegador para sinalizar preferência por movimento reduzido (`prefers-reduced-motion: reduce`) — por exemplo, pela emulação de mídia das ferramentas de desenvolvedor.
2. Acesse `/login`.

**Expected:** as animações de brilho e bolhas são suprimidas ou substituídas por uma versão estática equivalente; o header, os botões e o restante do conteúdo permanecem totalmente legíveis e clicáveis.

### TC-26 (recommended) — header reduzido de `/login` colapsa em hambúrguer no mobile

1. Acesse `/login` em uma viewport mobile (largura até 767px, por exemplo pela emulação de dispositivo das ferramentas de desenvolvedor).
2. Observe o topo da tela.
3. Toque no ícone de menu hambúrguer exibido no lugar do header fixo.

**Expected:** o header fixo reduzido desaparece e é substituído pelo ícone de hambúrguer; ao ser aberto, a sidebar reproduz apenas o ícone de alternância de tema — o mesmo conteúdo reduzido do header de `/login` —, sem itens de navegação nem botão de logout.
