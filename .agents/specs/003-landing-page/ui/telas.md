# UI: Telas — Landing Page

## Shell `LandingPageId` (rota `/landing-page/:id`)

Resolve a entrada de `ArrayAboutModel` correspondente ao `id` da rota via `PessoaService.buscarPorId()`. Quando a entrada existe, renderiza o `Header` compartilhado com as 4 páginas navegáveis (Página Inicial, Sobre Mim, Habilidades, Contato e Sobre — rotas relativas `''`, `sobre-mim`, `habilidades`, `contato-e-sobre`, preservando o `id` por serem todas filhas da mesma rota) e um `<router-outlet>` para a página ativa. Quando a entrada não existe, renderiza apenas `LandingPageNaoEncontrada`, sem header nem `<router-outlet>`.

## Página Inicial (rota index sob `:id`)

Logo do projeto, o nome do projeto ("My Landing Page") e uma descrição, seguidos de 3 cards com o efeito de brilho (`--brilho-card`):

1. **Card 1** — ícone e texto sobre o repositório GitHub do projeto; ao ser clicado, abre esse repositório em uma nova aba.
2. **Card 2** — convite para criar uma nova pessoa/Landing Page; sem sessão com permissão de painel, navega para `/admin` (o `AuthGuard` do domínio Login intercepta e encaminha ao fluxo de criação de conta); com uma sessão já autorizada, navega direto para a tela "Editar Dados" do Admin dessa sessão.
3. **Card 3** — explicação sobre responsividade e troca de tema; ao ser clicado, alterna o tema ativo (`ThemeService.alternarTema()`).

## Sobre Mim (rota `sobre-mim`)

Exibe os dados de `AboutModel` da entrada resolvida por `LandingPageId`: nome, idade, carreira, profissão, empresa, a imagem de perfil (via `NgOptimizedImage`, `ngSrc` apontando para `AboutModel.imagem`, com a logo do projeto como valor já resolvido pelo Admin quando ausente) e a descrição (biografia, hobbies, desgostos, objetivos).

## Habilidades (rota `habilidades`)

Card central dividido por uma linha tracejada horizontal, com animação de descida no momento em que aparece. A partir dela, ramificações tracejadas também animadas: para a esquerda quando `HabilitiesModel.tipo` é `TipoHabilidade.SOFT`, para a direita quando é `TipoHabilidade.HARD`. Cada habilidade da entrada (via `HabilidadeService.listarPorId()`) aparece como um cartão individual com animação fade-in e o ícone SVG local de `HabilitiesModel.icone` (`NgOptimizedImage`, `ngSrc` para `/icons/skills/${icone}`). Abaixo do card central, botões de adicionar e remover habilidade alinhados em linha (row), presentes na tela sem nenhum manipulador de clique associado nesta spec.

## Contato e Sobre (rota `contato-e-sobre`)

Conteúdo estático mínimo (título e um texto de apresentação), sem nenhum dado dinâmico — o modelo de dados completo desta página ainda não foi fornecido pela fonte de negócio.

## URL inválida (rota index de `landing-page.routes.ts`, sem `id`)

Mensagem explicando que a URL está incompleta, com instruções e um campo de input (Reactive Forms, um único `FormControl` numérico) para o visitante digitar um `id`; ao confirmar, navega para `/landing-page/{id digitado}`. Renderiza o `Header` compartilhado sem nenhuma página navegável (mesma variante usada por `LandingPageControle`, sem os 4 links, mas mantendo o botão de logout quando há sessão ativa) — a variante `reduzido` não se aplica aqui, pois ela também ocultaria o logout, e a exibição do logout nunca é uma condição própria deste domínio.

## Landing Page não encontrada (`components/landing-page-nao-encontrada`)

Página estilizada no mesmo espírito visual do erro 404 do GitHub, reaproveitada por `LandingPageId` (quando o `id` não corresponde a nenhuma entrada) e por `LandingPageControle` (quando a sessão ativa não tem role `super`). Recebe, via `input()`, apenas o texto da mensagem — o restante do layout é fixo.

## Acesso do super (`LandingPageControle`, rota `control`)

Renderiza o `Header` compartilhado sem nenhuma página navegável (mantendo tema e logout) e, abaixo, um único cartão com os dados de Sobre Mim e a lista de Habilidades da entrada da página atual — mesmo layout de `Sobre Mim`/`Habilidades`, sem o `Header` de 4 páginas. Dois botões, "Anterior" e "Próximo", avançam ou retrocedem um cartão por vez sobre `PessoaService.listarTodas()` ordenada por `id`; cada botão é desabilitado no respectivo limite da lista (primeira ou última entrada). Quando não há nenhuma entrada cadastrada em `ArrayAboutModel`, exibe uma mensagem de lista vazia no lugar do cartão, sem exibir os botões de paginação.

## Acessibilidade

- Os 3 cards da Página Inicial e os 4 links do header têm rótulo textual próprio, nunca dependendo só de um ícone.
- O campo de `id` da página de URL inválida usa `Validators.required` e `Validators.pattern` (apenas dígitos), recebendo foco e borda vermelha quando a submissão é tentada inválida — mesma convenção de acessibilidade dos formulários do domínio Admin.
- Cada ícone de habilidade e a imagem de perfil, renderizados via `NgOptimizedImage`, declaram `width`/`height`, para não causar layout shift.
- A animação da linha central, das ramificações e do fade-in dos cartões de habilidade é suprimida sob `prefers-reduced-motion: reduce`.
- Os botões "Anterior"/"Próximo" de `LandingPageControle` anunciam, via `aria-label`, de qual pessoa para qual pessoa a navegação avança.
