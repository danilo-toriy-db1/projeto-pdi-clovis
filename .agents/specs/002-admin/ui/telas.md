# UI: Telas — Admin

## Shell `PainelAdmin`

Renderiza o `Header` compartilhado com as 3 páginas navegáveis (Página Inicial, Editar Dados, Editar Usuários) e um `<router-outlet>` para a página ativa. As rotas relativas usadas pelo `Header` (`''`, `editar-dados`, `editar-usuarios`) são as mesmas em ambos os ramos (`/admin/:id` e `/admin/super`), então o mesmo shell serve os dois contextos sem duplicação.

## Página Inicial do Admin

Breve descrição sobre o painel e 3 cards, com o mesmo efeito de brilho (`--brilho-card`) já usado pelos cards da Landing Page:

1. **Card 1** — alterna o tema ativo da aplicação (`ThemeService.alternarTema()`).
2. **Card 2** — navega para `/landing-page`.
3. **Card 3** — navega para a página "Editar Dados" da mesma base de rota (`editar-dados`, relativa).

## Editar Dados

**Sessão `admin`:** um único formulário Reactive Forms de `AboutModel` (nome, idade, carreira, profissão, empresa, imagem, e os quatro campos de `descricao`), pré-preenchido com a entrada resolvida por `PessoaService` (criada vazia na primeira vez). Abaixo do formulário, a lista de habilidades (`ArrayHabilitiesModel`) associadas a esse mesmo `id`, cada uma com nome, `TipoHabilidade` e ícone, com um formulário próprio (`formulario-habilidade`) para adicionar uma nova.

**Sessão `super`:** uma lista de todas as entradas de `ArrayAboutModel`, com ações de criar uma nova, editar ou remover qualquer uma; ao selecionar uma entrada para edição, o mesmo formulário de `AboutModel` e a mesma lista de habilidades da variante `admin` são exibidos, agora para a entrada escolhida.

Toda remoção (de uma entrada de `AboutModel` ou de uma habilidade) abre o `confirm-modal` compartilhado antes de ser efetivada; toda submissão de formulário exibe o `feedback-modal` compartilhado no estado `carregando` e, em seguida, `sucesso`.

## Editar Usuários

Lista de usuários obtida por `AuthService.listarUsuarios(roleDaSessao)`, cada um com seu `usuario` e sua `role`; a linha da conta `superAdmin` nunca exibe a ação de remover. Um formulário Reactive Forms de criação (`usuario`, `senha`, seleção de `role` a partir de um `<select>`/`radio` filtrado pelas roles que a role da sessão permite — nunca um campo de texto livre) cria um novo usuário via `AuthService.criarUsuario`. A remoção de um usuário existente abre o `confirm-modal` compartilhado antes de chamar `AuthService.excluirUsuario`.

## Componentes compartilhados desta spec

- **`feedback-modal`** — estados `carregando` (spinner), `sucesso` (check) e `mensagem` (texto customizado ou padrão), sempre anunciados em uma região `aria-live="polite"`.
- **`confirm-modal`** — mensagem informando que a exclusão é permanente, com os botões de confirmar e cancelar; a ação de remover só é efetivada após a confirmação.

## Acessibilidade

- Os 3 cards da Página Inicial e os 3 links do header têm rótulo textual próprio, nunca dependendo só de um ícone.
- Os campos obrigatórios dos formulários de `AboutModel`, de habilidade e de criação de usuário usam `Validators.required`, e recebem foco e borda vermelha quando a submissão é tentada com o campo vazio, conforme a exigência de `technical-dependencies.md` do domínio.
- Cada ícone de habilidade renderizado via `NgOptimizedImage` (`ngSrc`) declara `width`/`height`, para não causar layout shift.
- O `confirm-modal` usa `role="alertdialog"` e devolve o foco ao elemento que abriu a remoção quando cancelado.
