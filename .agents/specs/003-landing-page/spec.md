# Spec: Landing Page

## Overview

Apresentação pública do conteúdo institucional de cada pessoa cadastrada no domínio Admin — dados de Sobre Mim e Habilidades — através de Landing Pages replicáveis por `id`, com um header público de 4 páginas, uma Página Inicial com 3 cards, páginas de URL inválida e de Landing Page não encontrada, e uma rota de acesso integral exclusiva à role `super`. O diretório de execução ainda não tem nenhum código deste domínio — esta spec cobre a materialização completa do domínio Landing Page a partir desse ponto de partida em branco.

## Domain

- Slug: `landing-page`
- Skill: [`.agents/skills/landing-page/SKILL.md`](../../skills/landing-page/SKILL.md)

## Scope

**In:**

- Rotas `/landing-page` (URL inválida, com input para digitar um `id`), `/landing-page/:id` (Landing Page de uma pessoa) e `/landing-page/control` (acesso integral da role `super` a todas as Landing Pages, paginado pessoa a pessoa).
- Header público com as 4 páginas navegáveis alinhadas à esquerda (Página Inicial, Sobre Mim, Habilidades, Contato e Sobre) e, à direita, o botão de alternância de tema e o botão de logout (visível apenas com sessão ativa), ambos com tooltip.
- Página Inicial: logo, nome do projeto ("My Landing Page"), descrição e os 3 cards com o efeito `--brilho-card` — link para o repositório GitHub do projeto; convite para criar uma nova pessoa/Landing Page, redirecionando ao fluxo de criação de conta do Admin; explicação sobre responsividade/tema que alterna o tema ativo da aplicação.
- Página "Sobre Mim": dados de `AboutModel` da pessoa correspondente ao `id` da rota — nome, idade, carreira, profissão, empresa, imagem de perfil (com a logo do projeto como placeholder padrão na ausência de imagem própria) e a descrição (biografia, hobbies, desgostos, objetivos).
- Página de Habilidades: card central com linha tracejada animada e ramificações para a esquerda (habilidade `SOFT`) ou para a direita (habilidade `HARD`), cada habilidade como cartão com animação fade-in e ícone SVG local; botões de adicionar e remover habilidade presentes na tela, sem funcionalidade associada nesta rodada.
- Página "Contato e Sobre": conteúdo estático mínimo, já que o modelo de dados completo dessa página ainda não foi fornecido pela fonte de negócio.
- Página de URL inválida (`/landing-page` sem nenhum `id`): orientação ao visitante com um input para digitar um `id` e navegar diretamente para o `/landing-page/:id` correspondente.
- Página de Landing Page não encontrada (`id` inexistente em `ArrayAboutModel`, ou `/landing-page/control` sem uma sessão `super` ativa), no mesmo espírito visual do erro 404 do GitHub.
- Acesso integral da role `super` em `/landing-page/control`: navegação paginada pessoa a pessoa, cada página exibindo, em formato de cartão, os dados de Sobre Mim e as Habilidades de uma única entrada de `ArrayAboutModel`.

**Out:**

- Criação, edição e remoção de `AboutModel`/`HabilitiesModel` — pertence à tela "Editar Dados" do domínio Admin; este domínio apenas lê e exibe esses dados.
- Autenticação, sessão, roles e o fluxo de criação de conta em si — domínio Login/Autenticação; esta spec apenas consome o estado de sessão já exposto por ele.
- Modelo de dados completo da página "Contato e Sobre" — ainda não fornecido pela fonte de negócio.
- Funcionalidade dos botões de adicionar e remover habilidade na página de Habilidades — ainda não detalhada pela fonte de negócio.

## Domain boundary

**This spec implements:**

- Módulo lazy-loaded `landing-page`, com as rotas `/landing-page`, `/landing-page/:id` e `/landing-page/control` (a rota literal `control` registrada antes da parametrizada `:id`, para não ser capturada como valor de `id`).
- Guarda de acesso da rota `/landing-page/control`, restrita à role `super`: qualquer outra sessão, ou nenhuma sessão ativa, resulta na mesma página de Landing Page não encontrada usada para um `id` inexistente.
- Componentes de página "Página Inicial", "Sobre Mim", "Habilidades", "Contato e Sobre", "URL inválida", "Landing Page não encontrada" e o componente paginado de acesso integral da role `super`.
- Consumo somente leitura de `PessoaService` e `HabilidadeService` (domínio Admin) para popular as páginas Sobre Mim e Habilidades e a navegação paginada de `/landing-page/control`.
- Extensão do componente `Header` compartilhado (`shared/components`) com as 4 páginas navegáveis deste domínio.
- Animações CSS/SASS da linha tracejada central, das ramificações esquerda/direita e do fade-in dos cartões de habilidade.
- Link estático do card 1 da Página Inicial para o repositório GitHub do projeto.
- Uso de `NgOptimizedImage` para a imagem de perfil (`AboutModel.imagem`) e os ícones SVG de cada habilidade (`HabilitiesModel.icone`), conforme a technical-skill `gestao-icones-svg-locais`.

