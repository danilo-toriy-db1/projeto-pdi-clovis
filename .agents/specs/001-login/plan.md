# Plan: Login / Autenticação

## Stack and structure

Angular 21 (standalone components, sem `NgModule`), TypeScript e SASS puros, conforme `AGENTS.md`. O "módulo" de Login citado pela documentação de negócio é uma área de feature lazy-loaded via `loadChildren` apontando para um array de `Routes` standalone (`login.routes.ts`), nunca um `NgModule` clássico.

O diretório de execução ainda é o scaffold em branco do Angular CLI — nenhuma pasta de feature, service ou model deste domínio existe hoje. Este domínio é o primeiro a ser materializado (ordem sugerida em `functional-map.md`), então também dá origem à infraestrutura transversal de tema e de responsividade do header que os domínios `admin` e `landing-page` reaproveitarão sem redefinir.

Estrutura proposta:

```
src/app/
  login/
    login.routes.ts
    pages/
      login-page/            (rota /login: header reduzido, camada decorativa, botões, modal)
    components/
      login-modal/           (Reactive Forms + os cinco estados visuais + criação de conta)
  shared/
    guards/
      auth.guard.ts           (+ .spec.ts)
    services/
      auth.service.ts         (+ .spec.ts)
      encrypter.ts             (+ .spec.ts)
      theme.service.ts         (+ .spec.ts)
    models/
      enums/
        role.enum.ts
      interfaces/
        usuario.interface.ts
        sessao.interface.ts
    components/
      header/                 (header compartilhado, variante reduzida usada por /login)
src/styles/
  _theme-variables.scss
  _theme-mixins.scss
  _breakpoints.scss
```

## Technical decisions

- **Estado reativo via Signals** — `AuthService` mantém a sessão em `signal<Sessao | null>(null)`, com `computed()` para `role`/`isAuthenticated`; o mesmo padrão se aplica ao `ThemeService`. Base: `AGENTS.md` ("Use signals for state management", "Evitar sempre que possível Observables"). Detalhes em `research.md`.
- **`AuthGuard` como guarda funcional** (`CanActivateFn`, `inject(AuthService)`/`inject(Router)`), aplicada às rotas do painel administrativo (`/admin/{id}`, `/admin/super`) que o domínio `admin` declara. Base: convenção do projeto contra decorators e padrões de classe. Detalhes em `research.md`.
- **Seed e persistência em `localStorage`** — `AuthService` verifica a chave `login.usuarios` na inicialização e semeia as três contas fixas (`user`/`123U`/`user`, `admin`/`123@`/`admin`, `superAdmin`/`123Super`/`super`) apenas quando a chave ainda não existe. Formato completo em `data-model.md`.
- **Resultado por role e por botão de entrada** — uma função pura `resolveRedirect(role, intent)` decide o destino de "Sucesso" (`/landing-page`, `/admin/{id}`, `/admin/super`) e o caso especial de "Acesso Negado" (role `user` com intenção `painel-admin`), reaproveitada tanto pelo modal quanto pelo `AuthGuard` ao bloquear uma navegação direta.
- **Atraso de 3 segundos simulado** — um único método (`AuthService.aguardarSimulacaoDeRede()` ou equivalente) que apenas espera 3 segundos, reaproveitado por toda transição para o estado "Carregando" do modal, nunca duplicado por estado.
- **Reaproveitamento do sistema de temas e do header responsivo** — este domínio constrói as variáveis/mixins de tema, o `ThemeService` e o mecanismo de hambúrguer/sidebar (`sistema-temas-claro-escuro` e `responsividade-header-mobile`, ambas já documentadas como technical-skill), por ser o primeiro a precisar deles; `admin` e `landing-page` os reaproveitam sem redefinição. Detalhes em `research.md`.
- **Composição decorativa animada** — brilho diagonal reaproveitando `--brilho-card` e bolhas em `@keyframes` CSS/SASS puro (sem biblioteca de animação), com um par `:root`/`.dark-mode` de novas variáveis para as bolhas, seguindo a mesma convenção da paleta existente; suprimida sob `prefers-reduced-motion: reduce`. Detalhes em `research.md` e em `ui/states.md`.
- **Algoritmo do `Encrypter`** — criptografia reversível via Web Crypto (`crypto.subtle`, AES-GCM), com uma chave fixa embutida no código do cliente. Cada chamada de `encrypt(senha)` gera um IV aleatório de 12 bytes via `crypto.getRandomValues`, cifra a senha com esse IV e a chave fixa, e retorna uma única string (base64 do IV concatenado ao texto cifrado); `matches(senhaDigitada, senhaArmazenada)` decifra o valor armazenado com a mesma chave e o IV embutido nele, e compara o resultado com a senha digitada. Base: resposta do usuário ao gap `login-encrypter-algoritmo`. Detalhes em `research.md`.

