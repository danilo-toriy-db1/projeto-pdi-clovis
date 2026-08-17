<!--
Rascunho de comparação, não uma skill carregável: sem frontmatter de skill de
propósito, para não ser descoberto pelo mecanismo de carregamento de skills.
Documenta o comportamento do domínio Admin EXATAMENTE como implementado no
código hoje, para ser comparado manualmente com `SKILL.md` (a fonte
autoritativa) e apoiar a decisão de quais divergências entre os dois devem
ser corrigidas no código e quais devem virar a nova redação de `SKILL.md`.
-->

# Admin — estado atual do código

## Visão geral do domínio

Área administrativa protegida por `authGuard` (domínio Login), acessível em
`/admin/:id` (sessão `admin`, escopada à própria entrada) e `/admin/control`
(sessão `super`, acesso integral). Ambas as rotas renderizam o mesmo
componente `PainelAdmin`, que troca de "vista" internamente (sem navegação
real de rota) entre 4 páginas: Página Inicial, Editar Dados, Editar
Usuários, e Notificações (essa última exclusiva de `super`).

## Regras de negócio

- O header do painel oferece 3 páginas para qualquer sessão `admin`/`super`
  (Página Inicial, Editar Dados, Editar Usuários) e uma 4ª ("Notificações")
  só para `super`. A troca de página é feita por um signal interno
  (`vistaAtual` em `PainelAdmin`), nunca por navegação real de rota — a URL
  não muda ao trocar de página do painel.
- **Assimetria de guarda entre as duas rotas do painel:** `/admin/:id` tem
  `escopoAdminGuard` (redireciona uma sessão `admin` de volta para o próprio
  `/admin/{usuario}` se o `id` da URL for de outra conta); `/admin/control`
  não tem nenhum guard próprio, apenas o `authGuard` genérico que qualquer
  rota sob `/admin` já herda (exige `role` `admin` ou `super`, sem checar
  qual delas). Uma sessão `admin` que digita `/admin/control` na URL entra
  normalmente — o conteúdo renderizado é o de uma sessão `admin` comum
  (`ehSuper()` depende da role real, não da URL), mas nada bloqueia essa
  navegação como bloqueia o caminho inverso.
- **Página Inicial** mostra saudação, descrição e 3 cards diferentes por
  role:
  - `admin`: "Seja bem-vindo(a)!" + alternar tema / voltar para
    `/landing-page` / ir para "Editar Dados";
  - `super`: "Olá, Super admin!" + "Gerencie Landings Pages" (vai para
    "Editar Dados") / "Gerencie Usuários" (vai para "Editar Usuários") /
    "Envie sugestões" (abre um modal com um formulário de mensagem —
    Reactive Forms via `FormBuilder` — que hoje só faz `console.log` da
    mensagem enviada; não há envio real a nenhum destino ainda).
- **Editar Usuários** lista os usuários (escopados por role de quem vê,
  igual ao já documentado) como uma lista vertical de linhas de largura
  cheia dentro de um card único (`editar-usuarios__card-principal`), cada
  linha abrindo um modal de edição pré-preenchido ao ser clicada — inclusive
  a linha de `superAdmin`. Esse mesmo modal serve tanto para criar quanto
  para editar um usuário existente (usuário, senha e role), chamando
  `AuthService.atualizarUsuario` na edição; uma tentativa de mudar a role de
  uma conta `super` para outra role é rejeitada por essa chamada (ver skill
  `login`), e a tela então exibe a mensagem genérica de falha ao salvar.
- **Editar Dados** gerencia `AboutModel`/`HabilitiesModel` de cada pessoa.
  Uma sessão `super` sempre vê a lista completa de entradas (dentro de um
  card único, no mesmo estilo visual de "Editar Usuários"); ao clicar em
  "Editar" numa entrada (ou em "Criar nova entrada"), a edição de "Sobre
  Mim" e Habilidades dessa pessoa abre em um `app-edit-modal` (variante
  `[largo]`) sobreposto à própria lista, que continua visível por trás —
  fechar o modal volta para a lista. Uma sessão `admin` não vê essa lista:
  edita diretamente, inline, apenas a própria entrada vinculada à sua conta,
  sem esse modal externo.
  - Dentro dessa edição, os dados ficam divididos em **um único `FormGroup`
    Reactive Forms** (`formulario`, com `nome`/`idade`/`carreira`/
    `profissao`/`empresa`/`imagem` e um subgrupo `descricao` com seus 4
    campos), mas em **6 modais independentes**, cada um submetido
    separadamente: "Editar dados pessoais" (nome/idade/carreira/profissão/
    empresa/imagem), um modal por campo de descrição (biografia, hobbies,
    desgostos, objetivos) e um modal de habilidade (criar/editar). O botão
    "Salvar" do modal "Editar dados pessoais" valida **apenas os controles
    que esse modal realmente exibe** (nome/idade/carreira/profissão/
    empresa) — a validade dos 4 campos de descrição não bloqueia esse
    salvamento, ainda que o `FormGroup` inteiro os inclua como
    obrigatórios; isso evita que salvar os dados pessoais falhe em silêncio
    por causa de um campo de outro modal que o usuário não está vendo
    naquele momento. Os cards de descrição na tela principal continuam
    ganhando borda vermelha (indicando pendência) quando estão vazios e
    algum dos dois submits (`salvar()` ou `salvarDescricao()`) já foi
    tentado ao menos uma vez.
  - O botão "Resetar" de cada mini-formulário de descrição
    (`FormularioDescricaoAbout`) exige confirmação prévia num
    `app-confirm-modal` antes de gravar uma string vazia no campo — a mesma
    exigência de confirmação já usada para toda remoção no projeto.
  - A imagem de perfil (`AboutModel.imagem`) é sempre uma de duas coisas:
    uma string base64 (upload via `FileReader`) ou o valor padrão literal
    `/logo.svg`, garantido por `PessoaService.comImagemResolvida` (nunca
    fica vazia após salvar). A tela renderiza `ngSrc="/logo.svg"`
    (`NgOptimizedImage`) quando o valor é o placeholder, e `[src]` comum
    quando é o base64 enviado pelo usuário — nunca o mesmo binding para os
    dois casos.
