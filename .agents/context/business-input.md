---
name: business-input
description: Texto de regras de negócio fornecido pelo usuário no questionário inicial e em duas rodadas de resposta a gaps, incluindo os modelos finais de AboutMe/Skill, rotas raiz e estratégia de ícones, sem outras fontes externas referenciadas.
metadata:
  author: clovis-cli
  responsibility: Registro fiel do material de negócio fornecido pelo usuário e índice de proveniência e reacesso desse material, organizado por fonte. O Estágio 2 reabre as fontes originais a partir daqui; não classifica domínios, limites, dependências nem nível de confiança.
---

# Fonte única: texto fornecido pelo usuário no questionário e nas respostas aos gaps

O usuário não indicou nenhum arquivo, URL ou espaço MCP como fonte de regras de negócio — todo
o material foi fornecido diretamente como texto livre, tanto no campo de regras de negócio da
sessão de descoberta inicial quanto nas respostas aos gaps da primeira rodada de incorporação.
Não há, portanto, fontes externas a indexar.

## Texto original (preservado integralmente)

> Dados armazenados em LocalStorage;
> Testes Unitários usando JEST devem ser implementados;
> Deve-se usar Angular.ts, TypeScript e SASS, nada mais;
> Deve-se atentar ao projeto, pois irá ser separado em 3 módulos principais, mas haverá
> componentes standalone (misto);
> Ícones e imagens serão fornecidos, deve-se aguardar ou requisitar caso não tenha;
> Deve-se usar Rotas por módulo, as URLs serão referentes aos módulos;
> Deve-se requisitar a paleta de cores antes de iniciar;
> Boas práticas devem ser mantidas e aplicadas sempre que possível;
> Use mixins do SASS;
> Lazy Loading deve ser aplicado nos Módulos;
> Os três módulos serão referentes à: Landing Page, Admin, Login;
> AuthGuard para a rota de admin;
> Deve-se ter temas claro e escuro;
> Deve-se aplicar responsividade em todo o projeto para todos os dispositivos;
> Acessibilidade deve ser implementada;

**Restrições declaradas** (mesmo campo de sessão, lista separada):

> Não pode ter banco de dados, api ou backend
> Frontend em Angular, SASS e typescript puros
> Reactive Forms deve ser usado
> Lazy Loading em Módulos
> Deve-se ser capaz de misturar em módulos e componentes Standalones
> Testes unitários gerados usando JEST obrigatoriamente
> Responsividade obrigatória

**Proveniência:** texto fornecido pelo usuário (campo de regras de negócio da sessão de
descoberta do Clovis CLI, registrado também em `.clovis/cli-state.json` → `discoveryAnswers.businessInput`
e `discoveryAnswers.restrictions`).

**Reacesso:** reabrir `.clovis/cli-state.json` na raiz do projeto, chave `discoveryAnswers`, ou
reler este arquivo — o texto acima é a cópia fiel do conteúdo original.

# Índice por tema

Cada tema abaixo aponta para o trecho correspondente do texto original acima; não há conteúdo
adicional fora do que já está transcrito.

## Persistência
- "Dados armazenados em LocalStorage" (texto original, linha 1) + restrição "Não pode ter banco
  de dados, api ou backend" (restrições, linha 1).

## Testes
- "Testes Unitários usando JEST devem ser implementados" (texto original, linha 2) + restrição
  "Testes unitários gerados usando JEST obrigatoriamente" (restrições, linha 6).

## Stack tecnológica
- "Deve-se usar Angular.ts, TypeScript e SASS, nada mais" (texto original, linha 3) + restrição
  "Frontend em Angular, SASS e typescript puros" (restrições, linha 2).

## Arquitetura de módulos e componentes
- "Deve-se atentar ao projeto, pois irá ser separado em 3 módulos principais, mas haverá
  componentes standalone (misto)" (texto original, linha 4) + restrição "Deve-se ser capaz de
  misturar em módulos e componentes Standalones" (restrições, linha 5).
- "Deve-se usar Rotas por módulo, as URLs serão referentes aos módulos" (texto original, linha 6).
- "Os três módulos serão referentes à: Landing Page, Admin, Login" (texto original, linha 11).
- "Lazy Loading deve ser aplicado nos Módulos" (texto original, linha 9) + restrição "Lazy
  Loading em Módulos" (restrições, linha 4).

