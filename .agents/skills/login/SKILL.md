---
name: login
description: >
  Esta é a documentação autoritativa do domínio Login / Autenticação: cobre a
  autenticação sem backend baseada em `localStorage`, os usuários e roles
  fixos semeados na aplicação, a conta `superAdmin` protegida contra exclusão,
  o `AuthGuard` da rota `/admin` (restrito às roles `admin` e `super`), a
  criação de conta pelo modal de login e a tela `/login` com seus estados
  visuais de carregamento, acesso negado, credenciais inválidas e sucesso. Use
  ao criar, revisar ou alterar login, autenticação, `AuthGuard`, usuários,
  roles, `superAdmin`, sessão, logout, criação de conta ou a rota `/login`.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Login / Autenticação

> **Maintaining this skill**
>
> Atualize este documento sempre que o comportamento de negócio deste domínio
> mudar de propósito, mantendo a skill fiel ao comportamento implementado. Uma
> divergência semântica entre esta skill e o código, sem uma decisão humana
> registrada que a resolva diretamente, é escalada para decisão humana — nunca
> ajustada por conta própria, nem aqui nem no código.

## Visão geral do domínio

O domínio Login / Autenticação autentica os usuários da aplicação por papel
(role), sem depender de nenhum backend, banco de dados ou API: usuários,
senhas e a sessão ativa residem inteiramente no `localStorage` do navegador.
É o domínio de base do projeto — os demais domínios (Admin e Landing Page)
consultam este domínio para saber se há um usuário autenticado e qual é o seu
papel, mas o domínio Login não depende de nenhum outro.

Sua responsabilidade central é dupla: (1) validar as credenciais de
usuário/senha e manter a sessão ativa em `localStorage`; e (2) proteger a rota
`/admin` contra acesso de sessões sem role `admin` ou `super`, através de um
`AuthGuard`. A exclusão de usuários acontece fisicamente na tela "Editar
Usuários" do domínio Admin, mas os dados que essa tela manipula — o modelo de
usuário, o enum de roles e a regra de que a conta `superAdmin` nunca pode ser
excluída — pertencem a este domínio. A criação de novos usuários acontece em
dois pontos: na mesma tela "Editar Usuários" do Admin, e diretamente pelo
modal da tela `/login`, onde qualquer visitante pode abrir uma conta nova
escolhendo o tipo `user` ou `admin`. Uma conta `admin` criada por esse segundo
caminho chega a um painel administrativo vazio, sem nenhum dado próprio
cadastrado, até que o usuário preencha suas informações pela tela "Editar
Dados" do Admin.

## Regras de negócio

- Não há backend, API ou banco de dados: toda validação de credenciais e toda
  persistência de sessão ocorrem inteiramente no `localStorage` do navegador.
- Existem três contas fixas, semeadas na aplicação desde o início:
  - usuário `user`, senha `123U`, role `user`;
  - usuário `admin`, senha `123@`, role `admin`;
  - usuário `superAdmin`, senha `123Super`, role `super`.
- A conta `superAdmin` tem role `super`. Essa é a única conta que a tela
  "Editar Usuários" do domínio Admin nunca pode excluir — a proteção contra
  exclusão é uma restrição do modelo de usuário deste domínio, aplicada onde
  quer que usuários sejam listados ou removidos.
- As roles são modeladas como um enum (nunca como strings livres), para evitar
  erros de grafia na criação e verificação de papéis. Os identificadores de
  papel evidenciados pela fonte de negócio são `user`, `admin` e `super` — o
  texto original fornecido pelo usuário grafa esse último com inicial
  maiúscula (`Super`), enquanto o mapeamento funcional consolidado usa
  `super`; qualquer um dos dois nomes de membro do enum é uma transposição
  válida do mesmo papel. Deve-se manter o nome como `super`, ou seja, com inicial 
  minúscula.
- É possível criar novos usuários de duas formas: através da tela "Editar
  Usuários" do domínio Admin, ou diretamente pelo modal da tela `/login`, no
  qual o próprio visitante escolhe o tipo de conta (`user` ou `admin`) a
  criar. A exclusão de usuários existentes, por outro lado, só pode ocorrer
  pela tela "Editar Usuários" do Admin, e nunca em relação à conta
  `superAdmin` (ver regra acima). Deve-se sempre ter um modal de confirmação
  anterior a exclusão, que alerte o usuário sobre a exclusão ser permanente, e
  somente após o usuário confirmar que a exclusão deve ser feita. Isso para serve
  para evitar exclusões acidentais.
- Além da criação de uma conta nova, existe uma terceira forma de uma conta
  passar a ter role `admin`: uma sessão já autenticada com role `user` pode se
  autopromover a `admin`, mudando a role da própria conta já existente (sem
  criar um novo registro de usuário e sem exigir senha novamente), ao acionar
  o card "Sua Landing Page" da Página Inicial pública da Landing Page. Essa
  autopromoção também atualiza a sessão ativa em `localStorage` quando o
  usuário promovido é o mesmo da sessão corrente.
