# Data model: Login / Autenticação

Todas as entidades deste domínio residem em `localStorage`, sem nenhum backend ou banco de dados.

## `Role` (enum) — `shared/models/enums/role.enum.ts`

```typescript
export enum Role {
  USER = "user",
  ADMIN = "admin",
  SUPER = "super"
}
```

Único tipo aceito pelo campo `role` de `Usuario` e `Sessao` — nunca uma string livre, para não permitir um papel inválido por erro de grafia.

## `Usuario` (interface) — `shared/models/interfaces/usuario.interface.ts`

| Campo   | Tipo     | Notas                                                                 |
|---------|----------|------------------------------------------------------------------------|
| usuario | `string` | identificador único da conta; chave de busca do login e da criação    |
| senha   | `string` | saída de `Encrypter.encrypt` — base64 do IV aleatório concatenado ao texto cifrado em AES-GCM (Web Crypto), nunca a senha em texto puro |
| role    | `Role`   | papel da conta                                                        |

Persistida como `Usuario[]` sob a chave `login.usuarios`. Semeada com as três contas fixas na primeira execução (quando a chave ainda não existe):

| usuario      | senha (texto original) | role    |
|--------------|-------------------------|---------|
| `user`       | `123U`                  | `user`  |
| `admin`      | `123@`                  | `admin` |
| `superAdmin` | `123Super`              | `super` |

## `Sessao` (interface) — `shared/models/interfaces/sessao.interface.ts`

| Campo   | Tipo     | Notas                                    |
|---------|----------|-------------------------------------------|
| usuario | `string` | mesmo identificador de `Usuario.usuario` |
| role    | `Role`   | papel no momento do login                |

Persistida como um único registro (não um array) sob a chave `login.sessao`; a ausência dessa chave significa "não autenticado". É a fonte consultada pelo `auth.guard` para liberar as rotas do painel administrativo e pelo header para decidir a exibição do botão de logout.

## Restrições

- `Usuario.usuario` é único dentro do array — não há dois registros com o mesmo identificador.
- O registro com `usuario: "superAdmin"` e `role: Role.SUPER` nunca é removido do array, em nenhum caminho de exclusão.
- `Usuario.senha` nunca contém a senha em texto puro — sempre o resultado de `Encrypter.encrypt(senha)`.
- A criação de um novo `Usuario` com `role: Role.SUPER` só é permitida quando quem cria já tem, ele mesmo, `role: Role.SUPER`.
