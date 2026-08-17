# UI: Estados e telas — Login / Autenticação

## Tela `/login`

- Header reduzido (ícone de alternância de tema), reaproveitando o componente de header compartilhado na variante reduzida — sem as demais páginas do header público da Landing Page.
- Camada decorativa animada no plano de fundo, atrás do header e dos botões: brilho diagonal em looping suave (reaproveitando `--brilho-card`) e bolhas flutuando continuamente, nos temas claro e escuro.
- Dois botões de entrada, lado a lado: **"Login"** (acesso geral à aplicação) e **"Painel Admin"** (acesso dedicado à área administrativa) — ambos abrem o mesmo modal de credenciais.
- Botão de acesso à Landing Page sem autenticação.
- Em telas mobile (até 767px), o header reduzido colapsa no ícone de menu hambúrguer e na sidebar descritos pela technical-skill `responsividade-header-mobile`, reproduzindo apenas o ícone de tema — os dois botões de entrada e o botão de acesso sem login permanecem no corpo da tela, fora da sidebar.

## Modal de login (Reactive Forms)

Campos do formulário: `usuario` (texto, obrigatório) e `senha` (texto, obrigatório). O modal guarda qual dos dois botões o abriu ("Login" ou "Painel Admin"), informação que decide o resultado do estado Sucesso/Acesso Negado ao final da validação.

Estados visuais, em sequência a partir do envio do formulário:

1. **Carregando** — exibido durante os 3 segundos simulados que precedem qualquer um dos estados abaixo.
2. **Usuário Não Encontrado** — nem `usuario` nem `senha` correspondem a um registro válido em `localStorage`.
3. **Credenciais Inválidas** — exatamente um dos dois campos corresponde a um registro válido e o outro não.
4. **Acesso Negado** — `usuario`/`senha` corretos, role `user`, e o modal foi aberto pelo botão "Painel Admin"; a sessão ainda é gravada (as credenciais são válidas), mas nenhuma navegação para o painel ocorre.
5. **Sucesso** — `usuario`/`senha` corretos, em qualquer outra combinação de role e botão: grava a sessão e redireciona para `/landing-page` (`user`), `/admin/{id}` (`admin`, sendo `{id}` o identificador da própria conta) ou `/admin/control` (`super`).

Sub-fluxo de criação de conta, acessível a partir do mesmo modal, em qualquer um dos dois botões de entrada: campos `usuario`, `senha` e seleção do tipo de conta (`user` ou `admin` — a opção `super` nunca é oferecida por este caminho).

## Acessibilidade

- Os dois botões de entrada e o botão de acesso sem login têm rótulo textual próprio, nunca dependendo só de um ícone.
- O botão de alternância de tema mantém `tooltip`, conforme a exigência de acessibilidade do projeto.
- A camada decorativa (brilho e bolhas) é puramente visual: `aria-hidden="true"`, nunca intercepta foco nem cliques, e é suprimida ou substituída por uma versão estática equivalente quando o visitante sinaliza `prefers-reduced-motion: reduce`.
- Cada transição de estado do modal é anunciada por uma região `aria-live="polite"`, para que um leitor de tela acompanhe a mudança de "Carregando" para o resultado.
