---
name: gestao-icones-svg-locais
description: >
  Como armazenar, nomear e referenciar localmente os ícones SVG de
  habilidades (hard-skill/soft-skill) e demais ícones da aplicação, sem
  depender de CDN externo. Use ao adicionar, renomear ou referenciar um
  arquivo SVG de ícone, ao editar `HabilitiesModel` ou o campo de ícone de uma
  habilidade, ou ao decidir entre um ícone local e um recurso externo.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Gestão de ícones SVG locais

> **Maintaining this skill**
>
> Atualize este documento sempre que a pasta, a convenção de nome ou a forma
> de referenciar os ícones SVG mudar. Um refactor que preserva a convenção
> (por exemplo, mover a pasta inteira sem mudar nomes) não exige alteração,
> desde que este documento seja atualizado com o novo caminho.

## Visão geral

O projeto não pode depender de backend, API ou CDN externo — toda a aplicação
roda como SPA estática. Os ícones de habilidades (associados a cada
`HabilitiesModel`) e os demais ícones da aplicação são arquivos SVG
armazenados localmente no repositório e referenciados por nome de arquivo, e
não por URL externa.

## Como aplicar

- Armazene os ícones SVG em `public/icons/`, servida como está pelo Angular
  (glob `**/*` de `public/` já configurado em `angular.json`); os ícones de
  habilidades ficam em `public/icons/skills/`.
- Nomeie cada arquivo em kebab-case, sem acentos ou espaços, com o nome da
  tecnologia/habilidade normalizado (por exemplo, `javascript.svg`,
  `figma.svg`, `trabalho-em-equipe.svg`).
- Em `HabilitiesModel`, referencie o ícone por um campo `icone: string`
  contendo apenas o nome do arquivo (por exemplo, `"javascript.svg"`), nunca um
  caminho absoluto ou uma URL — a resolução do caminho completo
  (`/icons/skills/${icone}`) é responsabilidade do componente/service que
  renderiza o ícone, não do modelo.
- Ao renderizar o ícone com `<img>`, use `NgOptimizedImage` (`ngSrc`) apontando
  para `/icons/skills/${icone}`, já que o arquivo é um asset estático servido
  pela aplicação — `NgOptimizedImage` não se aplica apenas a imagens inline em
  base64.
- Enquanto os ícones definitivos não forem entregues pelo usuário, use um
  ícone SVG placeholder genérico (por exemplo, `public/icons/skills/
  placeholder.svg`) como valor de `icone` para habilidades sem ícone real
  cadastrado ainda, seguindo a mesma convenção de placeholder temporário
  usada para os demais ícones e imagens do projeto.
- Além do placeholder genérico, também são colocados em `public/icons/` (e em
  `public/icons/skills/`) arquivos SVG específicos que funcionam como
  placeholder de um ícone ainda não entregue — por exemplo, um ícone
  aproximado ou provisório de uma tecnologia/habilidade específica. Referencie
  esses arquivos pelo nome normal (mesma convenção kebab-case desta skill) e
  trate-os como candidatos a substituição: quando o ativo definitivo dessa
  habilidade for entregue, o arquivo é substituído no mesmo caminho e com o
  mesmo nome, sem exigir alteração do campo `icone` em `HabilitiesModel`.
- O tipo da habilidade (`tipo: TipoHabilidade`, `SOFT`/`HARD`) nunca determina
  o ícone — cada habilidade tem seu próprio arquivo SVG independentemente de
  ser soft-skill ou hard-skill.

## Ferramentas e artefatos envolvidos

- `public/icons/skills/` — arquivos SVG dos ícones de habilidades, um arquivo
  por habilidade.
- `public/icons/` — demais ícones SVG locais da aplicação, fora do domínio de
  habilidades.
- `HabilitiesModel` (em `shared/models/interfaces`) — campo `icone: string`
  com o nome do arquivo.
- `NgOptimizedImage` — diretiva usada para renderizar os ícones via `<img
  ngSrc>`.

## Restrições e armadilhas conhecidas

- Nunca referencie um ícone por URL de CDN externo (por exemplo, um serviço
  de ícones online) — viola a restrição de a aplicação não depender de
  serviços externos.
- Dois arquivos SVG com nomes equivalentes após a normalização kebab-case
  (por exemplo, `C++.svg` e `c-plus-plus.svg` para a mesma tecnologia) causam
  ambiguidade — mantenha um único arquivo por tecnologia/habilidade e
  reaproveite o mesmo nome de arquivo em todo cadastro dessa habilidade.
- `NgOptimizedImage` exige dimensões (`width`/`height` ou `fill`) declaradas
  no template para evitar layout shift; declare-as ao usar `ngSrc` com os
  ícones SVG.
- Um ícone placeholder específico de uma habilidade não é o mesmo que o
  placeholder genérico: o específico ocupa o nome de arquivo definitivo dessa
  habilidade e é substituído em versão futura; o genérico é compartilhado por
  qualquer habilidade sem nenhum ícone ainda associado. Não misture os dois
  papéis no mesmo arquivo.
