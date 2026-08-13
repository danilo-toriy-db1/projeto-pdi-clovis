# AGENTS.md

## Visão geral do projeto

`projeto-angular-clovis` é um projeto greenfield de estudo de Angular: uma SPA frontend, sem
banco de dados, API ou backend, cuja única forma de persistência é o `localStorage` do navegador.
O domínio é uma landing page pessoal replicável (dados de "Sobre Mim" e "Habilidades" cadastrados
por pessoa) com uma área administrativa protegida por autenticação. O mapeamento completo dos
domínios de negócio (Login/Autenticação, Landing Page, Admin), suas regras e seus modelos de dados
vive em `.agents/maps/functional-map.md` — não é reproduzido aqui.

## Stack principal

- Angular 21 (`@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`), gerado via
  Angular CLI 21.2.12.
- TypeScript 5.9.
- SASS/SCSS puro para estilos (nenhuma biblioteca de UI/CSS além disso).
- RxJS 7.8.
- Gerenciador de pacotes: npm (`npm@11.9.0`).
- O scaffold do Angular CLI configura Vitest como test runner padrão (`vitest` em
  `devDependencies`, script `test` → `ng test`). O projeto exige Jest para os testes unitários; a
  migração/configuração do runner é tratada por uma technical-skill dedicada em `.agents/skills/`.

## Estrutura do repositório

- `src/app/` — raiz da aplicação (`app.config.ts`, `app.routes.ts`, `app.ts`/`.html`/`.scss`);
  ainda sem módulos de feature implementados.
- `public/` — assets estáticos servidos como estão.
- `src/styles.scss` — estilos globais.
- `.agents/context/` — artefatos do descobrimento funcional (`discovery-answers.md`,
  `business-input.md`).
- `.agents/maps/` — `functional-map.md`, mapa dos domínios de negócio.
- `.agents/skills/` — skills de negócio (domínio) e técnicas (transversais), carregadas sob
  demanda pelo agente a partir do frontmatter `description` de cada skill; não é um índice a
  manter aqui.

Estrutura de rotas raiz planejada: `/landing-page` (com sub-rota `/landing-page/:id`), `/login` e
`/admin` — cada uma como módulo com lazy loading, convivendo com componentes. Eles devem ser modulares, mas pode haver componentes standalone que serão compartilhados com o projeto inteiro, para não ter que importar o módulo inteiro em caso de um componente ser reutilizável.

## Convenções arquiteturais importantes

- Arquitetura de componentes do tipo dumb components: componentes de apresentação recebem dados
  via `input()`/`output()` e delegam regras de negócio e acesso a dados a services.
- `input()`/`output()` devem usar a sintaxe mais recente, sem utilizar o `@Input`, por exemplo.
- Evitar sempre que possível o uso de `Observables`, preferindo o uso de `Signals`, para se aproveitar da versão mais recente do Angular.
- Utilizar Generics sempre que possível.
- Modelos de dados (interfaces/enums) seguem os princípios de Object Calisthenics.
- Estrutura de pastas `shared`: contém `services` (cada service acompanhado do seu `.spec.ts` no
  mesmo diretório), `models` (com subpastas próprias para `enums` e para `interfaces`) e os
  componentes reutilizáveis entre módulos/componentes.
- Documentação adicional da arquitetura é mantida via User Stories por módulo/componente e um
  diagrama de classes das entidades e relacionamentos — não via Swagger, Storybook ou ADRs.

## Restrições globais

- Não pode haver banco de dados, API ou backend; toda persistência é via `localStorage`.
- Stack restrita a Angular, TypeScript e SASS puros.
- Reactive Forms é obrigatório para todos os formulários (nunca Template-driven).
- Lazy Loading é obrigatório nos módulos.
- Testes unitários são obrigatórios.
- Responsividade é obrigatória em todos os dispositivos.
- Acessibilidade deve passar em todos os checks AXE e nos mínimos WCAG AA (foco, contraste,
  ARIA), incluindo tooltips nos botões de tema e de logout do header.
- Temas claro e escuro são obrigatórios em toda a aplicação.
- Ícones e imagens são fornecidos externamente; até a entrega definitiva dos ativos reais, usar
  placeholders temporários.
- Antes de implementar estilos ou decisões de arquitetura ainda não definidos no projeto, o
  agente deve perguntar ao usuário em vez de assumir uma solução própria.
- Optar por sintaxe mais recente: `Signals, inputs e outputs`, sem decorators como `@Input, @Output`.

## Comandos essenciais

- `npm start` (ou `ng serve`) — servidor de desenvolvimento em `http://localhost:4200/`.
- `npm run build` (ou `ng build`) — build de produção em `dist/`.
- `npm run watch` — build de desenvolvimento com watch.
- `npm test` (ou `ng test`) — executa os testes unitários (runner atual do scaffold: Vitest; ver
  nota de migração para Jest em "Stack principal").

## Fonte de verdade do domínio e precedência de skills

As skills locais em `.agents/skills/` são a fonte autoritativa de documentação de domínio deste
projeto. Antes de implementar qualquer regra de negócio, o agente deve consultar e ler essa fonte.
As skills em `.agents/skills/` têm precedência sobre padrões inferidos do código existente. Antes
de criar ou editar arquivos, ou de implementar qualquer feature, o agente deve verificar se existe
uma skill que governe o caso — pela tecnologia, padrão de código ou arquitetura envolvidos, ou pelo
domínio de negócio, feature ou módulo em questão — e segui-la antes de agir.

## Writing comments and documentation

Todo texto que vive neste repositório — comentário de código, docstring, skill, `AGENTS.md`,
README, spec — descreve o estado atual, escrito para quem abre o arquivo hoje sem conhecer nem o
histórico do arquivo nem a conversa que o produziu.

- **Descreva o que é, nunca a transição.** Ao editar um texto existente, reescreva a passagem a
  partir do resultado final, como se sempre tivesse sido assim. Uma frase que só faz sentido para
  quem viu a versão anterior — ou o seu próprio diff — não pertence ao arquivo: o que mudou
  pertence à mensagem de commit e à descrição do pull request.
- **Negue apenas para prevenir um erro plausível.** Uma negação só se justifica quando um leitor
  competente de fato tentaria a alternativa e a frase explica por que ela falha, protegendo assim
  uma mudança futura. Contrastar com a versão anterior, com uma alternativa que ninguém tentaria,
  ou com o que o código já mostra é ruído que custa a atenção do leitor.
- **Podar antes de terminar a tarefa.** Releia os textos que você criou ou alterou e corte o que
  falhar nas duas regras acima. Expressões como "não é mais", "costumava", "agora é", "em vez de",
  "ao invés de", "diferente de" e "sem precisar de" são os sintomas mais comuns — mantenha apenas
  as que sobrevivem à segunda regra.

Uma exceção: quando o assunto do texto **é** uma mudança — uma mensagem de commit, a descrição de
um pull request, a spec de uma unidade de manutenção, um changelog — a transição é o conteúdo. A
regra proíbe narrar a *edição do texto*, nunca a mudança sobre a qual o texto fala.
