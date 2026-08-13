# Data model: Admin

Todas as entidades deste domínio residem em `localStorage`, sem nenhum backend ou banco de dados, no mesmo padrão já usado pelo domínio Login.

## `TipoHabilidade` (enum) — `shared/models/enums/tipo-habilidade.enum.ts`

```typescript
export enum TipoHabilidade {
  SOFT = "soft-skill",
  HARD = "hard-skill"
}
```

## `DescricaoAbout` (interface) — `shared/models/interfaces/about.model.ts`

| Campo      | Tipo     | Notas   |
|------------|----------|---------|
| biografia  | `string` |         |
| hobbies    | `string` |         |
| desgostos  | `string` |         |
| objetivos  | `string` |         |

## `AboutModel` (interface) — `shared/models/interfaces/about.model.ts`

| Campo      | Tipo               | Notas                                                                 |
|------------|--------------------|------------------------------------------------------------------------|
| nome       | `string`           |                                                                        |
| idade      | `number`           |                                                                        |
| carreira   | `string`           |                                                                        |
| profissao  | `string`           |                                                                        |
| empresa    | `string`           |                                                                        |
| imagem     | `string`           | caminho da foto do usuário; a logo do projeto é o valor padrão quando ausente |
| descricao  | `DescricaoAbout`   |                                                                        |

## `ArrayAboutModel` (interface) — `shared/models/interfaces/about.model.ts`

| Campo | Tipo         | Notas                                                                 |
|-------|--------------|------------------------------------------------------------------------|
| id    | `number`     | identifica a pessoa/Landing Page; único dentro do array                |
| dados | `AboutModel` |                                                                        |

Persistida como `ArrayAboutModel[]` sob a chave `admin.pessoas`.

## `HabilitiesModel` (interface) — `shared/models/interfaces/habilities.model.ts`

| Campo      | Tipo             | Notas                                                                 |
|------------|------------------|------------------------------------------------------------------------|
| habilidade | `string`         |                                                                        |
| tipo       | `TipoHabilidade` |                                                                        |
| icone      | `string`         | nome do arquivo SVG local (ex.: `"javascript.svg"`); `"placeholder.svg"` quando não informado |

## `ArrayHabilitiesModel` (interface) — `shared/models/interfaces/habilities.model.ts`

| Campo      | Tipo               | Notas                                                                 |
|------------|--------------------|------------------------------------------------------------------------|
| id         | `number`           | mesmo espaço de identificadores de `ArrayAboutModel.id`; não é único — várias habilidades compartilham o mesmo `id` |
| habilidade | `HabilitiesModel`  |                                                                        |

Persistida como `ArrayHabilitiesModel[]` sob a chave `admin.habilidades`.

## Vínculo `usuario → id` (registro interno, sem entidade própria)

Um único objeto `Record<string, number>`, em que cada chave é o `usuario` (mesmo identificador de `Usuario.usuario` do domínio Login) e o valor é o `id` de `ArrayAboutModel` vinculado a essa conta. Persistido sob a chave `admin.vinculo-usuarios`. Usado apenas internamente por `PessoaService` para resolver, a partir da sessão ativa, qual entrada de `ArrayAboutModel` pertence a uma conta `admin` — nunca exposto como parte do modelo `AboutModel`/`ArrayAboutModel` nem lido por outro domínio.

## Restrições

- `ArrayAboutModel.id` é único dentro do array — não há dois registros com o mesmo `id`.
- `ArrayHabilitiesModel.id` sempre referencia um `id` existente em `ArrayAboutModel`; múltiplas entradas de `ArrayHabilitiesModel` podem compartilhar o mesmo `id`.
- Cada `usuario` (conta `admin`) aparece no máximo uma vez como chave do registro de vínculo, e cada valor (`id`) aparece no máximo uma vez entre os vínculos — a relação é sempre um-para-um.
- O próximo `id` gerado por `PessoaService` é sempre maior que qualquer `id` já existente em `ArrayAboutModel`, para nunca colidir com uma entrada criada por uma sessão `super`.
- `HabilitiesModel.icone` nunca é uma URL externa — sempre o nome de um arquivo SVG em `public/icons/skills/`, conforme `gestao-icones-svg-locais`.
