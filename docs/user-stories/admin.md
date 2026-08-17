# User Stories — Admin

## Ver notificações de solicitações pendentes

Como admin ou superAdmin,
quero ver, no botão de notificações do header, quantas solicitações de habilidade estão pendentes para mim,
para saber quando há pedidos de usuários aguardando minha decisão.

**Critérios de aceite**
- O botão de notificações só é exibido para sessões `admin` e `super` (nunca para `user` nem para
  visitantes não autenticados), em qualquer tela que use o `Header` compartilhado.
- Um selo numérico é exibido sobre o botão apenas quando há ao menos uma solicitação pendente.
- Clicar no botão leva à vista "Solicitações", que não aparece entre as páginas de navegação
  regulares do painel (só é alcançável pelo botão de notificações ou por navegação direta com
  `vistaInicial: 'solicitacoes'`).

## Aceitar uma solicitação

Como admin ou superAdmin,
quero aceitar uma solicitação de adição ou remoção de habilidade,
para aplicar automaticamente a alteração pedida pelo usuário na landing page alvo.

**Critérios de aceite**
- Ao aceitar uma solicitação de adição, a habilidade é criada na landing page indicada
  (`idPessoa`) com o nome e o tipo da solicitação.
- Ao aceitar uma solicitação de remoção, a habilidade correspondente (mesmo nome e tipo) é
  removida da landing page indicada; se ela não existir mais, a solicitação é apenas descartada.
- Em ambos os casos, a solicitação é removida do `localStorage` assim que é processada — aceita
  ou rejeitada, ela nunca permanece na fila.
- A ação exibe feedback de carregando e depois de sucesso.

## Rejeitar uma solicitação

Como admin ou superAdmin,
quero rejeitar uma solicitação de adição ou remoção de habilidade,
para recusar um pedido sem aplicar nenhuma alteração na landing page.

**Critérios de aceite**
- Rejeitar remove a solicitação do `localStorage` sem criar nem remover nenhuma habilidade.

## Isolamento das solicitações entre admins

Como admin,
quero ver apenas as solicitações destinadas à minha própria landing page,
para nunca ter acesso a pedidos endereçados a outro admin.

**Critérios de aceite**
- A vista "Solicitações" de uma sessão `admin` filtra estritamente por `usuarioAdminAlvo` igual ao
  usuário da sessão atual, usando a sessão (nunca um parâmetro de rota) como fonte da verdade.
- Uma solicitação endereçada ao admin 1 nunca aparece na vista do admin 2, e vice-versa.

## Visão completa da fila pelo superAdmin

Como superAdmin,
quero ver todas as solicitações pendentes, de qualquer admin,
para ter uma visão de curadoria de toda a fila do sistema.

**Critérios de aceite**
- A vista "Solicitações" de uma sessão `super` lista as solicitações de todos os admins, exibindo
  também qual admin (ou, se nenhum, que não há admin vinculado) e qual landing page é o alvo de
  cada uma.