## Autenticação e proteção de rota
- "AuthGuard para a rota de admin" (texto original, linha 12).
- Usuários fixos, roles e conta `superAdmin` protegida contra exclusão: resposta ao gap
  `auth-mechanism-sem-backend` (seção "Texto original das respostas aos gaps" acima).

## Dados administrados no Admin e conteúdo da Landing Page
- Página inicial do Admin (3 cards), header do Admin (3 páginas) e entidade `AboutMe[]`
  (estrutura inicial): resposta ao gap `dados-administrados-pelo-admin`.
- Seções da Landing Page, header público, página inicial com 3 cards, página de Habilidades com
  animações e card central, e origem dinâmica dos dados de Sobre Mim/Habilidades a partir do
  Admin: resposta ao gap `conteudo-landing-page`.
- Modelo final de `AboutModel`/`ArrayAboutModel` (incluindo o campo `descricao` e o campo
  `imagem`), modelo final de `HabilitiesModel`/`ArrayHabilitiesModel`/`TipoHabilidade`, decisão
  sobre ícones SVG locais, confirmação de 4 páginas na Landing Page (com "Contato e Sobre" como
  página única) e as rotas raiz `/landing-page` (+ `/landing-page/:id`), `/login`, `/admin`:
  respostas aos gaps `estrutura-descricao-aboutme`, `estrutura-entidade-skill` e
  `quantidade-paginas-landing-page` (segunda rodada de incorporação).

## Documentação e organização de pastas
- Uso de User Stories por módulo/componente e diagrama de classes no lugar de
  Swagger/Storybook/ADR, arquitetura dumb components e estrutura da pasta `shared`
  (`services`, `models` com subpastas `enums`/`interfaces`, componentes reutilizáveis): resposta
  ao gap `documentacao-adicional`.

## Formulários
- Restrição "Reactive Forms deve ser usado" (restrições, linha 3). Nenhum formulário específico
  foi descrito no texto original — aplica-se a todo formulário que vier a existir no projeto.

## Ativos visuais (ícones, imagens, paleta de cores)
- "Ícones e imagens serão fornecidos, deve-se aguardar ou requisitar caso não tenha" (texto
  original, linha 5) — resolvido com placeholders temporários (resposta ao gap
  `icones-e-imagens`).
- "Deve-se requisitar a paleta de cores antes de iniciar" (texto original, linha 7) — paleta e
  tipografia fornecidas na resposta ao gap `paleta-de-cores` (bloco CSS completo em
  `discovery-answers.md`, seção "Paleta de cores e tipografia").

## Temas e responsividade
- "Deve-se ter temas claro e escuro" (texto original, linha 13).
- "Deve-se aplicar responsividade em todo o projeto para todos os dispositivos" (texto original,
  linha 14) + restrição "Responsividade obrigatória" (restrições, linha 7).

## Acessibilidade e boas práticas
- "Acessibilidade deve ser implementada" (texto original, linha 15).
- "Boas práticas devem ser mantidas e aplicadas sempre que possível" (texto original, linha 8) —
  complementado pelas convenções já fixadas em `.claude/CLAUDE.md` (fora do escopo deste
  arquivo, que registra apenas o material de negócio).

## Texto original das respostas aos gaps (primeira rodada de incorporação, preservado integralmente)

**Resposta ao gap `auth-mechanism-sem-backend`:**

> Ele terá dois usuários inicias: user e admin. As senhas serão respectivamente 123U e 123@. São
> dois usuários fixos, mas deve haver a possibilidade de criar novos usuários. Ademais, devem ter
> duas Roles diferentes, como admin e como user. Deve-se criar uma conta de superAdmin com role
> Super, ele é o unico que não poderá ser apagado no futuro pela página de edição de usuários que
> deve existir no módulo admin. A landing page pode ser acessada sem ou com login. As mudanças
> sobre acesso logado ou deslogado serão passados por mim pra você depois. Além disso, tem muitas
> coisas que você deverá me perguntar antes de fazer, como estilos ou arquitetura do projeto, não
> se esqueça.

**Resposta ao gap `dados-administrados-pelo-admin`:**

