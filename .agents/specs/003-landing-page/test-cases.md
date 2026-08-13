# Test cases: Landing Page

## Preconditions

- Aplicação acessível em `http://localhost:4200` (servidor de desenvolvimento), no navegador, nos temas claro e escuro.
- `localStorage` contendo as três contas fixas semeadas pelo domínio Login (ver `.agents/specs/001-login/data-model.md`): `user`/`123U`/role `user`; `admin`/`123@`/role `admin`; `superAdmin`/`123Super`/role `super`.
- `localStorage` contendo ao menos duas entradas de `ArrayAboutModel` (chave `admin.pessoas`), cadastradas pela tela "Editar Dados" do domínio Admin (ver `.agents/specs/002-admin/test-cases.md`, TC-8/TC-9/TC-12): a entrada de id `0` vinculada à conta `admin`, com ao menos uma habilidade `SOFT` e uma `HARD` cadastradas (chave `admin.habilidades`, ver TC-14 da mesma referência), e uma segunda entrada de id `1` criada pela sessão `superAdmin`.
- Onde um caso exige uma sessão ativa, ela é estabelecida por um login bem-sucedido anterior em `/login` com a conta correspondente — fluxo do domínio Login, fora do escopo desta unidade.

## Story 1 e 2 — Landing Page de uma pessoa e navegação

### TC-1 (mandatory) — visitante sem sessão acessa a página "Sobre Mim" de uma pessoa existente

1. Sem nenhuma sessão ativa, acesse diretamente `/landing-page/0`.

**Expected:** a página "Sobre Mim" é exibida com nome, idade, carreira, profissão, empresa, a imagem de perfil e a descrição (biografia, hobbies, desgostos, objetivos) da entrada de id `0`; o header exibe as 4 páginas navegáveis (Página Inicial, Sobre Mim, Habilidades, Contato e Sobre) e o botão de tema, sem o botão de logout.

### TC-2 (recommended) — imagem ausente exibe a logo do projeto como placeholder

1. Com uma entrada de `ArrayAboutModel` cujo `AboutModel.imagem` foi salvo vazio pelo domínio Admin (resolvido para a logo do projeto no momento do cadastro), acesse `/landing-page/{id dessa entrada}`.

**Expected:** a imagem de perfil exibida na página "Sobre Mim" é a logo do projeto.

### TC-3 (mandatory) — navegação pelo header preserva o id da rota

1. Acesse `/landing-page/0`.
2. No header, clique em "Habilidades".
3. No header, clique em "Contato e Sobre".
4. No header, clique em "Página Inicial".

**Expected:** cada navegação preserva o id `0` na URL (`/landing-page/0/habilidades`, `/landing-page/0/contato-e-sobre`, `/landing-page/0`), exibindo a página correspondente sem exigir um novo id.

### TC-4 (mandatory) — página de Habilidades ramifica por tipo e exibe o ícone de cada habilidade

1. Acesse `/landing-page/0/habilidades` (entrada com ao menos uma habilidade `SOFT` e uma `HARD` cadastradas).

**Expected:** o card central exibe a linha tracejada central; a habilidade `SOFT` aparece ramificada para a esquerda e a `HARD` para a direita, cada uma como um cartão individual com o ícone SVG referenciado em `HabilitiesModel.icone`; abaixo do card central aparecem os botões de adicionar e remover habilidade.

### TC-5 (recommended) — página "Contato e Sobre" exibe conteúdo estático

1. Acesse `/landing-page/0/contato-e-sobre`.

**Expected:** a página exibe o conteúdo estático mínimo da tela, sem depender de nenhum dado de `AboutModel` ou `HabilitiesModel`.

## Story 3 — URL inválida

### TC-6 (mandatory) — acessar `/landing-page` sem nenhum id

1. Acesse `/landing-page` diretamente, sem informar nenhum segmento de id.

**Expected:** a página de URL inválida é exibida, com instruções e um campo de input para digitar um id; nenhum dado de nenhuma pessoa é exibido.

### TC-7 (mandatory) — digitar um id válido no input da página de URL inválida

1. Acesse `/landing-page`.
2. No campo de input exibido, digite `0` e confirme.

**Expected:** a navegação segue para `/landing-page/0`, exibindo a página "Sobre Mim" dessa entrada.

## Story 4 — Landing Page não encontrada

### TC-8 (mandatory) — id inexistente resulta na página de não encontrada

1. Acesse `/landing-page/999` (id sem entrada correspondente em `ArrayAboutModel`).

**Expected:** a página de Landing Page não encontrada é exibida, no mesmo espírito visual do erro 404 do GitHub; nenhum header de 4 páginas nem dado de nenhuma pessoa é exibido.

### TC-9 (recommended) — id não numérico resulta na mesma página de não encontrada

1. Acesse `/landing-page/abc`.

**Expected:** a mesma página de Landing Page não encontrada do TC-8 é exibida.

## Story 5 e 6 — Card 2 (criação de nova pessoa)

### TC-10 (mandatory) — sem sessão ativa, o card 2 encaminha ao fluxo de criação de conta

