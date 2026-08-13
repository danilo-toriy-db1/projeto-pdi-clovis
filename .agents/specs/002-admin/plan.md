# Plan: Admin

## Stack and structure

Angular 21 (componentes standalone, sem `NgModule`), TypeScript e SASS puros, conforme `AGENTS.md`. O módulo Admin é uma área de feature lazy-loaded via `loadChildren` apontando para um array de `Routes` standalone (`admin.routes.ts`), no mesmo padrão já usado por `login.routes.ts`.

O repositório já tem o domínio Login materializado (`AuthService`, `AuthGuard`, `Encrypter`, `Role`, `Header`, `ThemeService`, variáveis/mixins de tema e breakpoints) — este domínio reaproveita essa infraestrutura sem redefini-la, e a estende nos pontos em que o domínio Admin é o primeiro a precisar de uma capacidade que ela ainda não oferece.

Estrutura proposta:

```
src/app/
  admin/
    admin.routes.ts
    guards/
      escopo-admin.guard.ts       (+ .spec.ts)
    pages/
      painel-admin/                (shell: header com as 3 páginas + <router-outlet>)
      pagina-inicial-admin/        (rota index: os 3 cards)
      editar-dados/                (formulário de Sobre Mim + lista de habilidades)
      editar-usuarios/             (listagem, criação e exclusão de usuários)
    components/
      formulario-habilidade/       (dumb, reaproveitado dentro de editar-dados)
  shared/
    components/
      header/                      (estendido: recebe as páginas navegáveis do painel)
      feedback-modal/              (novo: estados de carregando/sucesso/mensagem extraídos do login-modal)
      confirm-modal/                (novo: confirmação de exclusão)
    services/
      local-storage-array.store.ts (novo: leitura/escrita genérica de arrays em localStorage)
      pessoa.service.ts             (novo: regras de ArrayAboutModel/AboutModel e o vínculo usuário↔id)
      habilidade.service.ts         (novo: regras de ArrayHabilitiesModel/HabilitiesModel)
      auth.service.ts                (estendido: listagem de usuários escopada por role)
    models/
      enums/
        tipo-habilidade.enum.ts     (novo)
      interfaces/
        about.model.ts               (novo: ArrayAboutModel, AboutModel, DescricaoAbout)
        habilities.model.ts          (novo: ArrayHabilitiesModel, HabilitiesModel)
public/
  icons/
    skills/
      placeholder.svg               (novo, conforme gestao-icones-svg-locais)
```

## Technical decisions

- **Rotas aninhadas com `super` declarada antes de `:id`** — `admin.routes.ts` declara `{ path: 'super', component: PainelAdmin, children: [...] }` antes de `{ path: ':id', component: PainelAdmin, children: [...] }`; o Angular Router casa rotas na ordem do array, então declarar `:id` primeiro faria a literal `super` ser capturada como valor de `id`. Cada ramo tem as mesmas 3 rotas filhas: `''` (Página Inicial), `editar-dados` e `editar-usuarios`, todas renderizadas dentro do shell `PainelAdmin` (header com as 3 páginas + `<router-outlet>`), para não duplicar o header em cada página.
- **`escopo-admin.guard.ts` (guarda funcional, domínio Admin)** — aplicada apenas ao ramo `:id`: quando a sessão ativa tem role `admin` e o segmento `:id` da rota não é igual ao `usuario` da sessão, redireciona para o próprio painel (`/admin/{usuario da sessão}`) em vez de bloquear — o `AuthGuard` do domínio Login já garante que só uma sessão `admin`/`super` chega até aqui; esta guarda garante, adicionalmente, que uma sessão `admin` só vê seu próprio painel, nunca o de outra conta `admin`. Não se aplica ao ramo `super`, coerente com o "acesso integral" dessa role.
- **`local-storage-array.store.ts` genérico** — um serviço injetável (`providedIn: 'root'`) com métodos genéricos `ler<T>(chave: string): T[]` e `gravar<T>(chave: string, itens: T[]): void`, único ponto de leitura/escrita em `localStorage` para arrays deste domínio. `PessoaService` e `HabilidadeService` o injetam e constroem as regras de negócio por cima, mantendo os componentes das 3 páginas como dumb components. Base: `AGENTS.md`/skill `admin` ("Deve-se priorizar a abstração para Services que utilizem Generics, para que a arquitetura seja de Dumb Components").
- **Vínculo entre o `usuario` da sessão e o `ArrayAboutModel.id`** — `PessoaService` mantém, além da chave com o array `ArrayAboutModel`, uma segunda chave em `localStorage` com um registro `{ [usuario: string]: number }`. Ao resolver a entrada de uma sessão `admin`, o serviço consulta esse registro; se o `usuario` ainda não tiver `id` vinculado, calcula o próximo id disponível (maior `id` já existente em `ArrayAboutModel` mais um, ou `0` quando o array está vazio), cria uma nova entrada de `AboutModel` vazia (com a logo do projeto como `imagem` padrão) sob esse id, grava o vínculo e devolve essa entrada. Uma sessão `super` não passa por essa resolução — `PessoaService` expõe a listagem completa de `ArrayAboutModel` diretamente para ela. Base: resposta do usuário ao gap `admin-id-numerico-vs-username` (rodada anterior desta mesma spec), que manteve `ArrayAboutModel.id` numérico e delegou a este domínio a resolução do vínculo.
- **Extração do feedback visual do `LoginModal` para `shared/components/feedback-modal`** — um componente dumb com um `input<'carregando' | 'sucesso' | 'mensagem'>('estado')` e um `input<string>('mensagem')`, exibindo o spin de carregamento, o check de sucesso ou o texto informado, sempre dentro de uma região `aria-live="polite"`. O `LoginModal` do domínio Login passa a compor esse componente para seus cinco estados (mapeando "Usuário Não Encontrado", "Credenciais Inválidas" e "Acesso Negado" para o estado `mensagem` com o texto correspondente), sem alterar nenhuma das mensagens nem das transições já documentadas na skill `login`. Base: resposta do usuário ao gap `admin-modal-feedback-compartilhado`.
- **`confirm-modal` (novo, `shared/components`)** — componente dumb com `input<string>('mensagem')` e os outputs `confirmar`/`cancelar`, consumido por "Editar Dados" (remoção de `AboutModel`/`HabilitiesModel`) e "Editar Usuários" (remoção de usuário); nenhuma remoção chama o serviço de dados diretamente sem passar por esse modal primeiro.
- **Extensão do `Header` compartilhado com páginas navegáveis** — novo `input<{ rotulo: string; rota: string }[]>('paginas', [])`, renderizado como `<nav>` com `routerLink` dentro do mesmo `ng-template` já reaproveitado pela barra fixa e pela sidebar (`responsividade-header-mobile` já exige que as duas fontes de conteúdo sejam a mesma). O domínio Admin é o primeiro a passar essa lista (as 3 páginas do painel); a variante reduzida de `/login` continua sem passar esse input, preservando o comportamento atual.
- **Extensão do `AuthService` com listagem de usuários** — novo método `listarUsuarios(roleDeQuemVê: Role): Usuario[]`, aditivo aos métodos já existentes (`autenticar`, `criarUsuario`, `excluirUsuario`, `logout`): retorna todos os registros quando `roleDeQuemVê` é `super`, e apenas os registros com role `user` ou `admin` quando é `admin`. Nenhum método existente do `AuthService` muda de assinatura ou de comportamento.