- Toda criação de conta (pela tela "Editar Usuários" ou pelo modal de login) e
  toda autopromoção a `admin` geram um registro de notificação de log no
  domínio Admin ("Novo usuário cadastrado" e "Nova Landing Page criada",
  respectivamente), usado apenas como histórico consultado pela role `super` —
  ver a seção de Notificações da skill `admin`.
- As senhas dos usuários são armazenadas em `localStorage` de forma
  criptografada, usando `Encrypter.js`, para não expor as credenciais em texto
  puro no armazenamento do navegador.
- A rota `/admin` é bloqueada por um `AuthGuard` para qualquer sessão sem role
  `admin` ou `super` — o que inclui tanto visitantes sem sessão ativa em
  `localStorage` quanto sessões autenticadas com role `user`. Apenas as roles
  `admin` e `super` têm acesso liberado ao painel Admin.
- A rota `/landing-page` (e `/landing-page/:id`) é acessível tanto por
  visitantes não autenticados quanto por usuários autenticados. As diferenças
  de conteúdo entre os dois estados (logado/deslogado) ainda não foram
  detalhadas pela fonte de negócio e ficam fora do escopo desta documentação
  até serem fornecidas.
- O cabeçalho (header) exibido nas rotas fora de `/login` exibe um botão de
  logout com tooltip apenas quando há uma sessão ativa; esse botão não aparece
  para visitantes não autenticados.
- A rota `/login` deve oferecer, sem exigir autenticação, uma forma de acessar
  a Landing Page sem fazer login.

## Fluxos e ciclo de vida

- **Tela `/login`:** a rota raiz `/login` é um módulo lazy-loaded e renderiza
  apenas o header reduzido da aplicação — com o ícone de alternância de tema
  claro/escuro — sem as demais páginas do header público da Landing Page. A
  tela oferece dois botões de entrada, lado a lado: **"Login"** (acesso geral
  à aplicação) e **"Painel Admin"** (acesso dedicado à área administrativa) —
  ambos abrem o mesmo modal contendo o formulário reativo (Reactive Forms) de
  usuário/senha. O modal guarda qual dos dois botões o abriu, informação que
  decide, ao final da validação, se o resultado é "Sucesso" ou "Acesso
  Negado". O mesmo modal também expõe o caminho de criação de uma conta nova,
  onde o visitante escolhe o tipo de conta (`user` ou `admin`) a criar.
  Durante uma tentativa de login, o modal apresenta cinco estados visuais de
  feedback ao usuário:
  - **Carregando** — enquanto a validação das credenciais contra os registros
    de `localStorage` está em andamento; - Para isso, crie um método que devolva
    uma promise de 3 segundos para simular o carregamento que haveria se fosse 
    uma aplicação concreta. Apenas para servir como temporizador para demonstrar
    esse modal. Reutilize esse método em todos os modais de estado e sempre que 
    ele for chamado, para simular essa chamada. O método não deve fazer nada além
    de esperar 3 segundos apenas.
  - **Acesso Negado** — quando usuário e senha correspondem a um registro
    válido com role `user`, e o modal foi aberto pelo botão "Painel Admin"; a
    sessão é gravada normalmente em `localStorage` (as credenciais são
    válidas), mas nenhuma navegação para o painel administrativo ocorre. O
    mesmo feedback de "Acesso Negado" é apresentado quando uma sessão já
    ativa com role `user` navega diretamente, pela URL, para uma rota do
    painel administrativo (`/admin/{id}` ou `/admin/control`) — nesse caso o
    bloqueio é do `AuthGuard`, que redireciona de volta para `/login` com o
    parâmetro de consulta `acessoNegado=true`.
  - **Credenciais Inválidas** — quando exatamente um dos dois campos (usuário
    ou senha) corresponde a um registro válido e o outro não, distinguindo
    esse caso do "Usuário Não Encontrado" abaixo, em que nenhum dos dois
    corresponde;
  - **Sucesso** — quando as credenciais são validadas e a sessão é
    estabelecida (ver "Login bem-sucedido" abaixo).
  - **Usuário Não Encontrado** - quando nem o usuário e nem a senha correspondem 
    a um registro válido em `localStorage`. Caso um deles esteja correto, deve-se
    aplicar o caso do "Credenciais Inválidas" citado acima.
- **Acessar Landing Page:** a mesma tela `/login` expõe um botão que permite
  seguir para a Landing Page sem autenticar-se, coerente com a regra de que a
  Landing Page é acessível a visitantes não autenticados.
- **Login bem-sucedido:** ao validar as credenciais, o domínio grava em
  `localStorage` um registro de sessão identificando o usuário autenticado e a
  sua role, independentemente de qual dos dois botões de entrada abriu o
  modal. Esse registro é o que o `AuthGuard` consulta para liberar as rotas do
  painel administrativo e o que o header consulta para decidir se exibe o
  botão de logout. Quando o login foi feito pelo botão "Login", ou pelo botão
  "Painel Admin" com uma role que tem permissão de painel (`admin` ou
  `super`), a navegação é redirecionada de acordo com a role autenticada:
  para `/landing-page` quando a role é `user`, para `/admin/{id}` quando a
  role é `admin` — sendo `{id}` o identificador vinculado à própria conta
  desse admin —, e para `/admin/control` quando a role é `super`. Quando o
  login foi feito pelo botão "Painel Admin" com role `user`, nenhuma dessas
  navegações ocorre — o feedback é "Acesso Negado" (ver acima).
