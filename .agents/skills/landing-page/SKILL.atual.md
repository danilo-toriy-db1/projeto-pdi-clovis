<!--
Rascunho de comparação, não uma skill carregável: sem frontmatter de skill de
propósito, para não ser descoberto pelo mecanismo de carregamento de skills.
Documenta o comportamento do domínio Landing Page EXATAMENTE como
implementado no código hoje, para ser comparado manualmente com `SKILL.md`
(a fonte autoritativa) e apoiar a decisão de quais divergências entre os
dois devem ser corrigidas no código e quais devem virar a nova redação de
`SKILL.md`. Nenhum dos achados abaixo foi corrigido nesta rodada — o usuário
ainda não escolheu quais tratar.
-->

# Landing Page — estado atual do código

## Visão geral do domínio

Apresenta publicamente Sobre Mim, Habilidades e Contato de cada pessoa
cadastrada no domínio Admin, por `id`. Módulo lazy-loaded com 3 rotas
(`LANDING_PAGE_ROUTES`): `control` (exclusiva de `super`, ver abaixo), `:id`
(a Landing Page de uma pessoa) e `''` (URL sem `id`, página de orientação).

## Regras de negócio

- **`/landing-page/control` existe e é totalmente funcional** — componente
  `LandingPageControle`, com spec própria (7 casos de teste). Para uma
  sessão `super`, mostra uma navegação paginada (botões Anterior/Próximo)
  sobre todas as entradas de `ArrayAboutModel` ordenadas por `id`, cada
  página combinando os dados de "Sobre Mim" (nome, idade, carreira,
  profissão, empresa, biografia, imagem) e a lista de Habilidades da entrada
  atual num único cartão; sem entradas cadastradas, mostra "Nenhuma Landing
  Page cadastrada ainda." Para qualquer sessão que não seja `super` (ou
  nenhuma sessão), mostra a mesma página de "Landing Page não encontrada"
  usada para um `id` inexistente, sem revelar a existência da listagem. Bate
  exatamente com o que `SKILL.md` já descreve para essa rota.
- **As 4 páginas do header (Página Inicial, Sobre Mim, Habilidades, Contato e
  Sobre) trocam de conteúdo por um `@switch` interno em `LandingPageId`, sem
  navegação real de rota** — a URL nunca muda ao clicar nos links do header;
  o `id` da rota é o único segmento de URL, do início ao fim da navegação
  entre as 4 páginas. Isso é deliberado e coberto por teste
  (`landing-page.routes.spec.ts`), mas diverge do que
  `.agents/specs/003-landing-page/test-cases.md` (TC-3) descreve — lá se
  espera URLs distintas por página (ex.: `/landing-page/0/habilidades`).
- **Header** tem, à direita, 3 controles quando a sessão é `admin`/`super`
  (não 2): o botão de alternância de tema, o sino de notificações (contador
  de solicitações de habilidade pendentes para `admin`, ou de notificações
  não vistas para `super` — ver skill `admin`) e o botão de logout. Para uma
  sessão `user` ou sem sessão, o sino não aparece (só tema e, se logado,
  logout) — nesse caso são mesmo só 2 controles.
- **Card 1 da Página Inicial ("Repositório no GitHub")** aponta para
  `https://github.com/` (a URL genérica do GitHub, constante
  `URL_REPOSITORIO_GITHUB`), não para o repositório real deste projeto.
- **Card 2 da Página Inicial ("Sua Landing Page")** — o comportamento mudou
  em relação ao que `.agents/specs/003-landing-page/test-cases.md` (TC-13) e
  a Story 6 do `spec.md` descrevem: hoje, uma sessão `user` que clica nesse
  card tem a própria conta promovida a `admin` (`AuthService.
  promoverParaAdmin`) e é levada direto para `/admin/{usuario}` com a tela
  "Editar Dados" já selecionada — TC-13 ainda descreve o card sendo
  "bloqueado como se não houvesse sessão" para uma sessão `user`, navegando
  para `/admin` (comportamento anterior a esta mudança). Sem sessão
  nenhuma, o comportamento documentado continua valendo (vai para `/admin`,
  que força login/criação de conta). Com sessão `admin`/`super` já ativa, o
  clique leva direto à tela "Editar Dados" do Admin, como documentado.
- **Sugestão de habilidade (página de Habilidades)** — qualquer sessão
  autenticada (`user`, `admin` ou `super`, dona da página visitada ou não)
  pode abrir e enviar o formulário de sugestão; sem sessão, aparece um aviso
  pedindo login. A sugestão fica pendente até o admin dono da página aceitar
  ou rejeitar em "Solicitações de Habilidade" (domínio Admin); aceitar
  aplica a alteração de habilidade, rejeitar só descarta. Toda sugestão
  enviada, aceita ou rejeitada gera uma notificação de log do tipo sistema
  no domínio Admin. Isso já está descrito assim em `SKILL.md`.
- **`technical-dependencies.md`** justifica o uso de `NgOptimizedImage` para
  a imagem de perfil (`AboutModel.imagem`) na página "Sobre Mim" citando que
  ela é "um asset estático" — mas essa imagem normalmente vem de um upload
  em base64 (via `FileReader`, na tela "Editar Dados" do Admin), exatamente
  o caso que a própria frase da doc diz que `NgOptimizedImage` "não se
  aplica". O código de `sobre-mim.html` já faz a coisa certa (usa `[src]`
  comum, não `ngSrc`) — é a justificativa na doc técnica que está
  desalinhada com o dado real que descreve.

## Fluxos e ciclo de vida

Sem mudança em relação ao que `SKILL.md` já documenta, exceto o
comportamento do card 2 para sessão `user` (ver acima) e a ausência de
navegação real de rota entre as 4 páginas do header (ver acima).

## Entidades e dados

Sem mudança — `AboutModel`, `HabilitiesModel`, `TipoHabilidade`, consumidos
somente leitura do domínio Admin, como já documentado.

## Restrições e validações

Sem mudança em relação ao que `SKILL.md` já documenta.

## Integrações e dependências externas

O link do card 1 aponta para a URL genérica do GitHub, não para o
repositório real deste projeto (ver "Regras de negócio"). Fora isso, sem
mudança — nenhuma integração externa nomeada, tudo via `localStorage`.