**Belongs to other domains (cross-domain, does not become a task here):**

- Enum `Role`, entidade `Usuario`, `AuthGuard`, `Encrypter` e o `AuthService` (sessão, role e logout) → skill `login`; este domínio apenas consulta o que esse serviço já expõe.
- Entidades `ArrayAboutModel`/`AboutModel`/`DescricaoAbout`, `ArrayHabilitiesModel`/`HabilitiesModel`/`TipoHabilidade` e as regras de criação, edição e remoção sobre elas → skill `admin`; este domínio só lê.
- Tela "Editar Dados" e o fluxo de criação de conta acionados pelo card 2 da Página Inicial → skill `admin` (e, indiretamente, `login`).
- Modelo de dados completo da página "Contato e Sobre" → ainda não detalhado por nenhum domínio, trabalho futuro.

## User stories

1. Como visitante, com ou sem sessão ativa, quero acessar a Landing Page de uma pessoa em `/landing-page/:id`, para conhecer os dados de Sobre Mim e Habilidades cadastrados por ela no Admin.
2. Como visitante, quero navegar pelas 4 páginas do header sem perder o `id` da rota, para explorar Sobre Mim, Habilidades e Contato e Sobre da mesma pessoa.
3. Como visitante, quero ver uma orientação clara e um campo para digitar o `id` ao acessar `/landing-page` sem informar nenhum `id`, para chegar à Landing Page correta sem precisar adivinhar a URL.
4. Como visitante, quero ver uma página de erro estilizada quando o `id` da rota não corresponder a nenhuma pessoa cadastrada, para entender que aquela Landing Page não existe.
5. Como visitante sem sessão ativa, quero usar o card 2 da Página Inicial para ser encaminhado à criação de conta no Admin, para passar a ter minha própria Landing Page.
6. Como sessão já autenticada, quero que o card 2 me leve direto à tela "Editar Dados" do Admin, para editar meus próprios dados sem repetir o fluxo de criação de conta.
7. Como visitante, quero alternar o tema da aplicação pelo botão do header ou pelo card 3 da Página Inicial, para visualizar a Landing Page no tema de minha preferência.
8. Como sessão autenticada, quero ver o botão de logout no header, para encerrar minha sessão sem depender de outro domínio.
9. Como sessão com role `super`, quero acessar `/landing-page/control` e navegar pessoa a pessoa pelos dados de Sobre Mim e Habilidades de todas as Landing Pages cadastradas, para ter uma visão completa do conteúdo de todas elas.
10. Como sessão sem role `super`, ou sem sessão ativa, ao tentar acessar `/landing-page/control`, quero ver a mesma página de Landing Page não encontrada usada para um `id` inexistente, para que a existência dessa listagem não seja revelada a quem não tem permissão.

## Acceptance criteria

**Story 1 e 2 — Landing Page de uma pessoa e navegação:**

- Given uma entrada existente em `ArrayAboutModel` com `id` X, when um visitante navega para `/landing-page/X`, then a página "Sobre Mim" exibe nome, idade, carreira, profissão, empresa, imagem (ou a logo do projeto quando `AboutModel.imagem` estiver vazio) e a descrição (biografia, hobbies, desgostos, objetivos) dessa entrada.
- Given a Landing Page de `id` X aberta em qualquer uma das 4 páginas, when o visitante clica em outro link do header, then a navegação preserva o `id` X na URL da página de destino.
- Given a mesma entrada de `id` X, when o visitante abre a página de Habilidades, then são exibidas todas as entradas de `ArrayHabilitiesModel` com esse `id`, ramificando para a esquerda quando `tipo` é `SOFT` e para a direita quando é `HARD`, cada uma com animação fade-in e o ícone SVG local referenciado em `HabilitiesModel.icone`.

