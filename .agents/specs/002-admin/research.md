# Research: Admin

## Vínculo entre a sessão `admin` e o `ArrayAboutModel.id`

**Contexto.** A rota `/admin/{id}` já redireciona, pelo domínio Login, usando o `usuario` (string) da conta como segmento `{id}`; a skill `admin` documenta `ArrayAboutModel.id` como `number`, vinculado à conta do admin correspondente. Nenhuma das duas fontes seria alterada sem uma decisão humana.

**Alternativas:**

- **Adicionar um `id` numérico ao modelo `Usuario`/`Sessao` do domínio Login** — resolveria a relação na origem, mas altera um modelo e um fluxo de redirecionamento já implementados e testados em outro domínio.
- **`ArrayAboutModel.id` passa a aceitar o `usuario` como identificador (`string`)** — contradiz o tipo já documentado na skill `admin`.
- **Registro interno de vínculo `usuario → id`, mantido pelo domínio Admin** — preserva os dois modelos existentes como estão; o domínio Admin resolve a relação sem tocar no domínio Login.

**Decisão:** registro interno de vínculo, em `PessoaService`, persistido sob a chave `admin.vinculo-usuarios` (ver [`data-model.md`](./data-model.md)).

**Confirmation basis:** decisão do usuário ao responder o gap `admin-id-numerico-vs-username`.

**Consequences:** a primeira vez que uma sessão `admin` abre "Editar Dados", `PessoaService` cria a entrada de `ArrayAboutModel` e o vínculo na mesma operação; uma sessão `super` nunca passa por essa resolução, já que "acesso integral" significa gerenciar a lista completa, não uma entrada própria.

## Escopo da rota `/admin/:id` para uma sessão `admin`

**Contexto.** A skill `admin` descreve `/admin/{id}` como "o painel de um admin, escopado à sua própria entrada", mas o `AuthGuard` do domínio Login só verifica a role da sessão, não se o segmento `:id` da URL corresponde à conta autenticada.

**Alternativas:**

- **Nenhuma verificação adicional** — qualquer sessão `admin` poderia abrir o painel de outra conta `admin` trocando o segmento `:id` na URL manualmente, contradizendo "escopado à sua própria entrada".
- **Guarda funcional própria do domínio Admin, bloqueando com "Acesso Negado"** — consistente com o padrão já usado pelo `AuthGuard`, mas trata como violação de acesso uma situação que não é, de fato, uma tentativa de acessar uma área sem permissão de role.
- **Guarda funcional própria do domínio Admin, redirecionando para o próprio painel** — a sessão continua com acesso normal ao painel, apenas corrigido para o `:id` que lhe pertence.

**Decisão:** guarda funcional `escopo-admin.guard.ts`, aplicada só ao ramo `:id`, redirecionando para `/admin/{usuario da sessão}` quando o segmento não corresponde à sessão `admin` ativa.

**Confirmation basis:** nenhuma fonte descreve o comportamento esperado neste caso específico; decisão de implementação deste plano, coerente com a frase já escrita na skill `admin` ("escopado à sua própria entrada") e com o padrão de guarda funcional já estabelecido pelo domínio Login.

**Consequences:** o ramo `super` não recebe essa guarda, coerente com "acesso integral"; a sessão `admin` nunca vê o painel de outra conta `admin`, mesmo digitando a URL manualmente.

## Serviço genérico de persistência em `localStorage`

**Contexto.** `ArrayAboutModel` e `ArrayHabilitiesModel` precisam do mesmo tipo de leitura/escrita de array em `localStorage` já usado por `Usuario`/`Sessao` no domínio Login, e a skill `admin` exige abstrair o máximo possível para services com Generics, mantendo os componentes como dumb components.

**Alternativas:**

- **Repetir a leitura/escrita diretamente em `PessoaService` e `HabilidadeService`**, como o `AuthService` já faz para `Usuario`/`Sessao` — duplica o mesmo par `JSON.parse`/`JSON.stringify` em cada serviço.
- **Serviço genérico único (`local-storage-array.store.ts`)**, com métodos `ler<T>(chave)`/`gravar<T>(chave, itens)`, injetado por `PessoaService` e `HabilidadeService`.

**Decisão:** serviço genérico único.

**Confirmation basis:** declarado sem reserva na skill `admin` ("Deve-se priorizar a abstração para Services que utilizem Generics, para que a arquitetura seja de Dumb Components") e em `AGENTS.md` ("Utilizar Generics sempre que possível").

**Consequences:** `PessoaService` e `HabilidadeService` não chamam `localStorage`/`JSON` diretamente; qualquer futura entidade deste domínio persistida como array reaproveita o mesmo serviço genérico sem duplicar a lógica de leitura/escrita.

## Extração do feedback visual do `LoginModal`

**Contexto.** A dependência técnica "Sistema de Feedback Visual" da skill `admin` exige que o modal de carregando/sucesso/mensagem seja o mesmo do login e viva em `shared/components`; hoje esses estados estão embutidos no `LoginModal`, componente do domínio Login.

**Alternativas:** já avaliadas e decididas na spec (gap `admin-modal-feedback-compartilhado`) — ver `spec.md`, seção "Risks and observations".

**Decisão:** extrair para `shared/components/feedback-modal`, com `input<'carregando' | 'sucesso' | 'mensagem'>('estado')` e `input<string>('mensagem')`; o `LoginModal` passa a compor esse componente, mapeando cada um dos cinco estados já documentados na skill `login` para um desses três valores.

**Confirmation basis:** decisão do usuário ao responder o gap `admin-modal-feedback-compartilhado`.

**Consequences:** o texto exibido em cada estado do `LoginModal` não muda; apenas a marcação (spinner, check, região `aria-live`) passa a vir do componente compartilhado, reaproveitável por "Editar Dados" e "Editar Usuários" sem duplicar essa marcação.
