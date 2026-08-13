# Spec: Login / Autenticação

## Overview

Autenticação por role sem backend (usuários, senhas e sessão inteiramente em `localStorage`), com dois pontos de entrada na tela `/login` — "Login" e "Painel Admin" —, cada um com seu próprio comportamento de sucesso e de bloqueio, e uma apresentação decorativa animada que tira o estado inicial dessa tela do aspecto estático. O diretório de execução hoje é o scaffold padrão do Angular CLI, sem nenhuma rota, serviço ou componente deste domínio implementado — esta spec cobre a materialização completa do domínio a partir desse ponto de partida em branco.

## Domain

- Slug: `login`
- Skill: [`.agents/skills/login/SKILL.md`](../../skills/login/SKILL.md)

## Scope

**In:**

- Autenticação local (usuário/senha) validada contra registros semeados em `localStorage`, sem backend.
- Modelo de `Role` como enum (`user`, `admin`, `super`) e as três contas fixas semeadas na aplicação.
- Sessão persistida em `localStorage`, consultada pelo `AuthGuard` e pelo header para decidir a exibição do botão de logout.
- Dois botões de entrada na tela `/login` — "Login" (acesso geral à aplicação) e "Painel Admin" (acesso dedicado à área administrativa) — abrindo o mesmo modal de credenciais (Reactive Forms), cada um com sua própria regra de sucesso.
- Os cinco estados visuais do modal de login: Carregando, Usuário Não Encontrado, Credenciais Inválidas, Acesso Negado e Sucesso.
- Redirecionamento pós-login por role: `user` para `/landing-page`, `admin` para `/admin/{id}` (o `id` vinculado à própria conta), `super` para `/admin/super`.
- Bloqueio por "Acesso Negado" quando uma conta role `user` tenta entrar pelo botão "Painel Admin", e quando uma sessão sem role `admin`/`super` (incluindo visitantes sem sessão) navega diretamente para qualquer rota do painel administrativo.
- `AuthGuard` protegendo as rotas do painel administrativo (`/admin/{id}`, `/admin/super`) contra qualquer sessão sem role `admin` ou `super`.
- Criação de conta pelo modal de login, sem exigir sessão prévia, escolhendo o tipo `user` ou `admin`.
- Regras de criação de usuário por role de quem cria (`super` cria qualquer role, incluindo `super`; `admin` cria apenas `user` ou `admin`) e a invariante de que a conta `superAdmin` (role `super`) nunca pode ser excluída.
- Botão na tela `/login` para acessar a Landing Page sem autenticação.
- Logout, removendo o registro de sessão do `localStorage`.
- Composição decorativa animada (brilho reluzente e bolhas em movimento suave) no estado inicial da tela `/login`, nos temas claro e escuro, respeitando `prefers-reduced-motion`.
- Infraestrutura transversal que este domínio precisa primeiro para materializar seu header reduzido: variáveis/mixins de tema claro-escuro, `ThemeService`, e o mecanismo de menu hambúrguer/sidebar responsiva.

**Out:**

- Tela "Editar Usuários" do Admin (listagem, criação por sessão autenticada, exclusão com modal de confirmação) — a tela em si é do domínio `admin`; esta spec só define o modelo e as invariantes que ela consome.
- Tela "Editar Dados" e os modelos `ArrayAboutModel`/`AboutModel`/`ArrayHabilitiesModel`/`HabilitiesModel` — domínio `admin`.
- Conteúdo completo da Landing Page (Sobre Mim, Habilidades, Contato e Sobre, cards da Página Inicial, `/landing-page/control`) — domínio `landing-page`.
- Funcionalidades aprimoradas de `/landing-page` para sessões role `user` — ainda não detalhadas pela fonte de negócio.
- Mecanismo futuro de exclusão de contas role `super` — já registrado como trabalho futuro, sem detalhamento nesta rodada.

## Domain boundary

**This spec implements:**

