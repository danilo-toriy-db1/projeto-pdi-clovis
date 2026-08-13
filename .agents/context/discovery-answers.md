---
name: discovery-answers
description: Objetivo, escopo, restrições declaradas, decisões transversais validadas (paleta de cores, autenticação, documentação, organização de pastas, rotas e modelos de dados finais de AboutMe/Skill) e o log completo de decisões humanas do descobrimento funcional deste projeto Angular de estudo.
metadata:
  author: clovis-cli
  responsibility: Memória durável do contexto e das decisões da descoberta funcional: objetivo, escopo, restrições declaradas, decisões transversais validadas (com destino), formas de documentação a manter e o log de decisões humanas resolvidas no loop de gaps. Fonte relida pelos estágios seguintes; suas restrições prevalecem sobre inferências posteriores.
---

# Objetivo e escopo

Projeto greenfield de estudo de Angular: uma SPA frontend, sem banco de dados, API ou backend,
que usa `localStorage` como única forma de persistência. O escopo desta rodada é o projeto
inteiro (`whole_project`).

O diretório de execução já contém um scaffold padrão gerado pelo Angular CLI 21.2.12
(`ng new`), ainda sem nenhuma feature de negócio implementada:
- `src/app/app.routes.ts` — array de rotas vazio.
- `src/app/app.config.ts` — apenas `provideBrowserGlobalErrorListeners` e `provideRouter`.
- `package.json` — dependências padrão do Angular 21 (`@angular/*`) e, nas dev dependencies,
  `vitest` como test runner padrão do scaffold (ver conflito abaixo).
- Nenhum diretório `.agents/` pré-existente antes desta descoberta.

# Restrições declaradas pelo usuário

- Não pode haver banco de dados, API ou backend; toda persistência é via `localStorage`.
- Stack restrita a Angular, TypeScript e SASS puros — nenhuma outra biblioteca de UI/CSS.
- Reactive Forms é obrigatório para todos os formulários (nunca Template-driven).
- Lazy Loading obrigatório nos módulos.
- O projeto é misto: 3 módulos principais (com rotas por módulo) convivendo com componentes
  standalone.
- Testes unitários obrigatórios usando **Jest**.
- Responsividade obrigatória em todos os dispositivos.
- Acessibilidade deve ser implementada (ver também `.claude/CLAUDE.md`, que já exige
  conformidade com AXE e WCAG AA).
- Temas claro e escuro obrigatórios em toda a aplicação.
- Ícones e imagens serão fornecidos externamente; até a entrega definitiva, devem ser usados
  placeholders temporários (decisão registrada na seção de gaps resolvidos).
- A paleta de cores é a registrada na seção "Paleta de cores e tipografia" abaixo.
- **Antes de implementar estilos ou decisões de arquitetura do projeto, o agente deve
  perguntar ao usuário em vez de assumir uma solução própria** — restrição explícita reforçada
  pelo usuário na resposta ao gap de autenticação.
- Arquitetura de componentes deve favorecer o padrão dumb components: componentes de
  apresentação recebem dados via `input()`/`output()` e delegam regras e acesso a dados a
  services; abstrair o máximo possível para os services.
- Estrutura de pastas: deve existir uma pasta `shared` contendo o que é reaproveitado entre
  módulos/componentes — dentro dela, uma pasta `services` (cada service acompanhado do seu
  `.spec.ts` no mesmo diretório), uma pasta `models` (com subpastas próprias para `enums` e para
  `interfaces`) e os componentes reutilizáveis.
- Modelos de dados devem seguir os princípios de Object Calisthenics (abstrações pequenas,
  focadas e replicáveis), conforme o padrão já usado pelo usuário em `HabilitiesModel`.
- Estrutura de rotas raiz: `/landing-page` (com sub-rota `/landing-page/:id` para exibir a
  Landing Page de uma pessoa específica), `/login` e `/admin`.

**Conflito de stack identificado (evidência no código):** o scaffold gerado pelo Angular CLI 21
já configura `vitest` como test runner (`package.json`, script `test`: `ng test`). Isso conflita
com a restrição explícita de usar Jest. Decisão: a restrição do usuário prevalece — o runner de
testes deve ser migrado/configurado para Jest (ex.: `jest`, `jest-preset-angular`) no Estágio 2,
substituindo a configuração padrão de Vitest.

# Paleta de cores e tipografia

