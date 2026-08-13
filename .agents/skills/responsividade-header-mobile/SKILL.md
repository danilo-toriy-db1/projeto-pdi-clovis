---
name: responsividade-header-mobile
description: >
  Como o header de cada rota (Landing Page, Admin, Login) se comporta em telas
  mobile: o header fixo desaparece, surge um ícone de menu hambúrguer no canto
  superior direito e, ao ser clicado, abre uma sidebar (off-canvas) que
  reproduz o mesmo conteúdo do header (páginas de navegação, botão de logout,
  alternância de tema); em tablet e desktop o header permanece fixo e normal.
  Use ao criar, editar ou revisar o componente de header, breakpoints de
  responsividade, o menu hambúrguer ou a sidebar mobile.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Menu hambúrguer e sidebar responsiva do header

> **Maintaining this skill**
>
> Atualize este documento sempre que o comportamento responsivo do header
> mudar (novo breakpoint, novo conteúdo exibido na sidebar, novo mecanismo de
> abertura/fechamento). Um ajuste cosmético que preserva o comportamento não
> exige alteração.

## Visão geral

Em telas mobile, o header fixo de cada rota desaparece e é substituído por um
ícone de menu hambúrguer fixado no canto superior direito da tela. Ao clicar
nesse ícone, abre-se uma sidebar (painel off-canvas) que reproduz o mesmo
conteúdo que o header exibiria — páginas de navegação, botão de alternância de
tema e, quando presente, botão de logout. Em tablet e desktop, o header
permanece com o layout fixo padrão, sem hambúrguer nem sidebar. O
comportamento se aplica a todo header da aplicação, incluindo o header
reduzido da rota `/login` (que hoje só tem o ícone de tema): nesse caso a
sidebar reproduz apenas esse conteúdo reduzido, sem itens de navegação ou
logout que o header original não tem.

## Como aplicar

- Breakpoints: mobile é toda largura de viewport até 767px; tablet vai de
  768px a 1023px; desktop é 1024px em diante. Tablet e desktop usam o mesmo
  layout de header fixo, sem diferença de comportamento entre si.
- Declare os breakpoints como variáveis SASS num parcial dedicado (por
  exemplo, `src/styles/_breakpoints.scss`) e exponha-os por mixins (por
  exemplo, `@mixin mobile { @media (max-width: 767px) { @content; } }`), para
  que todo componente que precise consultar o limite de mobile use o mesmo
  valor.
- Em telas mobile, oculte a barra de header fixa (`display: none` dentro do
  mixin de mobile) e exiba, no lugar dela, um botão fixo no canto superior
  direito (`position: fixed`, alinhado a `top`/`right`) com o ícone de menu
  hambúrguer, `aria-label` ("Abrir menu" ou "Fechar menu", conforme o estado),
  `aria-expanded` e `aria-controls` apontando para o id da sidebar.
- A sidebar reorganiza em coluna o mesmo conteúdo do header — páginas de
  navegação, botão de alternância de tema e botão de logout quando aplicável
  — e desliza a partir de uma borda lateral da tela ao ser aberta.
- Controle o estado aberto/fechado da sidebar com um `signal<boolean>` local
  ao componente de header, ou por um `HeaderService` em `shared/services`
  quando o botão hambúrguer e a sidebar não forem irmãos diretos no template
  e precisarem compartilhar o estado.
- Feche a sidebar ao navegar para uma nova rota, ao pressionar Esc ou ao
  clicar fora dela, devolvendo o foco ao botão hambúrguer que a abriu.
- Mantenha nos controles da sidebar (tema, logout) os mesmos `tooltip`s
  exigidos no header fixo — a troca de layout não reduz a exigência de
  acessibilidade.

## Ferramentas e artefatos envolvidos

- Parcial SASS de breakpoints (por exemplo, `src/styles/_breakpoints.scss`)
  com o mixin de mobile usado pelo header e pela sidebar.
- Componente(s) de header de cada rota (`/landing-page`, `/admin`, `/login`)
  — cada um ganha o botão hambúrguer e a sidebar equivalente ao próprio
  conteúdo desse header.
- `HeaderService` (opcional, em `shared/services`, com `.spec.ts` ao lado) —
  estado compartilhado de aberto/fechado da sidebar, quando o botão hambúrguer
  e a sidebar não forem irmãos diretos no template.

## Restrições e armadilhas conhecidas

- Nunca duplique itens de navegação entre o header fixo e a sidebar como
  conteúdos independentes — a sidebar reaproveita a mesma fonte de
  dados/template do header, apenas reorganizada em coluna; alterar uma página
  do header sem refletir na sidebar (ou vice-versa) gera divergência.
- A sidebar não inventa conteúdo que o header original não tem: o header
  reduzido de `/login` (só o ícone de tema) gera uma sidebar igualmente
  reduzida, sem páginas de navegação nem botão de logout.
- Ao abrir a sidebar, bloqueie o scroll do `body` por trás dela — evita
  rolagem dupla em mobile — e restaure-o ao fechar.
- Um botão hambúrguer sem `aria-expanded`/`aria-controls` corretos quebra a
  navegação por leitor de tela, violando os checks AXE exigidos no projeto.
