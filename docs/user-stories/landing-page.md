# User Stories — Landing Page

## Solicitar adição de habilidade

Como usuário logado (qualquer role, inclusive `user`),
quero clicar em "Adicionar habilidade" na página de Habilidades de uma landing page,
para pedir ao admin dono dessa landing page que cadastre uma nova habilidade em meu nome.

**Critérios de aceite**
- O clique abre um modal com um Reactive Form pedindo o nome e o tipo (soft/hard) da habilidade.
- Ao enviar, a solicitação é persistida em `localStorage` com o nome da habilidade, o tipo, o
  usuário solicitante, a landing page alvo (`idPessoa`) e o admin dono dessa landing page
  (`usuarioAdminAlvo`).
- O modal exibe feedback de carregando e depois de sucesso, fechando-se em seguida.
- A habilidade em si só é criada quando o admin aceita a solicitação — este fluxo nunca cria a
  habilidade diretamente.

## Solicitar remoção de habilidade

Como usuário logado (qualquer role, inclusive `user`),
quero clicar em "Remover habilidade" na página de Habilidades de uma landing page,
para pedir ao admin dono dessa landing page que remova uma habilidade já cadastrada.

**Critérios de aceite**
- O modal exibe um select com as habilidades atualmente cadastradas nessa landing page; ao
  escolher uma, seu nome e tipo preenchem a solicitação.
- O botão "Remover habilidade" fica desabilitado quando a landing page não tem nenhuma habilidade
  cadastrada.
- A habilidade em si só é removida quando o admin aceita a solicitação.

## Bloqueio de solicitação sem sessão ativa

Como visitante não autenticado,
quero ser impedido de solicitar adição ou remoção de habilidade,
para que apenas usuários logados possam enviar solicitações ao admin.

**Critérios de aceite**
- Ao clicar em "Adicionar habilidade" ou "Remover habilidade" sem sessão ativa, nenhum modal de
  solicitação é aberto.
- Em vez disso, é exibido um aviso com a mensagem "Você deve estar logado para isso!", fechável
  pelo próprio usuário.
