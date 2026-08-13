# Research: Login / Autenticação

## Test runner (Jest)

**Contexto.** O scaffold do Angular CLI 21 configura Vitest como runner padrão (`angular.json`, builder `@angular/build:unit-test`; `tsconfig.spec.json` com `"types": ["vitest/globals"]`), mas o projeto exige Jest para todos os testes unitários.

**Alternativas:**

- **Manter Vitest** — zero esforço de migração, mas contradiz a restrição declarada.
- **Migrar para Jest via `jest-preset-angular`** — substitui o builder do CLI; exige remover `vitest` e ajustar `package.json`/`tsconfig.spec.json`.

**Decisão:** migrar para Jest via `jest-preset-angular`, exatamente como descrito pela technical-skill `configuracao-testes-jest`.

**Confirmation basis:** declarado sem reserva em `discovery-answers.md` ("Decisões transversais validadas" — Test runner: "Jest obrigatório... substitui o Vitest padrão do scaffold") e detalhado numa technical-skill já existente e completa.

**Consequences:** a primeira tarefa deste domínio remove `vitest`, adiciona `jest`/`jest-preset-angular`/`@types/jest`, cria `jest.config.ts` e `setup-jest.ts`, e ajusta `tsconfig.spec.json` e o script `test` de `package.json` — pré-requisito para qualquer `.spec.ts` deste domínio rodar.

## Gerenciamento de estado (Signals)

**Contexto.** `AuthService` e `ThemeService` precisam manter estado reativo (sessão ativa, tema ativo) consultado por componentes e pelo `auth.guard`.

**Alternativas:**

- **RxJS (`BehaviorSubject`)** — padrão mais antigo do Angular, ainda amplamente usado.
- **Angular Signals** — padrão recomendado pela versão atual do framework.

**Decisão:** Signals, com `computed()` para estado derivado (`role`, `isAuthenticated`).

**Confirmation basis:** declarado sem reserva em `AGENTS.md` ("Use signals for state management", "Evitar sempre que possível o uso de Observables").

**Consequences:** `AuthService.sessao` e `ThemeService.temaAtivo` são `signal<T>`; nenhum `Subject`/`Observable` é introduzido para esse estado.

## `AuthGuard` como guarda funcional

**Contexto.** As rotas do painel administrativo (`/admin/{id}`, `/admin/super`) precisam de uma guarda que bloqueie sessões sem role `admin`/`super`.

**Alternativas:**

- **Guarda baseada em classe** (`CanActivate` de uma classe injetável, padrão de `NgModule`) — mais verboso, depende de decorators.
- **Guarda funcional** (`CanActivateFn`, com `inject()`) — padrão atual, sem classe nem decorator.

**Decisão:** guarda funcional, `shared/guards/auth.guard.ts`.

**Confirmation basis:** convenção já fixada em `AGENTS.md` contra `NgModule` e a favor de `inject()`/sintaxe mais recente.

**Consequences:** `auth.guard.ts` exporta uma função `CanActivateFn` que injeta `AuthService`/`Router`; nenhuma classe de guarda é criada.

## Reaproveitamento do sistema de temas e do header responsivo

**Contexto.** A tela `/login` precisa do header reduzido com alternância de tema e do comportamento de hambúrguer/sidebar em mobile; nenhum dos dois está implementado no repositório ainda, e este é o primeiro domínio da ordem sugerida em `functional-map.md` a precisar deles.

**Alternativas:**

- **Construir uma versão simplificada isolada**, só para `/login`, deixando a infraestrutura completa para quando `admin`/`landing-page` precisarem dela.
- **Construir agora a infraestrutura transversal completa** já descrita nas technical-skills existentes, reaproveitável sem alteração pelos outros domínios.

**Decisão:** construir a infraestrutura completa agora (variáveis/mixins de tema, `ThemeService`, mecanismo de hambúrguer/sidebar).

