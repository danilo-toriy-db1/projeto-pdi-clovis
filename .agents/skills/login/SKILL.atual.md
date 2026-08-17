<!--
Rascunho de comparação, não uma skill carregável: não tem frontmatter de skill
de propósito, para não ser descoberto pelo mecanismo de carregamento de
skills. Documenta o comportamento do domínio Login / Autenticação
EXATAMENTE como implementado no código hoje, para ser comparado manualmente
com `SKILL.md` (a fonte autoritativa) e apoiar a decisão de quais
divergências entre os dois devem ser corrigidas no código e quais devem
virar a nova redação de `SKILL.md`.
-->

# Login / Autenticação — estado atual do código

## Visão geral do domínio

O domínio autentica usuários por papel (role), inteiramente via `localStorage`,
sem backend. `AuthService` (`src/app/shared/services/auth.service/auth.service.ts`)
concentra toda a lógica: seed das contas fixas, validação de credenciais,
sessão, criação e edição de usuários, autopromoção a `admin`, e as
notificações de log geradas por essas ações. `authGuard`
(`src/app/shared/guards/auth.guard.ts`) protege as rotas do painel Admin.

## Regras de negócio

- Três contas fixas são semeadas em `localStorage` (chave `login.usuarios`) na
  primeira execução, cada uma com a senha já criptografada via `Encrypter`:
  `user`/`123U`/`Role.USER`, `admin`/`123@`/`Role.ADMIN`,
  `superAdmin`/`123Super`/`Role.SUPER`.
- Criação de usuário (`criarUsuario`) tem dois pontos de entrada: o modal de
  `/login` (sem sessão prévia, `roleDeQuemCria: null`) e a tela "Editar
  Usuários" do Admin (com a role de quem está autenticado). Em ambos os
  casos, a role atribuível é restrita por `rolesCriaveis`: uma sessão `super`
  (ou o cadastro público, que usa `null`) pode criar `user`/`admin`/`super`
  publicamente — **atenção**: `rolesCriaveis(null)` devolve `[USER, ADMIN]`,
  então o cadastro público (`roleDeQuemCria: null`) nunca consegue criar uma
  conta `super`, mesmo sem estar logado; apenas uma sessão já `super` cria
  outra `super`. Toda criação bem-sucedida registra uma notificação
  `CategoriaNotificacao.LOG` ("Novo usuário cadastrado") no domínio Admin.
- `atualizarUsuario` edita usuário, senha e role de uma conta já existente
  (usado pela tela "Editar Usuários" ao clicar em qualquer linha da lista).
  Está sujeita às mesmas regras de `rolesCriaveis` de quem edita, e a uma
  proteção dedicada: **uma conta cuja role atual é `super` nunca pode ter a
  role trocada para outra role por essa via** — a chamada é rejeitada
  (`false`) mesmo que quem edita seja outra sessão `super`; trocar apenas a
  senha de uma conta `super` (mantendo `role: Role.SUPER`) continua permitido.
  Essa proteção espelha a invariante de não exclusão da conta `superAdmin`.
