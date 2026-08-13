# Tasks: Login / Autenticação

- [x] **T1. Atualizar a skill `login`**
  - Alvo: `.agents/skills/login/SKILL.md`, seção "Fluxos e ciclo de vida > Tela `/login`".
  - Mudança esperada: trocar a descrição do controle único que abre o modal e a definição ambígua/contraditória de "Acesso Negado" por: os dois botões de entrada ("Login" e "Painel Admin"); o gatilho preciso de "Acesso Negado" (role `user` tentando entrar pelo Painel Admin, ou uma sessão `user` já ativa navegando direto para uma rota do painel); e os destinos de redirecionamento `/admin/{id}` (role `admin`) e `/admin/super` (role `super`), no lugar da menção genérica a `/admin`.
  - Origem: Stories 1 e 2 e seus critérios de aceite em `spec.md` (drift deliberado registrado em `plan.md`, "Impact on the authoritative documentation").

- [x] **T2. Atualizar a skill `admin`**
  - Alvo: `.agents/skills/admin/SKILL.md`, seção "Regras de negócio" (descrição da rota raiz `/admin`).
  - Mudança esperada: trocar a menção à rota plana `/admin` por `/admin/{id}` (painel de uma conta `admin`, escopado ao seu próprio `id` em `ArrayAboutModel`) e `/admin/super` (entrada de acesso total da role `super`), no mesmo espírito já usado por `/landing-page/control` na skill `landing-page`.
  - Origem: Stories 1 e 2 e seus critérios de aceite em `spec.md` (mesmo drift deliberado registrado em `plan.md`).

- [x] **T3. Rota `/login` com header reduzido, tema, composição animada e acesso à Landing Page sem login**
  - Pré-requisito nomeado: introduzir o Jest (`jest-preset-angular`) como runner de testes, substituindo o Vitest do scaffold — esta é a primeira tarefa do projeto a entregar código testável.
  - Rota `/login` (lazy-loaded) com o header reduzido (ícone de alternância de tema), construindo aqui — por ser o primeiro domínio a precisar deles — as variáveis/mixins de tema claro-escuro, o `ThemeService` e o mecanismo de menu hambúrguer/sidebar responsiva para esse header.
  - Camada decorativa animada (brilho reluzente + bolhas) no plano de fundo da tela, nos dois temas, suprimida/substituída sob `prefers-reduced-motion`, conforme `ui/states.md`.
  - Botões "Login" e "Painel Admin" visíveis (sem lógica de submissão ainda) e o botão de acesso à Landing Page sem autenticação, já navegando para `/landing-page`.
  - Testes: `ThemeService`, o toggle de tema, o colapso do header em hambúrguer/sidebar no breakpoint mobile, a presença da composição animada e sua supressão sob `prefers-reduced-motion`, e a navegação do botão de acesso sem login. Casos de teste cobertos: TC-21, TC-24, TC-25, TC-26.

- [x] **T4. Login pelo botão "Login" e criação de conta pelo modal**
  - `AuthService` e `Encrypter` nascem aqui (`shared/services`), conforme `data-model.md` e `plan.md`: seed das três contas fixas em `localStorage` na primeira execução, validação de credenciais e leitura/escrita da sessão.
  - Modal de login (Reactive Forms) aberto pelo botão "Login", com os estados Carregando, Usuário Não Encontrado, Credenciais Inválidas e Sucesso, e o redirecionamento por role (`user` → `/landing-page`, `admin`/`super` → o destino do painel administrativo).
  - Sub-fluxo de criação de conta no mesmo modal, sem sessão prévia, com os tipos `user` e `admin` (nunca `super`).
  - Precondition: os destinos `/admin/{id}` e `/admin/super` do redirecionamento de sucesso são páginas do domínio `admin` (T2), ainda não implementadas; esta tarefa garante e testa apenas que a navegação correta é disparada (via espião do `Router`), não a renderização real dessas rotas.
  - Testes: `AuthService` (seed, validação de credenciais, escrita de sessão), `Encrypter` (`encrypt`/`matches`), e o componente do modal (transições entre os quatro estados, criação de conta, chamada de navegação por role). Casos de teste cobertos: TC-1, TC-2, TC-3, TC-4, TC-5, TC-6, TC-14, TC-15, TC-16.

- [x] **T5. Regras de criação e a invariante de não exclusão da conta `superAdmin`**
  - Estende o `AuthService` de T4 com a permissão de criação por role de quem cria (sessão `super` cria qualquer role, incluindo `super`; sessão `admin` cria apenas `user` ou `admin`) e com a invariante de que a conta `superAdmin` (role `super`) nunca é removida, em nenhum método de exclusão.
  - Sem tela própria nesta unidade: estas regras são consumidas pela tela "Editar Usuários" do domínio `admin`, ainda não implementada; os métodos do `AuthService` já ficam corretos e testados para quando essa tela existir.
  - Testes: unitários do `AuthService`, cobrindo a matriz de permissão por role de quem cria e a rejeição de exclusão da conta `superAdmin`. Casos de teste cobertos: TC-17, TC-18, TC-19, TC-20.

- [x] **T6. Painel Admin, "Acesso Negado" e `AuthGuard`**
  - Botão "Painel Admin" no modal criado em T4, reaproveitando o mesmo formulário e os mesmos quatro estados, com a resolução de sucesso/"Acesso Negado" dependendo de qual botão abriu o modal: role `user` correta por esse botão resulta em "Acesso Negado" (sessão gravada, sem navegação); `admin`/`super` resultam no mesmo sucesso e redirecionamento de T4.
  - `AuthGuard` (`shared/guards`, guarda funcional) bloqueando qualquer sessão sem role `admin`/`super` — aplicado como precondição às rotas `/admin/{id}` e `/admin/super` que o domínio `admin` (T2) registrará.
  - Precondition: a integração ponta a ponta do `AuthGuard` com rotas reais só se completa quando o domínio `admin` registra `/admin/{id}` e `/admin/super` com essa guarda; esta tarefa entrega e testa o guarda isoladamente, com sessões simuladas.
  - Testes: o componente do modal para o botão "Painel Admin" (Acesso Negado vs. sucesso, por role) e o `AuthGuard` (matriz de permissão por role e ausência de sessão, com o snapshot de rota simulado). Casos de teste cobertos: TC-7, TC-8, TC-9, TC-10, TC-11, TC-12, TC-13.

- [x] **T7. Logout no header compartilhado**
  - Estende o componente de header compartilhado (nascido em T3) com o botão de logout, visível apenas quando o `AuthService` (T4) reporta sessão ativa, chamando a remoção da sessão de `localStorage`; nunca exibido na variante reduzida usada por `/login`.
  - Testes: o componente de header cobrindo a exibição condicional do botão por estado de sessão, a variante reduzida nunca exibindo-o, e a remoção da sessão ao clicar. Casos de teste cobertos: TC-22, TC-23.
