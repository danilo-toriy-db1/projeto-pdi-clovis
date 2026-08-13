# Dependências técnicas do domínio Admin

> **Maintaining this skill**
>
> Atualize esta lista sempre que uma dependência técnica for adicionada,
> deixar de ser necessária ou mudar o que afeta no domínio se estiver
> ausente. Um ajuste cosmético (por exemplo, renomear um arquivo interno) que
> preserva a dependência em si não exige alteração.

- **`AuthGuard` do domínio Login / Autenticação** — protege a rota `/admin`
  e todas as suas páginas. Sem ele, o painel Admin ficaria acessível a
  qualquer visitante não autenticado, ou a um usuário autenticado sem a role
  adequada.
- **`localStorage`** — meio de persistência de usuários, do tema ativo e das
  entidades `ArrayAboutModel` e `ArrayHabilitiesModel`. Sem ele, nenhum dado
  cadastrado em "Editar Dados" ou "Editar Usuários" sobreviveria a um
  recarregamento da página, já que o domínio não tem backend, API ou banco
  de dados.
- **Reactive Forms (Angular)** — os formulários de "Editar Dados" e "Editar
  Usuários" são construídos com formulário reativo, nunca orientado a
  template. Sem essa técnica, esses formulários deixariam de seguir a
  convenção de formulários obrigatória em todo o projeto. Deve-se ter Validators
  e mensagens/feedbacks que dêem foco e pintem a borda do input de vermelho
  em caso do usuário tentar cadastrar deixando um campo obrigatório vazio, 
  por exemplo.
- **Sistema de temas claro/escuro (SASS, paleta de cores fornecida)** — o
  primeiro card da Página Inicial do Admin alterna o tema global da
  aplicação. Sem esse sistema, não haveria mecanismo para essa alternância.
- **Ícones SVG locais** — cada `HabilitiesModel` cadastrado em "Editar
  Dados" referencia um ícone SVG armazenado localmente no projeto, sem
  depender de CDN externo. Sem essa gestão local, o cadastro de habilidades
  ficaria sem uma forma consistente de associar um ícone a cada uma.
- **`NgOptimizedImage`** — usado para renderizar a imagem de perfil
  (`AboutModel.imagem`) e os ícones de habilidade cadastrados em "Editar
  Dados", já que são assets estáticos servidos pela aplicação (não se aplica
  a imagens inline em base64). Sem ela, a renderização dessas imagens
  violaria a convenção de imagens estáticas do projeto.
- **Sistema de roteamento (Angular Router)** — usado pelo segundo card da
  Página Inicial do Admin (retorno a `/landing-page/:id`) e pela navegação entre
  as 3 páginas do header do Admin. Sem ele, não haveria como navegar entre
  as páginas deste domínio nem voltar à Landing Page. O `id` será o id do `admin`
  que está ativo, pois todo admin tem uma Landing Page própria.
- **Enum de roles do domínio Login / Autenticação** — a criação de um novo
  usuário na tela "Editar Usuários" exige selecionar uma role desse enum.
  Sem essa modelagem, a criação de usuários ficaria vulnerável a erros de
  grafia que quebrariam silenciosamente o `AuthGuard` e a proteção da conta
  `superAdmin`.
- **Sistema de Feedback Visual** - O modal de feedback visual deve ser o 
  mesmo do login, um modal que possa mostrar mensagens customizadas ou uma 
  mensagem padrão, mostrando ícones como carregando com um spin, um check 
  com sucesso, entre outros. Deve-se atentar ao componente do modal, pois 
  ele deve, obrigatoriamente, estar na pasta shared, visto que diferentes 
  módulos irão compartilhá-la.
- **`Encrypter.js` do domínio Login / Autenticação** — usado para
  criptografar a senha de um usuário criado pela tela "Editar Usuários". Sem
  ele, a criação de usuário neste domínio persistiria a senha em texto
  puro, violando a convenção de segurança do domínio Login.
- **Modal de confirmação de exclusão** — necessário na tela "Editar
  Usuários" para confirmar a exclusão de um usuário antes de efetivá-la
  (exigência herdada do domínio Login / Autenticação), e também na tela
  "Editar Dados" para confirmar a remoção de uma entrada `ArrayAboutModel`
  ou `ArrayHabilitiesModel` antes de efetivá-la. Sem ele, qualquer uma
  dessas remoções ficaria sujeita a exclusões acidentais. Deve viver na
  pasta `shared`, para ser reaproveitado pelas duas telas.