O usuário forneceu um conjunto de variáveis CSS já em uso como ponto de partida, com a seguinte
regra de aplicação: **apenas o gradiente `--background-main` (tema claro e escuro) deve ser
mantido exatamente como fornecido**; todas as demais variáveis (cores de card, sombra, brilho,
linha, cores de hard/soft skill, fontes, durações de animação etc.) podem e devem ser ajustadas
pelo Estágio 2 em busca de melhor harmonia visual, mantendo a mesma estrutura de nomes de
variáveis (tema claro em `:root`, tema escuro em `.dark-mode`).

Valores de referência fornecidos pelo usuário (para ajuste de harmonia, exceto `--background-main`,
que é fixo):

```css
:root {
    --background-header: #6c558a;
    --background-footer: #664c86;
    --background-main: linear-gradient(50deg, rgba(190,173,204,1) 0%, rgba(147,103,171,1) 27%, rgba(148,93,212,1) 55%, rgba(227,176,255,1) 94%);
    --color-card: #e2dedeea;
    --card-edit: #ffffff;
    --hover-edit: whitesmoke;
    --text-font: "Lato", Sans-Serif;
    --text-font-secundary: "Comic Neue", Sans-Serif;
    --cursive-font: "Dancing Script", Sans-Serif;
    --white-text: #FFFFFF;
    --gray-text: #2b2e2c;
    --brilho-card: linear-gradient(45deg, transparent 35%, rgb(1,1,1,0.25) 50%, transparent 70%);
    --linha-card: linear-gradient(90deg, transparent, rgba(1,1,1,0.5), transparent);
    --card-box-shadow: rgba(28,2,58,0.75);
    --hard-skill-background: whitesmoke;
    --soft-skill-background: whitesmoke;
    --container-background: #d2baf8;
    --hard-skill-border: #e73a3a;
    --soft-skill-border: #021373;
    --dashed-line-color: #616161;
    --duration-animation-linha-principal: 2s;
    --duration-animation-linha-galho: 2s;
    --duration-animation-fadeIn: 2s;
    --duration-animation-pintar-card: 2s;
    --delay-galho-animation: 2s;
    --delay-fadeIn: 4s;
    --delay-pintar-card: 4s;
}
.dark-mode {
    --background-header: rgba(50,10,10,0.2);
    --background-footer: #1d0b35e0;
    --background-main: linear-gradient(50deg, rgba(2,0,36,1) 0%, rgba(12,12,79,1) 27%, rgba(70,69,133,1) 55%, rgba(35,10,64,1) 94%);
    --color-card: #090816;
    --card-edit: #413e68da;
    --hover-edit: #383558;
    --white-text: #eeeef067;
    --gray-text: #c8d7eead;
    --brilho-card: linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.05) 50%, transparent 70%);
    --linha-card: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    --card-box-shadow: rgba(23,9,39,0.75);
    --container-background: #0e051c;
    --dashed-line-color: #ccc;
}
```

Fontes de origem (Google Fonts, a manter): `Comic Neue`, `Dancing Script`, `Lato` — importadas via
`@import url('https://fonts.googleapis.com/css2?...')`.

Os cards da página inicial da Landing Page usam o efeito `--brilho-card` (brilho diagonal).

# Decisões transversais validadas