## Data model

Três entidades, todas persistidas em `localStorage`: o enum `Role`, e as interfaces `Usuario` (array sob a chave `login.usuarios`) e `Sessao` (registro único sob `login.sessao`). Detalhes completos, incluindo os campos e as restrições de unicidade e de não exclusão do `superAdmin`, em [`data-model.md`](./data-model.md).

## External contracts

Não se aplica — sem backend, API ou contrato externo formal. `contracts/` foi avaliado e descartado: o único "contrato" relevante deste domínio é o formato dos registros em `localStorage`, já coberto por `data-model.md`.

## Interface

A tela `/login` combina o header reduzido, a camada decorativa animada, os dois botões de entrada ("Login" e "Painel Admin"), o botão de acesso à Landing Page sem login, e o modal de Reactive Forms com os cinco estados visuais e o sub-fluxo de criação de conta. Descrição completa, estado a estado, em [`ui/states.md`](./ui/states.md). `forms.md`, `flows.md` e `accessibility.md` foram avaliados e descartados como arquivos separados — o único formulário do domínio e suas notas de acessibilidade cabem, sem ambiguidade, dentro de `ui/states.md`.

## Testing strategy

- **Unit** — `AuthService` (seed inicial, validação de credenciais, criação de usuário respeitando o limite de role de quem cria, invariante de não exclusão do `superAdmin`, leitura/escrita/remoção de sessão), `auth.guard` (matriz de permissão por role e por rota), `ThemeService`, `Encrypter` (`encrypt` produz saídas diferentes a cada chamada pelo IV aleatório, mas `matches` deve reconhecer a mesma senha original em ambas), e os componentes `login-page`/`login-modal` (validade do formulário, transições entre os cinco estados, temporização simulada). Cada tarefa que entrega código testável inclui o `.spec.ts` correspondente, lado a lado com o arquivo testado.
- **Integration** — não aplicável além do já coberto pelos testes de componente com `TestBed`: não há backend real para integrar.
- **E2E** — fora de escopo desta spec; nenhuma ferramenta de E2E está decidida em `AGENTS.md` ou nas skills do projeto.
- **Runner** — o scaffold ainda configura Vitest por padrão; a introdução do Jest (`jest-preset-angular`), exigida pelo projeto e já detalhada na technical-skill `configuracao-testes-jest`, é pré-requisito técnico deste domínio por ser o primeiro a precisar executar qualquer `.spec.ts` — entra como passo nomeado e explícito da primeira tarefa de `tasks.md` que entrega código testável, não como uma tarefa própria.

## Impact on the authoritative documentation

- **Skill `login`** (`.agents/skills/login/SKILL.md`) — drift deliberado: a seção "Fluxos e ciclo de vida > Tela /login" ainda descreve um único controle que abre o modal e define "Acesso Negado" de forma ambígua/contraditória com "Login bem-sucedido"; precisa passar a descrever os dois botões de entrada ("Login" e "Painel Admin"), o gatilho preciso de "Acesso Negado" (role `user` tentando entrar pelo Painel Admin, ou uma sessão `user` já ativa navegando direto para uma rota do painel) e os destinos de redirecionamento `/admin/{id}` e `/admin/super`. Decisão registrada: resposta humana ao gap `login-modal-estado-role-user` (rodada anterior desta mesma spec). Gera tarefa em `tasks.md` para atualizar a skill.
- **Skill `admin`** (`.agents/skills/admin/SKILL.md`) — drift deliberado: hoje descreve apenas a rota raiz plana `/admin`; precisa passar a documentar `/admin/{id}` (painel de um admin, escopado ao seu próprio `id` em `ArrayAboutModel`) e `/admin/super` (entrada de acesso total da role `super`), no mesmo espírito já usado por `/landing-page/control` na skill `landing-page`. Decisão registrada: mesma resposta humana citada acima. Gera tarefa em `tasks.md` para atualizar a skill.

## Optional artifacts

- `data-model.md` — gerado: três entidades com campos, chaves de `localStorage` e restrições que precisam estar inequívocas antes da implementação.
- `research.md` — gerado: registra a base de confirmação de cada decisão técnica assumida aqui, incluindo a escolha do algoritmo do `Encrypter`.
- `contracts/` — descartado: sem contrato externo formal (ver "External contracts").
- `ui/` — gerado como `ui/states.md`: as cinco transições do modal e a composição da tela `/login` precisam de detalhe que não cabe numa seção curta do `plan.md`.
