---
name: documentacao-user-stories-diagrama-classes
description: >
  Como escrever User Stories por módulo (ou por tipo de componente, quando
  mais abrangente) e manter um diagrama de classes das entidades e seus
  relacionamentos, como documentação de arquitetura no lugar de Swagger,
  Postman, Storybook ou ADR. Use ao criar ou atualizar user stories, ao
  adicionar/alterar uma entidade, enum ou relacionamento de modelo de dados,
  ou ao decidir onde documentar um fluxo, contrato ou decisão de arquitetura.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Documentação com User Stories e diagrama de classes

> **Maintaining this skill**
>
> Atualize este documento sempre que a forma de organizar User Stories ou de
> manter o diagrama de classes mudar. Um refactor de código que não altera
> entidades, relacionamentos ou fluxos documentados não exige alteração.

## Visão geral

O projeto não usa Swagger, Postman, Storybook ou ADR: não há API para
documentar (persistência é só `localStorage`) e a arquitetura de dumb
components concentra as regras em services, não em componentes isolados que
justifiquem um catálogo de Storybook. A documentação de arquitetura e
comportamento é mantida em dois artefatos complementares: User Stories, que
descrevem o comportamento esperado por módulo, e um diagrama de classes, que
descreve as entidades dos modelos de dados e seus relacionamentos.

## Como aplicar

- Mantenha um arquivo de User Stories por módulo de negócio em
  `docs/user-stories/<modulo>.md` — um arquivo por módulo (`landing-page.md`,
  `admin.md`, `login.md`), ou um arquivo por tipo de componente quando o
  comportamento for mais abrangente que um único módulo (por exemplo, um
  comportamento de tema ou de acessibilidade compartilhado entre módulos).
- Escreva cada User Story no formato:

  ```markdown
  ## <Título curto da história>

  Como <papel: visitante, usuário logado, admin, superAdmin>,
  quero <ação>,
  para <objetivo>.

  **Critérios de aceite**
  - <critério observável 1>
  - <critério observável 2>
  ```

- Mantenha um único diagrama de classes em `docs/diagrama-classes.md`,
  descrevendo as entidades dos modelos de dados (interfaces e enums em
  `shared/models`) e seus relacionamentos, em sintaxe Mermaid
  (` ```mermaid classDiagram `), renderizada nativamente pelo GitHub sem
  ferramenta externa. Por exemplo, para as entidades já decididas do domínio
  Admin:

  ```mermaid
  classDiagram
    class ArrayAboutModel {
      +id: number
      +dados: AboutModel
    }
    class AboutModel {
      +nome: string
      +idade: number
      +carreira: string
      +profissao: string
      +empresa: string
      +imagem: string
      +descricao: DescricaoAbout
    }
    class DescricaoAbout {
      +biografia: string
      +hobbies: string
      +desgostos: string
      +objetivos: string
    }
    class ArrayHabilitiesModel {
      +id: number
      +habilidade: HabilitiesModel
    }
    class HabilitiesModel {
      +habilidade: string
      +tipo: TipoHabilidade
    }
    class TipoHabilidade {
      <<enumeration>>
      SOFT
      HARD
    }
    ArrayAboutModel --> AboutModel
    AboutModel --> DescricaoAbout
    ArrayHabilitiesModel --> HabilitiesModel
    HabilitiesModel --> TipoHabilidade
  ```

- Atualize o diagrama de classes sempre que uma entidade, enum ou
  relacionamento de `shared/models` for criado, renomeado ou alterado — ele
  reflete o estado atual dos modelos, não seu histórico.
- Ao registrar uma decisão de fluxo ou de contrato (por exemplo, como um
  service expõe dados a um componente), descreva-a na User Story do módulo
  correspondente, nos critérios de aceite ou em uma nota junto à história —
  nunca crie um ADR separado para isso.

## Ferramentas e artefatos envolvidos

- `docs/user-stories/<modulo>.md` — uma User Story por comportamento
  observável, agrupada por módulo ou por tipo de componente abrangente.
- `docs/diagrama-classes.md` — diagrama único, em Mermaid, das entidades de
  `shared/models` e seus relacionamentos.
- `shared/models` (com subpastas `enums` e `interfaces`) — fonte das entidades
  refletidas no diagrama de classes.

## Restrições e armadilhas conhecidas

- Não introduza Swagger, Postman, Storybook ou ADR neste projeto — são
  formas de documentação descartadas em favor de User Stories e do diagrama
  de classes.
- Uma User Story sem critérios de aceite observáveis não é suficiente: cada
  história precisa declarar como validar que o comportamento foi implementado
  corretamente.
- O diagrama de classes descreve apenas entidades de modelo de dados
  (interfaces/enums) e seus relacionamentos — não é um diagrama de
  componentes, de sequência ou de arquitetura de módulos.
