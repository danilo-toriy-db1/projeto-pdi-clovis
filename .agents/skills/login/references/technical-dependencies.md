# Dependências técnicas do domínio Login / Autenticação

> **Maintaining this skill**
>
> Atualize esta lista sempre que uma dependência técnica for adicionada,
> deixar de ser necessária ou mudar o que afeta no domínio se estiver ausente.
> Um ajuste cosmético (por exemplo, renomear um arquivo interno) que preserva
> a dependência em si não exige alteração.

- **`localStorage`** — único mecanismo de persistência para usuários, roles e
  sessão. Sem ele, não há nenhuma forma de guardar credenciais, papéis ou o
  estado de autenticação entre recarregamentos da página, já que o domínio não
  tem backend, API ou banco de dados.
- **`Encrypter.js`** — usado para criptografar os dados de usuário (em
  especial as senhas) antes de persisti-los em `localStorage`, aumentando a
  segurança do armazenamento local. Sem ele, as senhas ficariam expostas em
  texto puro no `localStorage`, visíveis a qualquer script ou extensão com
  acesso ao armazenamento do navegador.
- **Roles como Enum** — as roles (`user`, `admin`, `super`) devem ser
  modeladas como um enum, nunca como strings livres. Sem essa modelagem, a
  criação e a verificação de papéis ficam vulneráveis a erros de grafia que
  quebrariam silenciosamente o `AuthGuard` e a proteção da conta `superAdmin`.
- **Tela com modal de Reactive Forms e feedback visual** — deve existir uma
  tela que abre o modal do formulário reativo de login e apresenta os estados
  visuais de carregamento, acesso negado e sucesso. Sem essa tela, não há
  forma de o usuário inserir credenciais nem de perceber o resultado da
  tentativa de login.
- **Reactive Forms (Angular)** — o formulário de login é construído com
  Reactive Forms, nunca com formulário orientado a template. Sem essa técnica,
  o formulário de login deixaria de seguir a convenção de formulários
  obrigatória em todo o projeto.
- **Botão de acesso à Landing Page sem login** — deve existir, na tela
  `/login`, um botão que permite seguir para a Landing Page sem autenticação.
  Sem ele, um visitante não autenticado ficaria sem forma de alcançar a
  Landing Page a partir da tela de login.
- **Sistema de temas claro/escuro (SASS, paleta de cores fornecida)** — a
  rota `/login` renderiza o mesmo header reduzido com alternância de tema
  usado nas demais rotas da aplicação. Sem esse sistema, a tela `/login`
  ficaria inconsistente com o restante da aplicação, que exige tema claro e
  escuro em toda a interface.
- **Sistema de roteamento** - O Router deve ser usado para o sistema de 
roteamento implementado na tela de login.