| Decisão | Resolução | Destino |
|---|---|---|
| Test runner | Jest obrigatório (substitui o Vitest padrão do scaffold) | `technical-skill` — configuração de testes com Jest |
| Persistência | Somente `localStorage`, sem IndexedDB/backend | Convenção em `AGENTS.md` |
| Formulários | Reactive Forms em todos os formulários | Convenção em `AGENTS.md` |
| Arquitetura de módulos | 3 módulos com lazy loading (Landing Page, Admin, Login) + componentes standalone mistos | Refletido em `functional-map.md` (um domínio por módulo) |
| Proteção de rota | `AuthGuard` na rota do módulo Admin | Refletido no domínio `Login / Autenticação` e nas dependências do domínio `Admin` |
| Papéis de usuário | Roles `user`, `admin` e `Super` (superAdmin), com dois usuários fixos iniciais e criação de novos usuários pela tela de edição de usuários do Admin | Refletido no domínio `Login / Autenticação` |
| Temas claro/escuro | Obrigatório em toda a aplicação, via SASS (mixins); alternância por ícone lua/sol no header | `technical-skill` — sistema de temas claro/escuro com SASS |
| Paleta de cores e tipografia | Fornecida pelo usuário (ver seção acima); `--background-main` é fixo, o restante pode ser harmonizado | Refletido em `functional-map.md` e na `technical-skill` de temas |
| Responsividade | Obrigatória em todos os dispositivos | Convenção em `AGENTS.md` |
| Acessibilidade | AXE + WCAG AA (já declarado em `.claude/CLAUDE.md`); tooltips nos botões de tema e logout do header | Convenção em `AGENTS.md` |
| Ícones e imagens | Placeholders temporários até a entrega definitiva dos ativos reais | Convenção em `AGENTS.md` |
| Documentação adicional | User Stories por módulo/componente + diagrama de classes das entidades e relacionamentos, no lugar de Swagger/Storybook/ADR | `technical-skill` — documentação via User Stories e diagrama de classes |
| Arquitetura de componentes | Padrão dumb components, com regras e acesso a dados delegados a services | Convenção em `AGENTS.md` |
| Estrutura de pastas compartilhadas | Pasta `shared` com `services` (cada um com seu `.spec.ts` junto), `models` (com subpastas `enums` e `interfaces`) e componentes reutilizáveis | Convenção em `AGENTS.md` |
| Confirmação prévia de estilos/arquitetura | O agente deve perguntar ao usuário antes de decidir estilos ou arquitetura ainda não definidos, em vez de assumir por conta própria | Convenção em `AGENTS.md` |
| Estrutura de rotas raiz | `/landing-page` (+ `/landing-page/:id`), `/login`, `/admin` | Refletido nos domínios `Landing Page`, `Login / Autenticação` e `Admin` em `functional-map.md` |
| Ícones de habilidades | SVG armazenados localmente no projeto (sem dependência de CDN externo), referenciados por chave/nome de arquivo em `HabilitiesModel` | `technical-skill` — gestão de ícones SVG locais |
| Imagem de perfil em `AboutModel` | Campo `imagem` (caminho da imagem do usuário); na ausência de imagem, usa a logo do projeto como placeholder padrão | Refletido no domínio `Admin` em `functional-map.md` |
| Object Calisthenics em modelos | Modelos de dados (interfaces/enums) devem seguir os princípios de Object Calisthenics | Convenção em `AGENTS.md` |
| Header responsivo em mobile | Em telas mobile (até 767px) o header fixo de cada rota desaparece e dá lugar a um ícone de menu hambúrguer no canto superior direito, que abre uma sidebar com o mesmo conteúdo do header (páginas de navegação, tema, logout); tablet e desktop mantêm o header fixo padrão | `technical-skill` — menu hambúrguer e sidebar responsiva do header |

# Framework spec-driven concorrente

Nenhuma evidência de outro framework spec-driven (`.specify/`, `openspec/` ou equivalentes) no
diretório do projeto. Apenas os diretórios `.claude/` e `.clovis/` estão presentes, ambos
relacionados à própria ferramenta Clovis/Claude Code. Sem conflito a resolver.

# Log de decisões humanas (loop de gaps)

- **auth-mechanism-sem-backend** (domínio Login/Autenticação) — Gap: como validar credenciais
  sem backend. Decisão: dois usuários fixos iniciais, `user` (senha `123U`, role `user`) e
  `admin` (senha `123@`, role `admin`); deve ser possível criar novos usuários pela tela de
  edição de usuários do Admin; existe uma conta `superAdmin` com role `Super`, que é a única que
  não pode ser excluída pela tela de edição de usuários; a Landing Page é acessível com ou sem
  login; as variações de conteúdo entre estado logado/deslogado serão detalhadas pelo usuário em
  uma rodada futura (não é gap nesta rodada — fica como trabalho futuro fora do escopo da
  descoberta). O usuário reforçou que decisões futuras de estilo ou arquitetura devem ser
  perguntadas antes de implementadas (restrição já registrada acima).
- **dados-administrados-pelo-admin** (domínio Admin) — Gap: quais dados o Admin gerencia.
  Decisão (parcial — o próprio usuário sinalizou que a resposta ficou incompleta por um envio
  acidental): a página inicial do Admin tem 3 cards (alternar tema, voltar para `/landing-page`,
  ir para a tela de edição de dados); o header do Admin tem 3 páginas (Página Inicial, Edição de
  Dados, Edição de Usuários — esta última implementa a decisão do gap de autenticação); os dados
  da Landing Page geridos em "Edição de Dados" incluem um array `AboutMe[]` com os campos `id`,
  `nome`, `idade`, `carreira`, `profissao`, `empresa` e `descricao` — a estrutura interna de
  `descricao` e a estrutura da entidade de habilidades (Skills) ainda não foram detalhadas; ver
  gaps abertos no `functional-map.md`.
