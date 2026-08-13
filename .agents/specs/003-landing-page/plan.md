# Plan: Landing Page

## Stack and structure

Angular 21 (componentes standalone, sem `NgModule`), TypeScript e SASS puros, conforme `AGENTS.md`. O módulo Landing Page é uma área de feature lazy-loaded via `loadChildren` apontando para um array de `Routes` standalone (`landing-page.routes.ts`), no mesmo padrão já usado por `login.routes.ts` e `admin.routes.ts`.

O repositório já tem os domínios Login e Admin materializados (`AuthService`, `ThemeService`, `Header`, `PessoaService`, `HabilidadeService`, variáveis/mixins de tema, breakpoints e a convenção de ícones SVG locais) — este domínio reaproveita essa infraestrutura inteiramente, sem redefini-la e sem estendê-la: é o primeiro domínio da ordem sugerida em `functional-map.md` a não precisar criar nenhuma infraestrutura transversal nova.

Estrutura proposta:

```
src/app/
  landing-page/
    landing-page.routes.ts
    pages/
      landing-page-id/            (shell da rota :id: resolve a entrada, header com as 4 páginas + <router-outlet>, ou LandingPageNaoEncontrada)
      pagina-inicial-landing/      (rota index sob :id: logo, nome do projeto, descrição, 3 cards)
      sobre-mim/                   (rota 'sobre-mim': dados de AboutModel da entrada)
      habilidades-landing/         (rota 'habilidades': linha central, ramificações e cartões de HabilitiesModel)
      contato-e-sobre/             (rota 'contato-e-sobre': conteúdo estático mínimo)
      url-invalida/                (rota index de landing-page.routes.ts, sem :id: input + instruções)
      landing-page-controle/       (rota 'control': paginação pessoa a pessoa para a role super, ou LandingPageNaoEncontrada)
    components/
      landing-page-nao-encontrada/ (dumb, reaproveitado por landing-page-id e landing-page-controle)
  app.routes.ts                    (recebe a entrada 'landing-page', pública, sem guarda)
```

Nenhum arquivo fora de `src/app/landing-page/` e do registro da rota em `app.routes.ts` é criado ou alterado por este domínio.

## Technical decisions

- **Ordem das rotas filhas** — `landing-page.routes.ts` declara `{ path: 'control', component: LandingPageControle }` antes de `{ path: ':id', component: LandingPageId, children: [...] }`, e `{ path: '', component: UrlInvalida }` para o caminho vazio; o Angular Router casa rotas na ordem do array, então declarar `:id` antes de `control` faria o literal `control` ser capturado como valor de `id` (mesmo cuidado já documentado em `references/technical-dependencies.md` da skill `landing-page`). As 4 páginas navegáveis (Página Inicial, Sobre Mim, Habilidades, Contato e Sobre) são rotas filhas de `:id` (`''`, `sobre-mim`, `habilidades`, `contato-e-sobre`), todas renderizadas dentro do shell `LandingPageId` — o mesmo padrão de shell + `<router-outlet>` já usado por `PainelAdmin` no domínio Admin.
- **Resolução de "não encontrada" e do acesso do super por renderização condicional, sem guarda com redirecionamento** — `LandingPageId` injeta `PessoaService` e resolve a entrada pelo `id` da rota (via `ActivatedRoute`, no mesmo padrão de leitura de parâmetro já usado por `escopo-admin.guard`); quando a entrada não existe, o componente renderiza `LandingPageNaoEncontrada` no lugar do header e do `<router-outlet>`, sem navegar para nenhuma outra URL. `LandingPageControle` aplica a mesma lógica consultando `AuthService.role()` em vez do `id`. Diferente do `escopo-admin.guard` do domínio Admin — que redireciona para uma rota válida alternativa —, aqui a regra de negócio exige que a mesma URL visitada permaneça e exiba a página de não encontrada, sem revelar a existência de `/landing-page/control` a quem não tem a role `super`; uma guarda funcional teria que redirecionar para outra rota (mudando a URL) ou introduzir uma rota adicional oculta, então a verificação fica no componente da própria rota. Detalhes em `research.md`.
- **Paginação pessoa a pessoa em `/landing-page/control` via Signals** — `LandingPageControle` mantém um `signal<number>` com o índice da página atual sobre `PessoaService.listarTodas()` ordenada por `id`; um `computed()` deriva a entrada exibida e `HabilidadeService.listarPorId(entrada.id)` fornece as habilidades desse mesmo cartão. Avançar ou voltar move o índice em um, sem passar dos limites da lista (nenhum "wrap-around" para a primeira entrada após a última, nem o inverso). Base: resposta do usuário ao gap `landing-page-paginacao-controle-super` ("Página 1 mostra dados e habilidades do usuário 1... uma paginação dos cards"). Detalhes em `research.md`.
- **Card 2 da Página Inicial reaproveita `AuthService.temPermissaoPainelAdmin`** — quando a sessão ativa tem permissão de painel (`admin`/`super`), o clique navega direto para `/admin/{usuario}/editar-dados` (ou `/admin/super/editar-dados` para uma sessão `super`); caso contrário (sem sessão, ou sessão `user`), o clique navega para `/admin`, deixando o `AuthGuard` do domínio Login redirecionar para `/login` — o mesmo mecanismo que já intercepta qualquer visitante sem permissão, sem que este domínio precise conhecer o fluxo de criação de conta do modal de Login.
- **Header sem página navegável em `/landing-page/control` e na URL inválida** — `LandingPageControle` e `UrlInvalida` renderizam o `Header` compartilhado sem passar o input `paginas` (lista vazia, o padrão já existente do componente), mantendo os botões de tema e logout; nenhum dos dois usa a variante `reduzido`, que também ocultaria o botão de logout — a exibição do logout nunca é uma condição própria deste domínio.
- **Reaproveitamento integral de tema, responsividade e ícones já construídos** — `ThemeService`, as variáveis/mixins de `src/styles/`, o mecanismo de hambúrguer/sidebar do `Header` e a convenção de ícones SVG locais (`gestao-icones-svg-locais`) já atendem integralmente as necessidades deste domínio; nenhum dos três é alterado. Detalhes em `research.md`.
- **Animações da página de Habilidades em CSS/SASS puro** — a descida da linha tracejada central, as ramificações esquerda/direita e o fade-in de cada cartão de habilidade usam `@keyframes` próprios de `habilidades-landing.scss`, sem biblioteca de animação, suprimidas sob `prefers-reduced-motion: reduce` — mesma convenção já adotada pela composição decorativa do domínio Login.