- Enum `Role` (`user`, `admin`, `super`).
- Entidade `Usuario` — usuário, senha criptografada via `Encrypter.js` e `Role`, persistida em `localStorage`.
- Entidade `Sessao` — usuário autenticado e sua `Role`, persistida em `localStorage`.
- `Encrypter` — criptografia de senha antes da persistência.
- `AuthService` (`shared/services`) — validação de credenciais, seed das três contas fixas, leitura/escrita/remoção de sessão, regra de criação de usuário por role de quem cria, e a invariante de não exclusão da conta `superAdmin`.
- `AuthGuard` — bloqueio das rotas do painel administrativo para qualquer sessão sem role `admin` ou `super`.
- Rota `/login` (módulo lazy-loaded): header reduzido, os botões "Login" e "Painel Admin", o botão de acesso à Landing Page sem login, e a composição decorativa animada do estado inicial da tela.
- Modal de login (Reactive Forms) com os cinco estados visuais e o sub-fluxo de criação de conta (`user` ou `admin`).
- Lógica de redirecionamento pós-login por role e por botão de entrada, incluindo o `{id}` da própria conta `admin` na rota de destino.
- Variáveis e mixins SASS do sistema de temas claro/escuro e o `ThemeService` (`shared/services`), na medida em que o header reduzido de `/login` precisa deles.
- Mecanismo de menu hambúrguer/sidebar responsiva aplicado ao header reduzido de `/login`.

**Belongs to other domains (cross-domain, does not become a task here):**

- Tela "Editar Usuários" (listagem escopada por role, criação por sessão autenticada, exclusão com modal de confirmação) → skill `admin`.
- Tela "Editar Dados" e os modelos `ArrayAboutModel`/`AboutModel`/`ArrayHabilitiesModel`/`HabilitiesModel` → skill `admin`.
- Associação entre o `{id}` de uma conta `admin` e sua entrada em `ArrayAboutModel`, incluindo o caso de uma conta `admin` recém-criada ainda sem `id` vinculado → skill `admin`.
- Cabeçalho completo e as 4 páginas públicas da Landing Page, e a rota `/landing-page/control` exclusiva à role `super` → skill `landing-page`.
- Funcionalidades aprimoradas de `/landing-page` para sessões role `user` → skill `landing-page`, quando detalhadas.

## User stories

1. Como visitante não autenticado, quero informar usuário e senha no botão "Login" da tela `/login`, para acessar a área correspondente à minha role sem depender de nenhum backend.
2. Como visitante não autenticado, quero tentar entrar diretamente no Painel Admin pelo botão dedicado da tela `/login`, para saber de forma clara quando minha conta não tem privilégio de administrador.
3. Como visitante não autenticado, quero criar uma conta escolhendo o tipo `user` ou `admin` pelo modal de login, para passar a usar a aplicação sem depender de outra pessoa cadastrar minha conta.
4. Como sessão com role `user` já autenticada, quero ser impedida de navegar diretamente para uma rota do painel administrativo, para que essa área continue restrita a quem tem role `admin` ou `super`.
5. Como visitante (autenticado ou não), quero acessar a Landing Page direto pela tela `/login` sem precisar autenticar, para explorar o conteúdo público sem compromisso.
6. Como sessão autenticada, quero encerrar minha sessão pelo botão de logout do header sempre que houver sessão ativa, para sair da aplicação quando quiser.
7. Como visitante na tela `/login`, quero ver uma composição visual com brilho reluzente e bolhas em movimento suave ao redor do header e dos botões, para perceber a tela como algo vivo e agradável, não estático.

## Acceptance criteria

**Story 1 — Login pelo botão "Login":**

- Given o modal de login aberto pelo botão "Login", when usuário e senha não correspondem a nenhum registro em `localStorage` (nem um nem outro), then o modal exibe "Carregando" por 3 segundos e, em seguida, "Usuário Não Encontrado".
- Given o mesmo modal, when exatamente um dos dois campos corresponde a um registro válido e o outro não, then o modal exibe "Carregando" por 3 segundos e, em seguida, "Credenciais Inválidas".
- Given o mesmo modal, when usuário e senha correspondem a um registro com role `user`, then o modal exibe "Carregando" por 3 segundos, em seguida "Sucesso", grava a sessão em `localStorage` e redireciona para `/landing-page`.
- Given o mesmo modal, when usuário e senha correspondem a um registro com role `admin`, then o modal exibe "Carregando" por 3 segundos, em seguida "Sucesso", grava a sessão em `localStorage` e redireciona para `/admin/{id}`, sendo `{id}` o identificador vinculado a essa conta.
- Given o mesmo modal, when usuário e senha correspondem a um registro com role `super`, then o modal exibe "Carregando" por 3 segundos, em seguida "Sucesso", grava a sessão em `localStorage` e redireciona para `/admin/super`.

**Story 2 — Painel Admin e `AuthGuard`:**

