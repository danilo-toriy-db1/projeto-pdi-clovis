# Tasks: Admin

- [x] **T1. Rotas do painel, guarda de escopo do próprio `:id` e Página Inicial**
  - `admin.routes.ts` (lazy-loaded) com os ramos `super` (declarado antes de `:id`, para não ser capturado pelo parâmetro) e `:id`, cada um com as 3 rotas filhas (`''`, `editar-dados`, `editar-usuarios`) renderizadas dentro do shell `PainelAdmin`.
  - `escopo-admin.guard.ts` (`admin/guards`, guarda funcional), aplicada só ao ramo `:id`: redireciona para o próprio `/admin/{usuario da sessão}` quando o segmento não corresponde à sessão `admin` ativa; o ramo `super` não recebe essa guarda.
  - Extensão do `Header` compartilhado com o novo input de páginas navegáveis, consumido pelo shell `PainelAdmin` para exibir as 3 páginas do painel (Página Inicial, Editar Dados, Editar Usuários) na barra fixa e na sidebar mobile.
  - `PaginaInicialAdmin` com os 3 cards: alternar o tema (`ThemeService` já existente), voltar para `/landing-page`, ir para `editar-dados` (rota relativa).
  - Testes: `escopo-admin.guard` (matriz de permissão por role e por correspondência de `:id`), a extensão do `Header` (renderização das páginas recebidas), e `PaginaInicialAdmin` (ação de cada card). Casos de teste cobertos: TC-1, TC-2, TC-3, TC-4, TC-5, TC-6, TC-7.

- [x] **T2. Editar Dados: entrada própria da sessão `admin` e feedback visual compartilhado**
  - `local-storage-array.store.ts` (`shared/services`, genérico) e `PessoaService` (`shared/services`), que resolve o vínculo entre o `usuario` da sessão e o `ArrayAboutModel.id`, criando a entrada vazia (imagem com a logo do projeto como padrão) na primeira vez que uma sessão `admin` a acessa.
  - `shared/components/feedback-modal`, com os estados de carregando, sucesso e mensagem customizada/padrão, extraído dos cinco estados hoje embutidos no `LoginModal`; o `LoginModal` (domínio Login) passa a compor esse componente para seus próprios estados, sem alterar nenhum texto nem transição já testada.
  - Tela "Editar Dados" (sessão `admin`): formulário Reactive Forms de `AboutModel` (nome, idade, carreira, profissão, empresa, imagem, e os quatro campos de `descricao`), pré-preenchido com a entrada resolvida, exibindo o `feedback-modal` ao salvar.
  - Testes: `PessoaService` (resolução do vínculo, criação da primeira entrada, persistência dos dados editados), `feedback-modal` (troca entre os três estados), o `LoginModal` com o componente extraído (mantendo a cobertura já existente), e a tela "Editar Dados" (pré-preenchimento, validação de campo obrigatório com foco e borda vermelha, submissão). Casos de teste cobertos: TC-8, TC-9, TC-10.

- [x] **T3. Habilidades da entrada e o modal de confirmação de exclusão compartilhado**
  - `HabilidadeService` (`shared/services`), sobre o `local-storage-array.store` de T2, com as regras de `ArrayHabilitiesModel` escopadas por `id` (criação, edição, remoção, fallback para o ícone placeholder quando nenhum for informado).
  - `shared/components/confirm-modal`, com a mensagem de alerta sobre a exclusão ser permanente e os botões de confirmar/cancelar; nasce aqui por ser a primeira remoção deste domínio.
  - Lista de habilidades dentro da tela "Editar Dados" (T2), com o formulário `formulario-habilidade` para criar uma nova e as ações de editar e remover uma existente, cada remoção passando pelo `confirm-modal`.
  - Testes: `HabilidadeService` (CRUD escopado por `id`, fallback de ícone), `confirm-modal` (confirmar e cancelar) e a lista de habilidades (cadastro, edição, remoção). Casos de teste cobertos: TC-14, TC-15, TC-16, TC-17, TC-18.

- [x] **T4. Editar Dados: gestão completa pela sessão `super`**
  - Extensão de `PessoaService` (T2) com a listagem completa de `ArrayAboutModel` e a geração de um novo `id` (sempre maior que qualquer `id` já existente) ao criar uma entrada para outra pessoa, sem passar pela resolução de vínculo usada pela sessão `admin`.
  - Variante da tela "Editar Dados" para sessão `super`: lista de todas as entradas, com ações de criar, editar (reaproveitando o formulário de `AboutModel` e a lista de habilidades de T2/T3) e remover, esta última reaproveitando o `confirm-modal` de T3 e removendo, na mesma operação, as entradas de `ArrayHabilitiesModel` com o mesmo `id`.
  - Testes: a extensão de `PessoaService` (listagem completa, geração de `id` sem colisão, remoção em cascata) e a tela "Editar Dados" na variante `super` (listagem, criação, edição, remoção). Casos de teste cobertos: TC-11, TC-12, TC-13.

- [x] **T5. Editar Usuários: listagem escopada por role**
  - Extensão do `AuthService` do domínio Login com `listarUsuarios(roleDeQuemVê)`, aditiva aos métodos já existentes: retorna todos os registros para `super`, e apenas os registros com role `user`/`admin` para `admin`.
  - Tela "Editar Usuários": lista de usuários obtida por esse método, sem ação de remover na linha da conta `superAdmin`.
  - Testes: a extensão `listarUsuarios` do `AuthService` (matriz de escopo por role) e a tela "Editar Usuários" (renderização da lista escopada, ausência da ação de remover na linha `superAdmin`). Casos de teste cobertos: TC-19, TC-20, TC-25.

- [x] **T6. Editar Usuários: criação de usuário restrita por role**
  - Formulário Reactive Forms de criação (`usuario`, `senha`, seleção de `role` a partir do enum `Role` do domínio Login, nunca um campo de texto livre) na tela de T5, chamando `AuthService.criarUsuario`; as opções de `role` oferecidas são filtradas pela role da sessão (uma sessão `admin` nunca vê a opção `super`).
  - Testes: a tela "Editar Usuários" cobrindo a criação por cada role de sessão e a ausência da opção `super` para uma sessão `admin`. Casos de teste cobertos: TC-21, TC-22, TC-23.

- [x] **T7. Editar Usuários: exclusão de usuário**
  - Ação de remover um usuário existente na tela de T5/T6, reaproveitando o `confirm-modal` de T3 antes de chamar `AuthService.excluirUsuario`.
  - Testes: a tela "Editar Usuários" cobrindo a remoção de um usuário após confirmação. Caso de teste coberto: TC-24.