- **Notificações** (exclusiva de `super`, ver detalhes na próxima seção) é a
  4ª página do header.
- Cada habilidade tem um ícone SVG próprio, mas hoje o único ícone
  selecionável no formulário é o placeholder (`placeholder.svg`) — os
  ícones reais das tecnologias ainda não foram entregues pela fonte de
  negócio; essa é uma decisão já registrada (não uma pendência nova).
- O tema alternado pelo card 1 da Página Inicial do `admin` é o mesmo tema
  global da aplicação.

## Notificações

Tela exclusiva de `super`, dividida em duas categorias, cada uma em um card
único com grade fixa de 3 colunas:

- **Notificações do sistema** — log do fluxo de sugestão de habilidade
  (domínio Landing Page): cada envio de sugestão cria um registro
  `pendente` com `usuarioOrigem` (quem sugeriu) e `usuarioDestino` (o admin
  dono da Landing Page visitada); o registro passa para `aprovada` ou
  `rejeitada` quando o admin decide em "Solicitações de Habilidade", sem
  nunca ser removido — a tela de Notificações é somente leitura, a decisão
  em si acontece em "Solicitações de Habilidade".
- **Notificações de log** — eventos administrativos sem workflow de
  aprovação: "Novo usuário cadastrado" (toda criação de conta, pelo modal de
  `/login` ou por "Editar Usuários") e "Nova Landing Page criada" (toda vez
  que uma sessão `user` se autopromove a `admin` pela Landing Page).
- O ícone de notificações do header, só para `super`, mostra quantas
  notificações (das duas categorias somadas) ainda não foram vistas; abrir a
  tela de Notificações marca todas como vistas (zerando essa contagem), mas
  as que estavam não vistas ao abrir continuam destacadas com uma cor
  diferente enquanto essa visita à tela durar. Para `admin`, o ícone de
  notificações continua mostrando a quantidade de solicitações de
  habilidade pendentes para ele, como sempre foi.

## Fluxos e ciclo de vida

- **Acesso ao painel:** sessão `admin` → `/admin/{id}` (escopado pelo
  próprio `id`, com `escopoAdminGuard`); sessão `super` → `/admin/control`
  (sem guard de escopo próprio, ver "Regras de negócio").
- **Conta `admin` recém-criada ou recém-promovida:** chega a um painel sem
  nenhuma entrada própria em `ArrayAboutModel` — só que, no ambiente atual
  de desenvolvimento/teste, `MockSeedService` já popula uma pessoa de
  exemplo ("Danilo", com 4 habilidades) vinculada à conta fixa `admin`
  assim que a aplicação inicia com `localStorage` vazio. Essa seed é
  deliberada e serve só para o dev/teste ter uma Landing Page com conteúdo
  para visualizar, e não é a regra de negócio documentada (que continua
  sendo: uma conta nova chega vazia) — as duas coisas coexistem por design:
  o comportamento *implementado para uma conta nova qualquer* continua
  "chega vazia"; é *apenas a conta fixa `admin`* que já nasce populada pela
  seed de conveniência.
- Os demais fluxos (criação/edição/remoção de entrada e de habilidade,
  criação/edição/exclusão de usuário) seguem os mesmos gatilhos já
  documentados, com os ajustes de UI descritos acima.

## Entidades e dados

Sem mudança nos modelos já documentados (`ArrayAboutModel`/`AboutModel`/
`DescricaoAbout`, `ArrayHabilitiesModel`/`HabilitiesModel`/`TipoHabilidade`,
`ArrayNotificacaoModel`/`Notificacao`/`CategoriaNotificacao`/
`StatusNotificacao`) além do que a skill `admin` já registra.

## Restrições e validações

- Toda remoção (`ArrayAboutModel`, `ArrayHabilitiesModel`, usuário, e agora
  também "resetar" um campo de descrição) exige confirmação prévia em modal.
- `atualizarUsuario` nunca muda a role de uma conta `super` para outra role
  (ver skill `login`) — reforçado aqui porque é acionado a partir da tela
  "Editar Usuários" deste domínio.
- `/admin/control` não tem proteção de escopo própria (ver "Regras de
  negócio") — item ainda em aberto, não tratado nesta rodada.

## Integrações e dependências externas

Sem mudança — segue sem nenhuma integração externa nomeada, tudo via
`localStorage`.