**Confirmation basis:** as technical-skills `sistema-temas-claro-escuro` e `responsividade-header-mobile` já existem e trazem passos concretos; a skill de autoria de spec determina que a primeira materialização do domínio é onde cabe construir a dependência técnica ainda não construída.

**Consequences:** nascem aqui `src/styles/_theme-variables.scss`, `_theme-mixins.scss`, `_breakpoints.scss`, `ThemeService` e o mecanismo de hambúrguer/sidebar do header reduzido; `admin` e `landing-page` os consomem sem redefinição.

## Composição decorativa animada da tela `/login`

**Contexto.** Instrução do usuário para tirar o aspecto estático do nome do projeto e dos botões da tela `/login`, usando efeitos de brilho e bolhas.

**Alternativas:**

- **Biblioteca de animação** (ex.: GSAP, Lottie) — mais recursos, mas introduz uma dependência fora da stack restrita.
- **CSS/SASS puro (`@keyframes`)** — sem dependência nova, mesmo padrão já usado pela paleta para `--brilho-card` e para as animações da página de Habilidades.

**Decisão:** CSS/SASS puro, reaproveitando `--brilho-card` para o brilho e um novo par de variáveis `--bolha-*` (`:root`/`.dark-mode`) para as bolhas.

**Confirmation basis:** declarado sem reserva em `business-input.md` ("Deve-se usar Angular.ts, TypeScript e SASS, nada mais") e o padrão já estabelecido pela `sistema-temas-claro-escuro` para efeitos visuais via variável CSS.

**Consequences:** nenhuma dependência nova; a animação roda em looping via `@keyframes` e é suprimida/substituída por uma versão estática sob `prefers-reduced-motion: reduce`.

## Algoritmo do `Encrypter`

**Contexto.** Toda senha deve ser armazenada em `localStorage` de forma criptografada por um utilitário `Encrypter`, mas nenhuma fonte (skill, `business-input.md`, `discovery-answers.md`, `AGENTS.md`) especifica a técnica, e o código atual (scaffold em branco) não traz nenhum uso existente para seguir.

**Alternativas:**

- **Hash unidirecional** (`crypto.subtle.digest`, SHA-256) — suficiente, já que o login só precisa comparar o hash da senha digitada com o hash armazenado, nunca recuperar o texto original; não exige gerenciar nenhuma chave.
- **Criptografia reversível via Web Crypto** (`crypto.subtle`, AES-GCM) com uma chave fixa embutida no cliente — reversível, mas a chave embutida no código não protege de fato contra quem inspeciona o `localStorage`/o bundle.
- **Ofuscação manual reversível** (ex.: Base64 ou cifra XOR de chave fixa), sem depender da Web Crypto API — trivialmente reversível por qualquer pessoa que abra o devtools.

**Decisão:** criptografia reversível via Web Crypto (`crypto.subtle`, AES-GCM) com uma chave fixa embutida no cliente.

**Confirmation basis:** decisão do usuário ao responder o gap `login-encrypter-algoritmo`.

**Consequences:** `Encrypter.encrypt(senha)` gera um IV aleatório de 12 bytes por chamada (`crypto.getRandomValues`), cifra a senha com AES-GCM usando esse IV e a chave fixa, e retorna uma única string (base64 do IV concatenado ao texto cifrado) — por isso, cifrar a mesma senha duas vezes produz duas strings diferentes. `Encrypter.matches(senhaDigitada, senhaArmazenada)` decifra o valor armazenado com a mesma chave, extraindo o IV embutido nele, e compara o resultado com a senha digitada; a comparação nunca cifra de novo a senha digitada para comparar strings cifradas. A chave fixa embutida no código do cliente é uma proteção contra a exposição literal da senha em texto puro no `localStorage`, não uma garantia de segredo real — coerente com o próprio domínio não ter backend nem nenhum lugar para guardar uma chave fora do cliente.
