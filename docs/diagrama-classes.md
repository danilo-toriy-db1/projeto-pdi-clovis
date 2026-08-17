# Diagrama de classes

Entidades dos modelos de dados (`shared/models`) e seus relacionamentos, refletindo o estado
atual do código.

```mermaid
classDiagram
  class Usuario {
    +usuario: string
    +senha: string
    +role: Role
  }
  class NovoUsuario {
    +usuario: string
    +senha: string
    +role: Role
  }
  class Sessao {
    +usuario: string
    +role: Role
  }
  class Role {
    <<enumeration>>
    USER
    ADMIN
    SUPER
  }
  class ResultadoLogin {
    +resultado: ResultadoAutenticacao
    +destino?: string
  }
  class ResultadoAutenticacao {
    <<enumeration>>
    USUARIO_NAO_ENCONTRADO
    CREDENCIAIS_INVALIDAS
    ACESSO_NEGADO
    SUCESSO
  }
  class IntentLogin {
    <<enumeration>>
    LOGIN
    PAINEL_ADMIN
  }
  Usuario --> Role
  NovoUsuario --> Role
  Sessao --> Role
  ResultadoLogin --> ResultadoAutenticacao

  class ArrayAboutModel {
    +id: number
    +dados: AboutModel
  }
  class AboutModel {
    +nome: string
    +idade: number
    +carreira: string
    +profissao: string
    +empresa: string
    +imagem: string
    +descricao: DescricaoAbout
  }
  class DescricaoAbout {
    +biografia: string
    +hobbies: string
    +desgostos: string
    +objetivos: string
  }
  class ArrayHabilitiesModel {
    +id: number
    +habilidade: HabilitiesModel
  }
  class HabilitiesModel {
    +habilidade: string
    +tipo: TipoHabilidade
    +icone: string
  }
  class TipoHabilidade {
    <<enumeration>>
    SOFT
    HARD
  }
  ArrayAboutModel --> AboutModel
  AboutModel --> DescricaoAbout
  ArrayHabilitiesModel --> HabilitiesModel
  HabilitiesModel --> TipoHabilidade

  class ArraySolicitacoesHabilidadeModel {
    +id: number
    +idPessoa: number
    +usuarioAdminAlvo: string?
    +tipoSolicitacao: TipoSolicitacaoHabilidade
    +solicitacao: SolicitacaoHabilidade
  }
  class SolicitacaoHabilidade {
    +habilidade: string
    +tipo: TipoHabilidade
    +usuarioSolicitante: string
  }
  class TipoSolicitacaoHabilidade {
    <<enumeration>>
    ADICIONAR
    REMOVER
  }
  ArraySolicitacoesHabilidadeModel --> SolicitacaoHabilidade
  ArraySolicitacoesHabilidadeModel --> TipoSolicitacaoHabilidade
  ArraySolicitacoesHabilidadeModel "1" --> "0..1" ArrayAboutModel : idPessoa
  SolicitacaoHabilidade --> TipoHabilidade
```

`ArraySolicitacoesHabilidadeModel.idPessoa` referencia o `id` de um `ArrayAboutModel` (a landing
page alvo da solicitação); `usuarioAdminAlvo` referencia o `usuario` do admin dono dessa landing
page (resolvido pelo vínculo interno de `PessoaService`, nunca armazenado como referência direta a
`Usuario`). Quando não há admin vinculado à landing page, `usuarioAdminAlvo` é `null` e a
solicitação só é visível para a role `super`.