1. Sem nenhuma sessão ativa, acesse `/landing-page/0`.
2. Clique no card 2 da Página Inicial.

**Expected:** a navegação é direcionada a `/admin`; o `AuthGuard` do domínio Login intercepta o acesso e encaminha ao fluxo de criação de conta em `/login`.

### TC-11 (mandatory) — sessão `admin` ativa, o card 2 vai direto para "Editar Dados"

1. Com uma sessão `admin` já ativa (login prévio com `usuario` `admin`/`senha` `123@`), acesse `/landing-page/0`.
2. Clique no card 2 da Página Inicial.

**Expected:** a navegação segue direto para `/admin/admin/editar-dados`, sem passar pelo fluxo de criação de conta.

### TC-12 (recommended) — sessão `super` ativa, o card 2 vai direto para "Editar Dados" de acesso integral

1. Com uma sessão `super` já ativa (login prévio com `usuario` `superAdmin`/`senha` `123Super`), acesse `/landing-page/0`.
2. Clique no card 2 da Página Inicial.

**Expected:** a navegação segue direto para `/admin/super/editar-dados`.

### TC-13 (recommended) — sessão role `user` ativa, o card 2 é bloqueado como se não houvesse sessão

1. Com uma sessão `user` já ativa (login prévio com `usuario` `user`/`senha` `123U`), acesse `/landing-page/0`.
2. Clique no card 2 da Página Inicial.

**Expected:** a navegação é direcionada a `/admin`; o `AuthGuard` bloqueia o acesso da mesma forma que para um visitante sem sessão.

## Story 7 — Alternância de tema

### TC-14 (mandatory) — botão de tema do header alterna o tema

1. Acesse `/landing-page/0` com o tema claro ativo.
2. Clique no botão de alternância de tema do header.

**Expected:** o tema ativo passa para escuro; ao navegar para outra página deste domínio (por exemplo, Habilidades), o tema escuro persiste.

### TC-15 (mandatory) — card 3 da Página Inicial alterna o tema

1. Acesse `/landing-page/0`.
2. Clique no card 3 da Página Inicial.

**Expected:** o tema ativo alterna entre claro e escuro, da mesma forma que o botão de tema do header.

## Story 8 — Logout

### TC-16 (mandatory) — botão de logout visível e funcional com sessão ativa

1. Com uma sessão `admin` já ativa, acesse `/landing-page/0`.
2. No header, clique no botão de logout.

**Expected:** o botão de logout está visível com tooltip antes do clique; após o clique, a sessão é encerrada pelo mesmo fluxo de logout do domínio Login.

### TC-17 (mandatory) — botão de logout ausente sem sessão ativa

1. Sem nenhuma sessão ativa, acesse `/landing-page/0`.

**Expected:** o header não exibe o botão de logout.

## Story 9 e 10 — Acesso integral do super

### TC-18 (mandatory) — sessão `super` acessa `/landing-page/control` e vê a primeira entrada

1. Com uma sessão `super` já ativa, acesse `/landing-page/control`.

**Expected:** é exibido um cartão com os dados de Sobre Mim e as Habilidades da primeira entrada de `ArrayAboutModel` (por ordem de id, a entrada `0`); o header exibe apenas os botões de tema e logout, sem as 4 páginas navegáveis.

### TC-19 (mandatory) — botão "Próximo" avança para a próxima entrada

1. Com uma sessão `super` já ativa, acesse `/landing-page/control` (posicionado na entrada `0`, com a entrada `1` também cadastrada).
2. Clique no botão "Próximo".

**Expected:** o cartão passa a exibir os dados de Sobre Mim e as Habilidades da entrada `1`.

### TC-20 (recommended) — botão "Anterior" desabilitado na primeira entrada

1. Com uma sessão `super` já ativa, acesse `/landing-page/control` (posicionado na primeira entrada).

**Expected:** o botão "Anterior" está desabilitado; a navegação permanece na primeira entrada.

### TC-21 (recommended) — botão "Próximo" desabilitado na última entrada

1. Com uma sessão `super` já ativa, acesse `/landing-page/control` e avance até a última entrada cadastrada.

**Expected:** o botão "Próximo" está desabilitado; a navegação permanece na última entrada.

### TC-22 (mandatory) — sessão sem role `super` acessando `/landing-page/control` vê a página de não encontrada

1. Com uma sessão `admin` já ativa, acesse `/landing-page/control`.

**Expected:** a mesma página de Landing Page não encontrada do TC-8 é exibida; nenhuma listagem nem cartão de nenhuma pessoa é exibido.

### TC-23 (mandatory) — sem sessão ativa, `/landing-page/control` vê a página de não encontrada

1. Sem nenhuma sessão ativa, acesse `/landing-page/control`.

**Expected:** a mesma página de Landing Page não encontrada é exibida, sem revelar a existência da listagem completa a quem não tem permissão.

### TC-24 (recommended) — `/landing-page/control` sem nenhuma entrada cadastrada

1. Com uma sessão `super` já ativa e nenhuma entrada em `ArrayAboutModel`, acesse `/landing-page/control`.

**Expected:** é exibida uma mensagem de lista vazia no lugar do cartão, sem os botões de paginação.
