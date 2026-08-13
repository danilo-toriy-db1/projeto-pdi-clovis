# Tasks: Landing Page

- [x] **T1. Corrigir a skill `landing-page`**
  - Alvo: `.agents/skills/landing-page/references/technical-dependencies.md` — corrigir a menção à rota `/landing-page/super` para `/landing-page/control`, consistente com o restante da skill. Origem: Story 9 e 10 (Acesso integral do super), `spec.md` — decisão registrada na resposta ao gap `landing-page-nome-rota-control-vs-super`.
  - Alvo: `.agents/skills/landing-page/SKILL.md`, seção "Fluxos e ciclo de vida > Acesso do super a todas as Landing Pages" — reescrever a frase sobre a mecânica de paginação, hoje ambígua ("tanto na tela Sobre Mim, quanto na Habilidades"), para descrever explicitamente a paginação pessoa a pessoa: um cartão por página, combinando os dados de Sobre Mim e as Habilidades de uma única entrada de `ArrayAboutModel`. Origem: Story 9 e 10 (Acesso integral do super), `spec.md` — decisão registrada na resposta ao gap `landing-page-paginacao-controle-super`.

- [x] **T2. Rotas do módulo, shell da rota `:id`, página de não encontrada e Página Inicial**
  - `landing-page.routes.ts` (lazy-loaded, registrado em `app.routes.ts` como rota pública `landing-page`, sem guarda): rota `:id`, com o filho índice (`''`) reservado para a Página Inicial.
  - `LandingPageId` (shell): resolve a entrada de `ArrayAboutModel` correspondente ao `id` da rota via `PessoaService.buscarPorId()`; quando a entrada existe, renderiza o `Header` compartilhado (com as páginas navegáveis já registradas em `landing-page.routes.ts`) e um `<router-outlet>`; quando não existe (incluindo um `id` não numérico), renderiza `LandingPageNaoEncontrada` no lugar de ambos.
  - `LandingPageNaoEncontrada` (dumb, `components/`): página estilizada no espírito visual do erro 404 do GitHub, recebendo a mensagem exibida via `input()`.
  - `PaginaInicialLanding` (rota índice sob `:id`): logo do projeto, nome do projeto, descrição e os 3 cards — card 1 com link estático para o repositório GitHub do projeto; card 2 navegando, via `AuthService.temPermissaoPainelAdmin`/`sessao`, para `/admin/{usuario}/editar-dados` ou `/admin/super/editar-dados` quando a sessão tem permissão de painel, ou para `/admin` caso contrário; card 3 acionando `ThemeService.alternarTema()`.
  - Testes: `LandingPageId` (renderização condicional por `id` existente, inexistente e não numérico), `LandingPageNaoEncontrada`, `PaginaInicialLanding` (destino do card 2 por tipo de sessão, alternância de tema pelo card 3 e pelo botão do `Header`, visibilidade do botão de logout por sessão ativa). Casos de teste cobertos: TC-8, TC-9, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15, TC-16, TC-17.

- [x] **T3. Sobre Mim e navegação entre páginas preservando o `id`**
  - Rota filha `sobre-mim`, adicionada aos filhos de `:id` em `landing-page.routes.ts`, e a página passa a fazer parte das páginas navegáveis do `Header` recebidas por `LandingPageId`.
  - `SobreMim`: exibe os dados de `AboutModel` da entrada resolvida por `LandingPageId` — nome, idade, carreira, profissão, empresa, a imagem de perfil (via `NgOptimizedImage`) e a descrição (biografia, hobbies, desgostos, objetivos).
  - Testes: `SobreMim` (renderização dos dados da entrada, incluindo uma entrada cuja imagem foi resolvida para a logo do projeto) e a navegação Página Inicial ↔ Sobre Mim preservando o `id` na URL. Casos de teste cobertos: TC-1, TC-2, TC-3.

- [x] **T4. Habilidades**
  - Rota filha `habilidades`, adicionada aos filhos de `:id` e às páginas navegáveis do `Header`.
  - `HabilidadesLanding`: card central com linha tracejada animada (`@keyframes` CSS/SASS, suprimida sob `prefers-reduced-motion: reduce`); a partir dela, ramificações também animadas para a esquerda (habilidades `TipoHabilidade.SOFT`, via `HabilidadeService.listarPorId()`) e para a direita (`TipoHabilidade.HARD`); cada habilidade como cartão individual com animação fade-in e o ícone SVG local de `HabilitiesModel.icone` (`NgOptimizedImage`); abaixo do card central, os botões de adicionar e remover habilidade, presentes na tela sem nenhum manipulador de clique associado.
  - Testes: `HabilidadesLanding` (ramificação correta por tipo, ícone exibido por habilidade, presença dos botões de adicionar/remover). Caso de teste coberto: TC-4.

- [x] **T5. Contato e Sobre**
  - Rota filha `contato-e-sobre`, adicionada aos filhos de `:id` e às páginas navegáveis do `Header`.
  - `ContatoESobre`: conteúdo estático mínimo, sem depender de `AboutModel` ou `HabilitiesModel`.
  - Testes: `ContatoESobre` (renderização do conteúdo estático). Caso de teste coberto: TC-5.

- [x] **T6. Acesso integral do super em `/landing-page/control`**
  - Rota literal `control` em `landing-page.routes.ts`, inserida antes de `:id` (para não ser capturada pelo parâmetro).
  - `LandingPageControle`: renderiza o `Header` compartilhado sem passar páginas navegáveis (mantendo tema e logout); quando `AuthService.role()` é `super`, exibe um cartão paginado — um `signal<number>` com o índice atual sobre `PessoaService.listarTodas()` ordenada por `id`, combinando os dados de Sobre Mim e as Habilidades (`HabilidadeService.listarPorId()`) da entrada correspondente, com os botões "Anterior"/"Próximo" desabilitados nos limites da lista e uma mensagem de lista vazia quando não há nenhuma entrada cadastrada; quando a sessão não tem role `super` (incluindo nenhuma sessão ativa), renderiza `LandingPageNaoEncontrada` (de T2).
  - Testes: `LandingPageControle` (renderização condicional por role, avanço/retrocesso da paginação e seus limites, estado de lista vazia). Casos de teste cobertos: TC-18, TC-19, TC-20, TC-21, TC-22, TC-23, TC-24.

- [x] **T7. Página de URL inválida**
  - Rota índice (`''`) de `landing-page.routes.ts`, sem `id` — distinta do filho índice `''` de `:id` (T2), por viver um nível acima na árvore de rotas.
  - `UrlInvalida`: mensagem e instruções orientando o visitante, com um formulário Reactive Forms de um único `FormControl` numérico para digitar um `id` e, ao confirmar, navegar para `/landing-page/{id digitado}`; renderiza o `Header` compartilhado sem páginas navegáveis, no mesmo padrão de T6.
  - Testes: `UrlInvalida` (submissão do formulário navegando para o `id` informado). Casos de teste cobertos: TC-6, TC-7.