**Story 3 — URL inválida:**

- Given a rota `/landing-page` sem nenhum segmento de `id`, when a página carrega, then é exibida a página de URL inválida com um campo de input e instruções, sem exibir dados de nenhuma pessoa.
- Given a página de URL inválida, when o visitante digita um `id` nesse input e confirma, then a navegação segue para `/landing-page/{id digitado}`.

**Story 4 — Landing Page não encontrada:**

- Given um `id` que não corresponde a nenhuma entrada de `ArrayAboutModel`, when um visitante navega para `/landing-page/{id}`, then é exibida a página de Landing Page não encontrada, no mesmo espírito visual do erro 404 do GitHub.

**Story 5 e 6 — Card 2 (criação de nova pessoa):**

- Given nenhuma sessão ativa, when o visitante clica no card 2 da Página Inicial, then a navegação é encaminhada ao fluxo de criação de conta do domínio Admin, que bloqueia o acesso a `/admin` até a conta ser criada.
- Given uma sessão já ativa, when a mesma sessão clica no card 2, then a navegação segue direto para a tela "Editar Dados" do Admin correspondente a essa sessão, sem passar pelo fluxo de criação de conta.

**Story 7 — Alternância de tema:**

- Given a Página Inicial, when o visitante clica no botão de tema do header ou no card 3, then o tema ativo da aplicação alterna entre claro e escuro e a escolha persiste ao navegar para as demais páginas e rotas.

**Story 8 — Logout:**

- Given uma sessão ativa em qualquer página deste domínio, then o botão de logout é exibido no header com tooltip; when ele é clicado, then a sessão é encerrada pelo mesmo fluxo de logout do domínio Login.
- Given nenhuma sessão ativa, then o botão de logout não é exibido no header.

**Story 9 e 10 — Acesso integral do super:**

- Given uma sessão com role `super`, when ela navega para `/landing-page/control`, then é exibido, para a primeira entrada de `ArrayAboutModel` (por ordem de `id`), um cartão com os dados de Sobre Mim e as Habilidades dessa entrada.
- Given o cartão de uma entrada exibido em `/landing-page/control`, when a sessão `super` aciona a paginação para avançar, then o cartão passa a exibir os dados de Sobre Mim e Habilidades da próxima entrada de `ArrayAboutModel`; ao acionar para voltar a partir da primeira entrada, a navegação permanece nela, sem retroceder para além da primeira.
- Given uma sessão sem role `super`, ou nenhuma sessão ativa, when a navegação é direcionada para `/landing-page/control`, then é exibida a mesma página de Landing Page não encontrada usada para um `id` inexistente, sem revelar a existência da listagem completa.

## Cross-domain dependencies

- **`login`** — fornece a sessão ativa e a role consultadas por este domínio (existência de sessão para o botão de logout, role `super` para `/landing-page/control`) e o fluxo de logout acionado pelo botão do header; este domínio não altera nem estende o `AuthService`.
- **`admin`** — fonte de `ArrayAboutModel`/`AboutModel` e `ArrayHabilitiesModel`/`HabilitiesModel` exibidos nas páginas Sobre Mim, Habilidades e na navegação paginada de `/landing-page/control` (via `PessoaService`/`HabilidadeService`, em modo somente leitura); também é o destino do card 2 da Página Inicial (fluxo de criação de conta e tela "Editar Dados").

## Risks and observations

- A rota exclusiva da role `super` é `/landing-page/control`; a menção a `/landing-page/super` em `references/technical-dependencies.md` da skill `landing-page` está incorreta e precisa ser corrigida para `/landing-page/control`, ajuste registrado como impacto na documentação autoritativa a ser tratado como tarefa na fase de implementação.
- O modelo de dados completo da página "Contato e Sobre" e a funcionalidade dos botões de adicionar/remover habilidade continuam sem detalhamento pela fonte de negócio, conforme já registrado na skill `landing-page`; ambos ficam fora do escopo desta spec até serem fornecidos.
- Ícones de habilidade e imagem de perfil seguem placeholders temporários até a entrega dos ativos definitivos, conforme decisão já registrada em `discovery-answers.md`.
- Sem uma sessão `super` ativa, `/landing-page/control` precisa apresentar exatamente a mesma página de Landing Page não encontrada usada para um `id` inexistente, sem nenhuma pista visual que revele a existência dessa listagem para outras sessões.