- `promoverParaAdmin(usuario)` muda a role de uma conta já existente de
  `user` para `admin` **sem criar um novo registro nem exigir senha
  novamente**; atualiza a sessão ativa em `localStorage` se o usuário
  promovido for quem está logado no momento. É acionado pelo card "Sua
  Landing Page" da Página Inicial pública da Landing Page quando a sessão
  ativa é `user`. Rejeita (`false`) usuários inexistentes ou que já não são
  `user` (evitando repromover/reprocessar `admin`/`super`). Toda promoção
  bem-sucedida registra uma notificação `CategoriaNotificacao.LOG` ("Nova
  Landing Page criada").
- `excluirUsuario` remove um registro existente, rejeitando sempre que a role
  do registro é `Role.SUPER` — essa é a única proteção da conta `superAdmin`
  contra remoção (a proteção contra rebaixamento de role está em
  `atualizarUsuario`, ver acima).
- `authGuard` (`CanActivateFn`) libera a navegação quando
  `temPermissaoPainelAdmin(role)` (`role === ADMIN || role === SUPER`); caso
  contrário, chama `router.navigateByUrl('/login', { state: { acessoNegado:
  true } })` e retorna `false` — **não usa query param na URL**; o sinal de
  bloqueio viaja só pelo `state` da navegação do Router (não aparece em
  `location.href`).
- A tela `/login` (`LoginPage`) lê `history.state.acessoNegado` no
  construtor; se verdadeiro, abre o modal de login automaticamente com
  `intent: IntentLogin.PAINEL_ADMIN` e repassa `[acessoNegadoInicial]="true"`
  para `LoginModal`, que força seu estado interno para
  `ResultadoAutenticacao.ACESSO_NEGADO` via um `effect()` — o mesmo texto de
  feedback ("Acesso Negado: esta conta não tem permissão de administrador.")
  usado quando o próprio formulário do modal detecta o caso, exibido dentro
  do `app-feedback-modal`, sem exigir nenhuma nova tentativa de login. Isso
  cobre tanto um visitante sem sessão quanto uma sessão `user` que tentou
  acessar uma rota do painel administrativo diretamente pela URL.
- `autenticar(usuario, senha, intent)` grava a sessão sempre que as
  credenciais são válidas — mesmo quando o resultado será `ACESSO_NEGADO`
  (intent `PAINEL_ADMIN` com role `user`); só não há navegação de sucesso
  nesse caso.
- `resolverDestinoSucesso` mapeia `USER → /landing-page`, `ADMIN →
  /admin/{usuario}`, `SUPER → /admin/control`.
- `logout()` remove a sessão de `localStorage`, zera o signal e navega para
  `/login`.

## Fluxos e ciclo de vida

- **Login (botão "Login" ou "Painel Admin"):** preenche usuário/senha no
  modal de `/login`; `carregando` por `aguardarSimulacaoDeRede()` (3s fixos,
  reaproveitado por todo fluxo de espera simulada do domínio); em seguida um
  dos estados `usuario-nao-encontrado` / `credenciais-invalidas` /
  `acesso-negado` / `sucesso` (com navegação para o destino de
  `resolverDestinoSucesso`).
- **Acesso negado por navegação direta:** sessão sem permissão (ou nenhuma
  sessão) tenta uma rota do painel Admin pela URL → `authGuard` redireciona
  para `/login` via `state` → `LoginPage` abre o modal já em "Acesso Negado",
  sem exigir que o usuário clique em "Painel Admin" de novo.
- **Criação de conta (modal de `/login` ou "Editar Usuários"):** ambas chamam
  `criarUsuario`; a primeira nunca oferece `super` como opção de role no
  formulário (`formularioCriarConta`), a segunda oferece conforme
  `rolesCriaveis(roleDeQuemCria)`.
- **Edição de usuário existente ("Editar Usuários"):** clicar em qualquer
  linha da lista (inclusive a de `superAdmin`) abre o mesmo modal de
  criação, pré-preenchido, chamando `atualizarUsuario` ao salvar; se a conta
  editada for `super` e a role escolhida for outra, a chamada falha e a tela
  exibe a mensagem de erro genérica de falha ao salvar.
- **Autopromoção a admin (card "Sua Landing Page"):** sessão `user` clica →
  `promoverParaAdmin` → navegação direta para `/admin/{usuario}` com
  `vistaInicial: 'editar-dados'`, sem passar pelo modal de criação de conta.
- **Exclusão de usuário ("Editar Usuários"):** sempre rejeitada para
  `role === SUPER`, sem exceção por quem está excluindo.

## Entidades e dados

- **`Role`** (enum) — `USER = 'user'`, `ADMIN = 'admin'`, `SUPER = 'super'`.
- **`Usuario`** (`localStorage.login.usuarios`) — `{ usuario: string, senha:
  string (criptografada via Encrypter), role: Role }`.
- **`NovoUsuario`** — `{ usuario: string, senha: string, role: Role }`, usado
  tanto para `criarUsuario` quanto para `atualizarUsuario`.
- **`Sessao`** (`localStorage.login.sessao`) — `{ usuario: string, role:
  Role }`; ausência de chave = não autenticado.
- **`ResultadoAutenticacao`** (enum) — `USUARIO_NAO_ENCONTRADO`,
  `CREDENCIAIS_INVALIDAS`, `ACESSO_NEGADO`, `SUCESSO`.
- **`IntentLogin`** (enum) — `LOGIN`, `PAINEL_ADMIN`; decide se `autenticar`
  aplica a checagem de `ACESSO_NEGADO`.
- **`ResultadoLogin`** — `{ resultado: ResultadoAutenticacao, destino?:
  string }`.

## Restrições e validações

- Toda senha persistida passa por `Encrypter.encrypt`; nunca texto puro.
- `Role` é sempre um valor do enum, nunca string livre, em `criarUsuario` e
  `atualizarUsuario` (`rolesCriaveis` valida antes de qualquer gravação).
- Uma conta com `role === SUPER` nunca pode: (a) ser excluída
  (`excluirUsuario`), nem (b) ter a própria role trocada para outra
  (`atualizarUsuario`) — as duas invariantes são checadas em métodos
  diferentes, mas cobrem juntas toda mutação de uma conta `super` existente.
- `authGuard` bloqueia qualquer sessão sem `ADMIN`/`SUPER` (incluindo
  nenhuma sessão) para qualquer rota sob `/admin`, sem exceção por rota
  específica — o guard é o único ponto de bloqueio; não há guard adicional
  distinguindo `/admin/:id` de `/admin/control` (a distinção entre elas é
  feita por `escopoAdminGuard`, do domínio Admin, só para `/admin/:id`).

## Integrações e dependências externas

Nenhuma integração externa — toda persistência é local ao navegador via
`localStorage`. Depende de `NotificacaoService` (domínio Admin) para
registrar as notificações de log de criação de usuário e de autopromoção;
essa é uma dependência de saída (Login → Admin) que não existia antes das
notificações serem introduzidas.
