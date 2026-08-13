# Dependências técnicas do domínio Landing Page

> **Maintaining this skill**
>
> Atualize esta lista sempre que uma dependência técnica for adicionada,
> deixar de ser necessária ou mudar o que afeta no domínio se estiver
> ausente. Um ajuste cosmético (por exemplo, renomear um arquivo interno) que
> preserva a dependência em si não exige alteração.

- **Sistema de temas claro/escuro (SASS, paleta de cores fornecida)** —
  alternância lua/sol no header e no terceiro card da Página Inicial. Sem
  esse sistema, não haveria mecanismo para essa alternância nem para o
  efeito `--brilho-card` usado nos 3 cards da Página Inicial.
- **Ícones e imagens** — placeholders temporários até a entrega definitiva
  dos ativos reais pelo usuário; a imagem de perfil de `AboutModel` usa a
  logo do projeto como placeholder padrão na ausência de imagem própria. Sem
  eles, a página "Sobre Mim" e a Página Inicial ficariam sem imagem exibível
  antes da entrega dos ativos definitivos.
- **`ArrayAboutModel` e `ArrayHabilitiesModel` do domínio Admin** — fonte dos
  dados dinâmicos exibidos nas páginas Sobre Mim e Habilidades. Sem eles, as
  páginas Sobre Mim e Habilidades não teriam nenhum dado para exibir.
- **`login` (indireto, via Admin)** — o card de criação de nova pessoa
  redireciona para o fluxo de criação de conta do Admin. Sem o domínio
  Login, esse card não teria para onde encaminhar o visitante nem como
  bloquear o acesso ao Admin até a criação de conta.
- **Sistema de roteamento (Angular Router)** — resolve as rotas
  `/landing-page`, `/landing-page/control` e `/landing-page/:id`, a navegação
  entre as 4 páginas do header e os redirecionamentos dos cards da Página
  Inicial (repositório GitHub externo, fluxo de criação de conta ou tela
  "Editar Dados" do Admin, alternância de tema). A rota literal
  `/landing-page/control` precisa ser registrada antes da rota parametrizada
  `/landing-page/:id`, para que o roteador a resolva como a rota exclusiva do
  super em vez de tentar interpretar `"super"` como um `id` de pessoa. Sem
  ele, não haveria como navegar entre as páginas deste domínio nem resolver o
  `id` da pessoa exibida.
- **Verificação de sessão/role do domínio Login / Autenticação** — usada pela
  rota `/landing-page/control` para conferir se a sessão ativa tem role
  `super` antes de exibir a listagem de todas as Landing Pages. Sem essa
  verificação, qualquer visitante poderia acessar a listagem completa de
  Landing Pages, mesmo sem uma sessão `super` ativa.
- **`NgOptimizedImage`** — usado para renderizar a imagem de perfil
  (`AboutModel.imagem`) na página "Sobre Mim" e os ícones SVG de cada
  habilidade na página de Habilidades, já que são assets estáticos servidos
  pela aplicação (não se aplica a imagens inline em base64). Sem ela, a
  renderização dessas imagens violaria a convenção de imagens estáticas do
  projeto.
- **Gestão de ícones SVG locais** — cada habilidade exibida na página de
  Habilidades referencia um ícone SVG armazenado localmente no projeto, sem
  depender de CDN externo. Sem essa convenção, a página não teria como
  resolver de forma consistente qual arquivo exibir para cada habilidade.
- **Animações CSS/SASS (keyframes/transições)** — necessárias para a
  animação de "descida" da linha tracejada central, das ramificações
  esquerda/direita e do fade-in dos cartões de habilidade na página de
  Habilidades. Sem elas, essa página perderia as animações especificadas
  pela fonte de negócio.