- **Logout:** o botão de logout, exibido no header apenas quando há sessão
  ativa, remove o registro de sessão do `localStorage`, encerrando o acesso a
  `/admin` até um novo login.
- **Criação de usuário pela tela "Editar Usuários" do Admin:** essa tela cria
  um novo registro de usuário (usuário/senha/role) neste domínio, seguindo o
  mesmo mecanismo de criptografia via `Encrypter.js`.
- **Criação de conta pelo modal de login:** o visitante informa usuário, senha
  e o tipo de conta desejado (`user` ou `admin`) diretamente no modal da tela
  `/login`, sem precisar de nenhuma sessão prévia. O domínio cria o novo
  registro de usuário com a senha criptografada via `Encrypter.js`, do mesmo
  modo que a criação pela tela "Editar Usuários". Quando o tipo escolhido é
  `admin`, a conta resultante chega a um painel administrativo vazio (ver
  "Visão geral do domínio" acima). Pode existir mais de uma conta com role 
  `super`, no entanto, somente um usuário SUPER pode criar outro, visto que
  ele terá acesso INTEGRAL ao sistema. Admins só podem criar usuários com role
  `admin` ou `user`.
- **Exclusão de usuário (executada no domínio Admin):** a tela "Editar
  Usuários" remove um registro de usuário existente deste domínio, com a
  exceção obrigatória da conta `superAdmin` (role `super`), que nunca pode ser
  excluída por nenhum meio. Posteriormente haverá uma regra que irá alterar essa,
  tenha isso em registro.
- **Autopromoção a admin pela Landing Page:** uma sessão com role `user` que
  clica no card "Sua Landing Page" da Página Inicial pública da Landing Page
  tem a própria conta promovida de `user` para `admin` — o mesmo identificador
  de usuário passa a ter role `admin`, sem passar por um novo cadastro. Em
  seguida, a navegação segue direto para `/admin/{usuario}` (o próprio
  identificador do usuário promovido) com a tela "Editar Dados" já
  selecionada, permitindo que ele cadastre os dados da sua nova Landing Page
  imediatamente. Sessões que já têm role `admin` ou `super` que clicam nesse
  mesmo card apenas navegam para o próprio painel, sem nenhuma promoção.

## Entidades e dados

- **Role (enum):** identifica o papel de um usuário. Membros evidenciados:
  `user`, `admin` e `super`.
- **Usuário:** registro persistido em `localStorage`, contendo, no mínimo, um
  identificador de usuário, uma senha (armazenada de forma criptografada via
  `Encrypter.js`) e uma `Role`. Os usuários fixos iniciais são:

  | Usuário | Senha | Role |
  |---|---|---|
  | `user` | `123U` | `user` |
  | `admin` | `123@` | `admin` |
  | `superAdmin` | `123Super` | `super` |

- **Sessão:** registro persistido em `localStorage` enquanto há um usuário
  autenticado, identificando qual usuário está logado e sua `Role`; sua
  ausência significa "não autenticado". É consultado pelo `AuthGuard` da rota
  `/admin` e pelo header para decidir a exibição do botão de logout.

## Restrições e validações

- A conta `superAdmin` (role `super`) nunca pode ser excluída, em nenhum ponto
  do sistema que remova usuários — essa é uma invariante do próprio modelo de
  usuário deste domínio, não apenas uma validação de tela.
- Usuários `super` podem criar outros usuários de qualquer ROLE. Usuários `admin`
  só podem criar outros usuários `user` ou `admin`.
- Toda senha de usuário gravada em `localStorage` deve estar criptografada via
  `Encrypter.js`; nenhuma senha pode ser persistida em texto puro.
- A role de um usuário deve sempre ser um valor do enum de roles — nunca uma
  string livre — para impedir erros de grafia na criação ou verificação de
  papéis.
- O acesso à rota `/admin` exige uma sessão ativa válida em `localStorage` com
  role `admin` ou `super`; sem sessão ativa, ou com sessão ativa de role
  `user`, o `AuthGuard` bloqueia a navegação.
- A criação de conta pelo modal de login não exige nenhuma sessão prévia —
  qualquer visitante pode criar uma conta `user` ou `admin` por esse caminho.

## Integrações e dependências externas

Este domínio não integra nenhum serviço externo nomeado (sem backend, sem API,
sem provedor de identidade de terceiros) — toda a autenticação é local ao
navegador, via `localStorage`. As dependências técnicas internas ao projeto
que este domínio exige para funcionar de forma completa e utilizável estão
detalhadas em `references/technical-dependencies.md`.