## Data model

Resumo: as entidades `ArrayAboutModel`/`AboutModel`/`DescricaoAbout`, `ArrayHabilitiesModel`/`HabilitiesModel`/`TipoHabilidade` e o registro interno de vínculo `usuario → id`, todas em `localStorage`. Detalhes completos, incluindo as chaves de armazenamento e as restrições de unicidade, em [`data-model.md`](./data-model.md).

## External contracts

Não se aplica — sem backend, API ou contrato externo formal, mesma situação do domínio Login. `contracts/` foi avaliado e descartado.

## Interface

O painel combina o shell `PainelAdmin` (header com as 3 páginas), a Página Inicial (3 cards), "Editar Dados" (formulário de `AboutModel` + lista de habilidades) e "Editar Usuários" (listagem + formulário de criação + exclusão com confirmação). Descrição completa, tela a tela, em [`ui/telas.md`](./ui/telas.md). `forms.md`, `flows.md` e `accessibility.md` foram avaliados e descartados como arquivos separados — os formulários e as notas de acessibilidade deste domínio cabem, sem ambiguidade, dentro de `ui/telas.md`.

## Testing strategy

- **Unit** — `PessoaService` (resolução do vínculo usuário↔id, criação da primeira entrada, listagem completa para `super`), `HabilidadeService` (CRUD escopado por `id`, fallback para o ícone placeholder), `local-storage-array.store` (leitura/escrita genérica), a extensão `listarUsuarios` do `AuthService` (matriz de escopo por role), `escopo-admin.guard` (matriz de permissão por role e por segmento `:id`), e os componentes `painel-admin`/`pagina-inicial-admin`/`editar-dados`/`editar-usuarios`/`formulario-habilidade`/`feedback-modal`/`confirm-modal` (validade de formulário, emissão de outputs, exibição condicional). Cada tarefa que entrega código testável inclui o `.spec.ts` correspondente, lado a lado com o arquivo testado — mesmo padrão do domínio Login.
- **Integration** — não aplicável além do já coberto pelos testes de componente com `TestBed`: não há backend real para integrar.
- **E2E** — fora de escopo desta spec; nenhuma ferramenta de E2E está decidida em `AGENTS.md` ou nas skills do projeto.
- **Runner** — Jest já está configurado (`jest.config.ts`, `setup-jest.ts`, script `test` em `package.json`), migração feita pelo domínio Login; nenhum ajuste de runner é necessário aqui.

## Impact on the authoritative documentation

Sem impacto. A skill `admin` já documenta que o `id` de `ArrayAboutModel` se relaciona com a conta do admin correspondente, sem detalhar o mecanismo — a resolução por vínculo interno decidida nesta rodada implementa exatamente essa relação, sem contradizer nenhuma frase já escrita na skill. A skill `login` já documenta os cinco estados visuais do modal de login pelo texto exibido em cada um, sem descrever a composição interna do componente — a extração do feedback visual para `shared/components/feedback-modal` é um detalhe de implementação que preserva textos e transições já documentados, sem alterar nenhuma regra de negócio. Nenhuma tarefa de atualização de skill nasce desta spec.

## Optional artifacts

- `data-model.md` — gerado: as chaves de `localStorage`, os campos das entidades e a estrutura do registro de vínculo precisam estar inequívocos antes da implementação.
- `research.md` — gerado: registra as alternativas e a base de confirmação de cada decisão técnica assumida aqui.
- `contracts/` — descartado: sem contrato externo formal (ver "External contracts").
- `ui/` — gerado como `ui/telas.md`: as 3 páginas do painel, os dois formulários e a listagem de usuários precisam de detalhe que não cabe numa seção curta do `plan.md`.
