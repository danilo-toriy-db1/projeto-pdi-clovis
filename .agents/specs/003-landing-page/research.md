# Research: Landing Page

## Resolução de "não encontrada" e do acesso do super

**Contexto.** `/landing-page/:id` com um `id` inexistente e `/landing-page/control` sem uma sessão `super` precisam exibir a mesma página de Landing Page não encontrada, na mesma URL que o visitante acessou, sem revelar a existência da listagem de `/landing-page/control` a quem não tem permissão.

**Alternativas:**

- **Guarda funcional (`CanActivateFn`) com redirecionamento** — mesmo padrão do `escopo-admin.guard` do domínio Admin: uma guarda consulta `PessoaService`/`AuthService` e, quando a condição falha, redireciona via `router.createUrlTree(...)` para uma rota alternativa. Exigiria uma rota literal adicional (por exemplo, `/landing-page/nao-encontrada`) declarada antes de `:id` — o mesmo cuidado de ordenação já necessário para `control` — e essa rota adicional passaria a ser uma URL válida e descobrível por qualquer visitante, o que expõe a existência da funcionalidade em vez de escondê-la.
- **Renderização condicional dentro do próprio componente da rota** — `LandingPageId`/`LandingPageControle` resolvem a condição (existência da entrada, role da sessão) e alternam entre o conteúdo normal e `LandingPageNaoEncontrada` no template, sem nenhuma navegação.

**Decisão:** renderização condicional dentro do componente da rota.

**Confirmation basis:** a própria skill `landing-page` descreve o comportamento como a mesma rota resultando na página de não encontrada ("essa mesma rota exibe a página de Landing Page não encontrada... sem revelar sua existência a outras sessões"), o que exclui um redirecionamento para uma URL diferente.

**Consequences:** nenhuma guarda funcional nova nasce neste domínio; `LandingPageId` e `LandingPageControle` injetam `PessoaService`/`AuthService` diretamente e expõem um `computed()` que decide qual conteúdo renderizar.

## Paginação pessoa a pessoa em `/landing-page/control`

**Contexto.** A resposta do usuário ao gap `landing-page-paginacao-controle-super` define que a paginação da role `super` avança um cartão por pessoa, combinando os dados de Sobre Mim e as Habilidades de cada uma, sem especificar a implementação.

**Alternativas:**

- **Biblioteca de paginação de terceiros** — adiciona uma dependência fora da stack restrita a Angular, TypeScript e SASS puros (`AGENTS.md`).
- **Estado local via Signals** (índice da página atual sobre a lista ordenada por `id`) — sem dependência nova, mesmo padrão de estado reativo já usado por `AuthService`/`ThemeService`.

**Decisão:** Signals, sem nenhuma biblioteca de paginação.

**Confirmation basis:** declarado sem reserva em `AGENTS.md` ("Evitar sempre que possível o uso de Observables, preferindo o uso de Signals"); a resposta do usuário ao gap descreve o comportamento esperado sem mencionar nenhuma biblioteca.

**Consequences:** `LandingPageControle` mantém um `signal<number>` com o índice atual sobre `PessoaService.listarTodas()` ordenada por `id`, com `computed()` para a entrada e as habilidades exibidas no cartão; os controles de avançar/voltar não passam dos limites da lista.

## Reaproveitamento da infraestrutura de tema, responsividade e ícones

**Contexto.** Este domínio precisa de alternância de tema claro/escuro, do comportamento responsivo do header (hambúrguer/sidebar em mobile) e de ícones SVG locais para as Habilidades — os três já foram construídos pelos domínios Login e Admin.

**Alternativas:** não avaliadas — a infraestrutura já existe (`ThemeService`, `Header`, `src/styles/_theme-variables.scss`/`_theme-mixins.scss`/`_breakpoints.scss`, `gestao-icones-svg-locais`) e atende integralmente as necessidades deste domínio, sem nenhuma lacuna a preencher.

**Decisão:** reaproveitar sem alteração.

**Confirmation basis:** em uso no código (`ThemeService`, `Header`, os parciais SASS) e nas technical-skills `sistema-temas-claro-escuro`, `responsividade-header-mobile` e `gestao-icones-svg-locais`, já documentadas e completas.

**Consequences:** nenhum arquivo desses domínios é alterado; `landing-page` apenas consome `ThemeService`, `Header` (passando suas próprias páginas navegáveis) e a convenção de ícones já existente.