> Ele conterá a página inicial com uma leve apresentação sobre o painel, contendo 3 cards: o
> Primeiro, serve para alterar o tema da página, o segundo para voltar para o /landing-page e o
> terceiro para mudar para a tela que tenha o componente de edicao. O header tera 3 paginas: a
> pagina inicial, edicao de dados e edicao de usuarios. Esse ultimo é referente a primeira
> pergunta que te respondi. O segundo será a edicao de dados. Os dados armazenados da landing
> page serão:
> ArrayAboutMe[]: [
> { id: number,
>   nome: string,
>   idade: number,
>   carreira: string,
>   profissao: string,
>   empresa: string,
>   descricao: {
>   }
> ]

**Resposta ao gap `conteudo-landing-page`** (o próprio usuário sinalizou que a resposta ao gap
anterior ficou incompleta por um envio acidental de ENTER):

> Antes de qualquer coisa, preciso que você me questione sobre as entidades novamente pois
> apertei ENTER sem querer na pergunta 2. Não se esqueça disso, a informação da pergunta 2 está
> incompleta!
> O conteúdo gerado no /landing-page será separado em 4, que deverão ser navegáveis pelo header.
> As "páginas" serão: Página Inicial, Sobre Mim, Habilidades, Contato e Sobre. O conteúdo de
> Contato e Sobre será estático. Irei te passar depois um modelo completo de dados para ele. A
> página inicial terá a logo, o nome do projeto (My Landing Page) e uma descrição. Depois, haverá
> 3 cards, onde o primeiro deve ter um ícone e um textinho explicativo sobre o repositório do
> github e deve redirecionar justamente para o github do projeto. O segundo deve permitir a
> criação de uma nova pessoa para ter dados na Landing Page. Ao clicar nela, ela deve ser
> redirecionada para a página de Admin exigindo a criação de conta para criar sua própria Landing
> Page. O terceiro card deve ser para explicar sobre como o projeto é responsivo e altera o tema
> também, e ao clicar nele, deve-se alterar o tema da página.
> Além disso, o header terá as páginas no lado esquerdo, enquanto do lado direito haverá um ícone
> que servirá como botão de mudar o tema, que deve alterar entre lua e sol. E outro botão para
> logout mostrado quando estiver logado. Ambos devem ter tooltip text.
> A página de habilidades deverá ter um card central que será dividido no meio por uma linha
> tracejada que deve ter uma animação no momento em que ela aparecer, onde o traço deve "DESCER" e
> ir aparacendo. A partir dele, devem surgir ramificações, pequenos galhos tracejados também
> animados, e ir para a esquerda de a habilidade for do tipo soft-skill e ir pra direita se for
> hard-skill. Além disso, elas serão cardzinhos que deverão ter animação fade-in para aparecer.
> Nessa tela, abaixo do card central, deve haver um botão de adicionar e remover habilidades, que
> estejam alinhados em formato de linha (row). A funcionalidade delas será descrita depois. As
> informações dessas habilidades e Sobre mim serão dinâmicas, provenientes da página de admin.

**Resposta ao gap `paleta-de-cores`:**

> Irei te passar um conjunto que tenho aqui.
> [bloco CSS completo com `@import` das fontes Comic Neue, Dancing Script e Lato, e as variáveis
> de `:root` e `.dark-mode` — transcrito na íntegra em `discovery-answers.md`, seção "Paleta de
> cores e tipografia"]
> Dessas, apenas o background-main que eu quero que seja mantido. Todo o resto, pode alterar para
> harmonizar de forma bonita. Além disso, esqueci de dizer, mas os cards da tela inicial devem ter
> o efeito de "brilho", que é o brilho-card. As fontes e tudo mais você pode mudar a seu
> bel-prazer. Somente o background-main que eu quero que seja mantido. Aliás, mude os outros para
> uma melhor harmonia.

**Resposta ao gap `icones-e-imagens`:** "Seguir com placeholders temporários até a entrega
definitiva" (opção sugerida escolhida: `seguir-com-placeholder-temporario`).

**Resposta ao gap `documentacao-adicional`:**

> Inclua User Stories para modulos, acredito que sejam melhores. Ou para os componentes das
> paginas, tipos componentes mais abrangentes. Além disso, gere um diagrama de classe que mostre
> os relacionamentos para que eu compreenda a arquitetura também, e lembre-se de abstrair o máximo
> possível, dependendo de services (Dumb Components).
> Outras restrições que eu esqueci de falar são:
> Pasta shared: deve ser criada e conter os serviços que são compartilhados entre os
> componentes/modulos. Alem disso, essa pasta terá a pasta de services, models e quaisquer
> componentes que possam ser reutilizados. Reúna os enums em pastas dentro de models e as
> interfaces também. Services devem ser agrupados o .ts e o .spec.ts.

**Proveniência:** texto fornecido pelo usuário nas respostas aos gaps da primeira rodada de
incorporação da descoberta funcional (histórico da sessão do Clovis CLI).

**Reacesso:** este bloco é a cópia fiel das respostas originais; a interpretação e as decisões
derivadas delas estão registradas em `discovery-answers.md` (log de decisões humanas) e
refletidas por domínio em `functional-map.md`.

## Texto original das respostas aos gaps (segunda rodada de incorporação, preservado integralmente)

**Resposta ao gap `estrutura-descricao-aboutme`:**

> ArrayAboutModel{
>     id: number,
>     dados: AboutModel
> }
>
> export interface AboutModel {
>     nome: string,
>     idade: number,
>     carreira: string,
>     profissao: string,
>     empresa: string,
>     descricao: {
>         biografia: string,
>         hobbies: string,
>         desgostos: string,
>         objetivos: string
>     }
> }
>
> Esses são os protótipos. Repare que o array possui o ID, para que seja possível replicar esse
> modelo em outros, para criar outras Landing Pages.

**Resposta ao gap `estrutura-entidade-skill`:**

> Veja: export interface ArrayHabilitiesModel {
>     id: number,
>     habilidade: HabilitiesModel
> }
>
> export interface HabilitiesModel {
>     habilidade: string,
>     tipo: TipoHabilidade
> }
>
> export enum TipoHabilidade {
>     SOFT = "soft-skill",
>     HARD = "hard-skill"
> }
>
> Repare que elas abstraem de forma a tentar seguir os princípios de Object Calisthenics. Além
> disso, elas são meio "replicáveis" para ser reutilizado em outros momentos. Uma boa ideia seria
> usar ícones, coisa que não apliquei nesses tipos e você pode aplicar. Preferencialmente, use
> SVG, para que seja reutilizado e replicado corretamente. Decida se o melhor será baixar os
> arquivos localmente ou se é melhor utilizar linguagens que podem trazer o ícone pra cá.

**Resposta ao gap `quantidade-paginas-landing-page`:**

> Essas 4 são da Landing Page. As rotas do site são /landing-page, /login e /admin. O
> /landing-page DEVE ter 4 paginas: Página Inicial, Sobre mim, Habilidades, Contato e Sobre
> (Apenas uma página com nome composto). O /admin DEVE ter 3: Página Inicial, Editar dados,
> Editar Usuários. O /login deve ter apoenas o desenho do header com o ícone de alterar modo.
> Além disso, acredito que colocar /landing-page/:id para ser alterado de acordo com o id do
> usuário, para redirecionar corretamente para a Landing Page de cada um seja uma boa. Ademais,
> esqueci de lhe escrever, mas desejo que tenha um campo de imagem nas informacoes de pessoa
> (AboutMe), que seja referente a imagem do usuario. Se nao houver, coloque um placeholder que
> será aplicado a logo do projeto como imagem padrão, por favor.

**Proveniência:** texto fornecido pelo usuário nas respostas aos gaps da segunda rodada de
incorporação da descoberta funcional (histórico da sessão do Clovis CLI).

**Reacesso:** este bloco é a cópia fiel das respostas originais; a interpretação e as decisões
derivadas delas (incluindo a decisão do agente sobre a estratégia de ícones, delegada
explicitamente pelo usuário) estão registradas em `discovery-answers.md` (log de decisões
humanas) e refletidas por domínio em `functional-map.md`.

# Fontes não fornecidas

Nenhum arquivo local, URL ou espaço MCP (Jira, Confluence, Figma etc.) foi citado pelo usuário
como fonte de regras de negócio nesta rodada. O diretório de execução do projeto foi investigado
diretamente (ver `functional-map.md`, seção de evidências em código) e não continha nenhuma
documentação de negócio pré-existente, apenas o scaffold padrão do Angular CLI.