- Given o modal de login aberto pelo botão "Painel Admin", when usuário e senha correspondem a um registro com role `user`, then o modal exibe "Carregando" por 3 segundos e, em seguida, "Acesso Negado"; a sessão é gravada em `localStorage` (as credenciais são válidas), mas nenhuma navegação para o painel administrativo ocorre.
- Given o modal de login aberto pelo botão "Painel Admin", when usuário e senha correspondem a um registro com role `admin` ou `super`, then o resultado é o mesmo de "Sucesso" da Story 1 para essa role.
- Given uma sessão ativa com role `user`, when essa sessão navega diretamente para `/admin/{id}` ou `/admin/super` pela URL, then o `AuthGuard` bloqueia o acesso e apresenta o mesmo feedback de "Acesso Negado".
- Given nenhuma sessão ativa, when a navegação é direcionada para `/admin/{id}` ou `/admin/super` pela URL, then o `AuthGuard` bloqueia o acesso do mesmo modo.

**Story 3 — Criação de conta:**

- Given o modal de login aberto por qualquer um dos dois botões, when o visitante cria uma conta informando usuário, senha e o tipo `user`, then a conta é criada com a senha criptografada via `Encrypter.js` e role `user`, sem exigir nenhuma sessão prévia.
- Given o mesmo fluxo, when o visitante escolhe o tipo `admin`, then a conta é criada com role `admin`, chegando a um painel administrativo vazio até que seus dados sejam cadastrados pela tela "Editar Dados" do Admin.
- Given o mesmo fluxo, then a role `super` nunca é oferecida como tipo de conta criável pelo modal de login — apenas `user` e `admin`.

**Story 4 — Regras do modelo de usuário:**

- Given uma sessão com role `super` criando um novo usuário, when qualquer role do enum é selecionada, incluindo `super`, then a criação é permitida.
- Given uma sessão com role `admin` criando um novo usuário, when a role selecionada é `user` ou `admin`, then a criação é permitida; when a role selecionada é `super`, then a criação é rejeitada.
- Given qualquer tentativa de excluir a conta `superAdmin` (role `super`) por qualquer caminho que remova usuários, then a exclusão é sempre rejeitada.

**Story 5 — Acesso à Landing Page sem login:**

- Given a tela `/login`, when o visitante clica no botão de acesso à Landing Page sem autenticação, then a navegação segue para `/landing-page` sem exigir nenhuma credencial.

**Story 6 — Logout:**

- Given uma sessão ativa em qualquer rota fora de `/login`, when o visitante clica no botão de logout do header, then o registro de sessão é removido do `localStorage` e o acesso ao painel administrativo volta a ser bloqueado até um novo login.
- Given nenhuma sessão ativa, then o botão de logout não é exibido no header.

**Story 7 — Composição animada da tela `/login`:**

- Given a tela `/login` em seu estado inicial, when a tela é carregada, then o header reduzido e os botões "Login" e "Painel Admin" são exibidos sobre uma composição decorativa com brilho reluzente (reaproveitando a variável `--brilho-card`) e bolhas em movimento contínuo e suave, nos temas claro e escuro.
- Given a mesma tela, when o sistema do visitante sinaliza preferência por movimento reduzido (`prefers-reduced-motion`), then as animações de brilho e bolhas são suprimidas ou substituídas por uma versão estática equivalente, sem prejudicar a leitura do conteúdo.

## Cross-domain dependencies

- **`admin`** — consome o `AuthGuard`, o enum `Role` e a invariante de não exclusão da `superAdmin` para implementar a tela "Editar Usuários"; implementa as rotas `/admin/{id}` e `/admin/super` deste domínio, associando o `{id}` à entrada correspondente em `ArrayAboutModel`, inclusive para uma conta `admin` recém-criada ainda sem `id` vinculado.
- **`landing-page`** — recebe o redirecionamento de sessões role `user` após login bem-sucedido, exibe o botão de acesso sem login exposto por esta tela, e consulta a mesma sessão para decidir a exibição do botão de logout do seu header.

## Risks and observations

- As rotas `/admin/{id}` e `/admin/super` deste redirecionamento ainda não aparecem na documentação autoritativa do domínio `admin` (que hoje descreve apenas a rota plana `/admin`); esse é um drift deliberado desta rodada — o ajuste da documentação do domínio `admin` fica registrado para a fase de plano, sem alteração da skill agora.
- As funcionalidades aprimoradas de `/landing-page` para sessões role `user` foram explicitamente adiadas para uma rodada futura — permanecem fora de escopo até serem detalhadas pela fonte de negócio.
- O mecanismo futuro de exclusão de contas role `super`, já anotado nas skills de `login` e `admin`, continua sem detalhamento nesta rodada — apenas registrado como trabalho futuro.
- A composição animada da tela `/login` é puramente decorativa (CSS/SASS, sem biblioteca adicional, coerente com a restrição de stack do projeto) e não altera nenhum dos fluxos ou estados de negócio descritos nas demais histórias.