- **conteudo-landing-page** (domínio Landing Page) — Gap: conteúdo/seções da Landing Page.
  Decisão: header com páginas do lado esquerdo (Página Inicial, Sobre Mim, Habilidades, Contato,
  Sobre — quantidade exata ainda a confirmar, ver gap aberto) e, do lado direito, um botão de
  alternância de tema (ícone lua/sol) e um botão de logout (visível apenas quando logado), ambos
  com tooltip; a Página Inicial tem logo, nome do projeto ("My Landing Page"), descrição e 3
  cards (link para o repositório do GitHub do projeto; redirecionamento para o Admin exigindo
  criação de conta, para o visitante criar sua própria Landing Page; explicação sobre
  responsividade/tema, que ao ser clicado alterna o tema da página); a página de Habilidades tem
  um card central com uma linha tracejada animada ao aparecer, com ramificações tracejadas
  também animadas (para a esquerda quando a habilidade é soft-skill, para a direita quando é
  hard-skill), cada habilidade é um cartão com animação fade-in, e há botões de adicionar/remover
  habilidades alinhados em linha (row) abaixo do card central, cuja funcionalidade completa será
  detalhada pelo usuário em rodada futura; as páginas de Contato e Sobre têm conteúdo estático, a
  ser fornecido pelo usuário em um modelo de dados completo futuramente (não é gap nesta rodada);
  os dados de Sobre Mim e de Habilidades exibidos na Landing Page são dinâmicos, provenientes do
  que for cadastrado na tela de Edição de Dados do Admin.
- **paleta-de-cores** (geral) — Gap: paleta de cores a requisitar antes de iniciar. Decisão:
  paleta e tipografia fornecidas pelo usuário, registradas na seção "Paleta de cores e
  tipografia" acima; apenas `--background-main` (claro e escuro) é fixo, o restante pode ser
  harmonizado livremente pelo Estágio 2.
- **icones-e-imagens** (geral) — Gap: ícones e imagens ainda não entregues. Decisão: seguir com
  placeholders temporários até a entrega definitiva dos ativos reais pelo usuário.
- **documentacao-adicional** (geral) — Gap: forma de documentação adicional a manter. Decisão:
  não usar Swagger/Postman/Storybook/ADR; usar User Stories organizadas por módulo (ou por tipo
  de componente, quando mais abrangente) e um diagrama de classes mostrando os relacionamentos
  entre as entidades, para documentar a arquitetura; reforçada a preferência por abstrair regras
  e acesso a dados em services (dumb components). Nessa mesma resposta, o usuário declarou as
  restrições adicionais de estrutura de pastas já registradas na seção de restrições acima
  (pasta `shared` com `services`, `models` com subpastas `enums`/`interfaces`, e componentes
  reutilizáveis).
- **estrutura-descricao-aboutme** (domínio Admin) — Gap: estrutura completa do campo `descricao`
  de `AboutMe` (a resposta anterior havia ficado incompleta). Decisão: o modelo final é
  `ArrayAboutModel { id: number, dados: AboutModel }`, em que o `id` do array identifica a Landing
  Page de cada pessoa (permitindo replicar o modelo para múltiplas Landing Pages); `AboutModel`
  contém `nome`, `idade`, `carreira`, `profissao`, `empresa` e `descricao: { biografia, hobbies,
  desgostos, objetivos }` (todos `string`). Também foi acrescentado no mesmo campo de resposta um
  campo `imagem` em `AboutModel`, referente à foto do usuário, com a logo do projeto como
  placeholder padrão quando ausente.
- **estrutura-entidade-skill** (domínio Admin) — Gap: estrutura completa da entidade `Skill`.
  Decisão: o modelo final é `ArrayHabilitiesModel { id: number, habilidade: HabilitiesModel }`,
  em que `HabilitiesModel` contém `habilidade: string` e `tipo: TipoHabilidade`, com
  `TipoHabilidade` sendo um enum (`SOFT = "soft-skill"`, `HARD = "hard-skill"`). O usuário pediu
  para o agente decidir a estratégia de ícones das habilidades; decisão: ícones em SVG
  armazenados localmente no projeto (sem depender de um CDN externo, coerente com a restrição de
  não haver backend/API), referenciados por uma chave/nome de arquivo a ser adicionada a
  `HabilitiesModel`.
- **quantidade-paginas-landing-page** (domínio Landing Page) — Gap: contradição entre "4 páginas"
  e 5 nomes citados. Decisão: são de fato 4 páginas — Página Inicial, Sobre Mim, Habilidades e uma
  única página de nome composto "Contato e Sobre". Também ficou confirmado que `/admin` tem 3
  páginas (Página Inicial, Editar Dados, Editar Usuários) e que `/login` exibe apenas o header com
  o ícone de alternância de tema, sem as demais páginas do header público. O usuário sugeriu ainda
  a rota `/landing-page/:id` para exibir a Landing Page de uma pessoa específica de acordo com o
  `id` do array `AboutModel`.