## Data model

Nenhuma entidade nova. Este domínio consome, em modo somente leitura, `ArrayAboutModel`/`AboutModel` e `ArrayHabilitiesModel`/`HabilitiesModel` já definidos e persistidos pelo domínio Admin — via `PessoaService.listarTodas()`/`buscarPorId()` e `HabilidadeService.listarPorId()` —, sem introduzir nenhuma chave própria de `localStorage`. Os campos completos desses modelos estão em [`../002-admin/data-model.md`](../002-admin/data-model.md). `data-model.md` próprio foi avaliado e descartado: não há nenhuma entidade ou chave de armazenamento nova a documentar.

## External contracts

Não se aplica — sem backend, API ou contrato externo formal, mesma situação dos domínios Login e Admin. `contracts/` foi avaliado e descartado.

## Interface

O domínio combina o shell `LandingPageId` (header com as 4 páginas + `<router-outlet>`, ou a página de não encontrada), a Página Inicial (3 cards), Sobre Mim, Habilidades (linha central animada, ramificações e cartões), Contato e Sobre (conteúdo estático mínimo), a página de URL inválida (input de `id`) e a página paginada de acesso do `super`. Descrição completa, tela a tela, em [`ui/telas.md`](./ui/telas.md). `forms.md`, `flows.md` e `accessibility.md` foram avaliados e descartados como arquivos separados — o único formulário (o input de `id` da página de URL inválida) e as notas de acessibilidade cabem, sem ambiguidade, dentro de `ui/telas.md`.

## Testing strategy

- **Unit** — `LandingPageId` (renderização condicional por existência do `id`, preservação do `id` na navegação entre as 4 páginas filhas), `LandingPageControle` (paginação e seus limites, renderização condicional por role), `UrlInvalida` (navegação a partir do `id` digitado), `PaginaInicialLanding` (destino do card 2 por permissão de painel, alternância de tema pelo card 3), `SobreMim`/`HabilidadesLanding`/`ContatoESobre` (dados exibidos a partir da entrada resolvida) e `LandingPageNaoEncontrada` (renderização estática). Cada tarefa que entrega código testável inclui o `.spec.ts` correspondente, lado a lado com o arquivo testado — mesmo padrão dos domínios Login e Admin.
- **Integration** — não aplicável além do já coberto pelos testes de componente com `TestBed`: não há backend real para integrar.
- **E2E** — fora de escopo desta spec; nenhuma ferramenta de E2E está decidida em `AGENTS.md` ou nas skills do projeto.
- **Runner** — Jest já está configurado (`jest.config.ts`, `setup-jest.ts`, script `test` em `package.json`), migração feita pelo domínio Login; nenhum ajuste de runner é necessário aqui.

## Impact on the authoritative documentation

- **Skill `landing-page`** (`.agents/skills/landing-page/references/technical-dependencies.md`) — drift deliberado: a menção à rota `/landing-page/super` nessa referência está incorreta; o nome definitivo é `/landing-page/control`, decisão registrada na resposta humana ao gap `landing-page-nome-rota-control-vs-super`. Gera tarefa em `tasks.md` para corrigir a menção.
- **Skill `landing-page`** (`.agents/skills/landing-page/SKILL.md`, seção "Fluxos e ciclo de vida > Acesso do super a todas as Landing Pages") — drift deliberado: a frase atual sobre a mecânica de paginação é ambígua ("tanto na tela Sobre Mim, quanto na Habilidades"); o comportamento definitivo é a paginação pessoa a pessoa, um cartão por página combinando os dados de Sobre Mim e as Habilidades de uma única entrada de `ArrayAboutModel`, decisão registrada na resposta humana ao gap `landing-page-paginacao-controle-super`. Gera tarefa em `tasks.md` para reescrever essa frase de forma inequívoca.

## Optional artifacts

- `data-model.md` — descartado: nenhuma entidade ou chave de `localStorage` nova (ver "Data model").
- `research.md` — gerado: registra as alternativas e a base de confirmação das decisões técnicas assumidas aqui.
- `contracts/` — descartado: sem contrato externo formal (ver "External contracts").
- `ui/` — gerado como `ui/telas.md`: as 7 telas deste domínio e o input da página de URL inválida precisam de detalhe que não cabe numa seção curta do `plan.md`.
