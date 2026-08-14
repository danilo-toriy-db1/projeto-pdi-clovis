---
name: sistema-temas-claro-escuro
description: >
  Como estruturar as variáveis SASS e os mixins dos temas claro (`:root`) e
  escuro (`.dark-mode`) a partir da paleta fornecida, preservando o gradiente
  fixo `--background-main`, e como alternar o tema pelo ícone lua/sol do
  header. Use ao criar, editar ou revisar variáveis de tema, arquivos SCSS
  globais, dark mode, paleta de cores, o `ThemeService` ou o botão de
  alternância de tema.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Sistema de temas claro/escuro

> **Maintaining this skill**
>
> Atualize este documento sempre que a estrutura de variáveis, a lista de
> variáveis harmonizáveis ou o mecanismo de alternância de tema mudar. Um
> ajuste cosmético de valor de cor que preserva a estrutura de nomes não exige
> alteração.

## Visão geral

A aplicação exige tema claro e escuro em toda a interface, implementados em
SASS puro (sem biblioteca de UI/CSS). O ponto de partida é a paleta fornecida
pelo usuário: um conjunto de variáveis CSS com o tema claro em `:root` e o
tema escuro em `.dark-mode`, das quais apenas o gradiente `--background-main`
é fixo — as demais podem ser ajustadas em busca de melhor harmonia visual,
mantendo a mesma estrutura de nomes de variável entre os dois blocos.

## Como aplicar

- Declare as variáveis de tema em um parcial SASS próprio (por exemplo,
  `src/styles/_theme-variables.scss`), importado por `src/styles.scss`, com
  dois blocos de mesma forma:

  ```scss
  :root {
    --background-header: #6c558a;
    --background-footer: #664c86;
    --background-main: linear-gradient(
      50deg,
      rgba(190, 173, 204, 1) 0%,
      rgba(147, 103, 171, 1) 27%,
      rgba(148, 93, 212, 1) 55%,
      rgba(227, 176, 255, 1) 94%
    );
    --color-card: #e2dedeea;
    --card-edit: #ffffff;
    --hover-edit: whitesmoke;
    --white-text: #ffffff;
    --gray-text: #2b2e2c;
    --brilho-card: linear-gradient(45deg, transparent 35%, rgba(1, 1, 1, 0.25) 50%, transparent 70%);
    --linha-card: linear-gradient(90deg, transparent, rgba(1, 1, 1, 0.5), transparent);
    --card-box-shadow: rgba(28, 2, 58, 0.75);
    --hard-skill-background: whitesmoke;
    --soft-skill-background: whitesmoke;
    --container-background: #d2baf8;
    --hard-skill-border: #e73a3a;
    --soft-skill-border: #021373;
    --dashed-line-color: #616161;
    --nav-ativo: #ffd166;
  }

  .dark-mode {
    --background-header: rgba(50, 10, 10, 0.2);
    --background-footer: #1d0b35e0;
    --background-main: linear-gradient(
      50deg,
      rgba(2, 0, 36, 1) 0%,
      rgba(12, 12, 79, 1) 27%,
      rgba(70, 69, 133, 1) 55%,
      rgba(35, 10, 64, 1) 94%
    );
    --color-card: #090816;
    --card-edit: #413e68da;
    --hover-edit: #383558;
    --white-text: #eeeef067;
    --gray-text: #c8d7eead;
    --brilho-card: linear-gradient(45deg, transparent 35%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
    --linha-card: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    --card-box-shadow: rgba(23, 9, 39, 0.75);
    --container-background: #0e051c;
    --dashed-line-color: #ccc;
    --nav-ativo: #ffd166;
  }
  ```

  Os valores de `--background-header`, `--background-footer`, `--color-card`,
  `--card-edit`, `--hover-edit`, `--white-text`, `--gray-text`,
  `--brilho-card`, `--linha-card`, `--card-box-shadow`,
  `--hard-skill-background`, `--soft-skill-background`,
  `--container-background`, `--hard-skill-border`, `--soft-skill-border`,
  `--dashed-line-color` e `--nav-ativo` podem ser ajustados livremente em cada
  bloco em busca de melhor harmonia visual — desde que a mesma variável exista
  nos dois blocos. Os valores de `--background-main` (claro e escuro),
  mostrados acima, são fixos e não podem ser alterados.
- Declare as fontes (`--text-font`: "Lato", `--text-font-secundary`: "Comic
  Neue", `--cursive-font`: "Dancing Script") e as durações/delays de animação
  (`--duration-animation-*`, `--delay-*`) no mesmo parcial, em `:root` — não
  variam entre tema claro e escuro. Importe as fontes do Google Fonts via
  `@import url(...)` em `src/styles.scss`.
- Centralize comportamentos repetidos entre os dois temas em mixins SASS, um
  mixin por parcial (por exemplo, `src/styles/_brilho-card.scss` para o efeito
  `--brilho-card` aplicado aos cards da Landing Page) — o mixin usa as
  variáveis CSS acima, não valores fixos, para funcionar em ambos os temas.
- Aplique a classe `.dark-mode` no elemento raiz do documento (`<html>` ou
  `<body>`) para ativar o tema escuro; a ausência da classe mantém o tema
  claro (`:root`).
- Implemente um `ThemeService` (em `shared/services`, com `providedIn: 'root'`
  e `.spec.ts` ao lado) que mantém o tema atual em um `signal`, aplica/remove a
  classe `.dark-mode` no elemento raiz e persiste a escolha em `localStorage`
  para restaurar o tema entre sessões, já que o projeto não tem backend.
- No header, exponha a alternância por um botão com ícone de lua/sol (estado
  atual do tema refletido no ícone exibido) e `tooltip` explicando a ação,
  conforme a exigência de acessibilidade do projeto.

## Ferramentas e artefatos envolvidos

- `src/styles.scss` — ponto de entrada global de estilos, importa os parciais
  de tema.
- Parciais SASS de variáveis e mixins de tema em `src/styles/` (por exemplo,
  `_theme-variables.scss` para as variáveis e `_brilho-card.scss`,
  `_flexbox.scss`, `_sem-preferencia-de-movimento-reduzido.scss` e
  `_preferencia-de-movimento-reduzido.scss` para os mixins, um mixin por
  arquivo).
- `ThemeService` em `shared/services` — estado do tema via `signal`,
  persistência em `localStorage` e aplicação da classe `.dark-mode`.
- Botão de alternância de tema no header (ícone lua/sol, com tooltip).

## Restrições e armadilhas conhecidas

- Qualquer harmonização de cor deve manter os mínimos de contraste WCAG AA nos
  dois temas — validar com AXE após qualquer ajuste de valor.
- Nunca crie uma variável CSS presente em apenas um dos dois blocos (`:root`
  ou `.dark-mode`): a estrutura de nomes precisa ser idêntica entre os temas
  para que a alternância troque apenas o valor, nunca a existência da
  variável.
- O gradiente `--background-main` nunca é alterado, em nenhum dos dois temas.
