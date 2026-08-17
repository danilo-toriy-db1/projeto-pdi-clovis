import { TestBed } from '@angular/core/testing';
import { CategoriaNotificacao } from '../../models/enums/categoria-notificacao.enum';
import { IntentLogin } from '../../models/enums/intent-login.enum';
import { ResultadoAutenticacao } from '../../models/enums/resultado-autenticacao.enum';
import { Role } from '../../models/enums/role.enum';
import { NotificacaoService } from '../notificacao.service/notificacao.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function criarServico(): AuthService {
    TestBed.configureTestingModule({});
    return TestBed.inject(AuthService);
  }

  describe('seed inicial', () => {
    it('deve semear as três contas fixas em localStorage na primeira execução', async () => {
      const servico = criarServico();
      await servico.autenticar('conta-que-nao-existe', 'senha-que-nao-existe', IntentLogin.LOGIN);

      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');

      expect(usuariosSalvos).toHaveLength(3);
      expect(usuariosSalvos.map((usuario: { usuario: string }) => usuario.usuario)).toEqual(
        expect.arrayContaining(['user', 'admin', 'superAdmin']),
      );
    });

    it('não deve semear novamente quando a chave login.usuarios já existe', async () => {
      localStorage.setItem(
        'login.usuarios',
        JSON.stringify([{ usuario: 'ja-existe', senha: 'x', role: Role.USER }]),
      );

      const servico = criarServico();
      await servico.autenticar('conta-que-nao-existe', 'senha-que-nao-existe', IntentLogin.LOGIN);

      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      expect(usuariosSalvos).toHaveLength(1);
      expect(usuariosSalvos[0].usuario).toBe('ja-existe');
    });
  });

  describe('validação de credenciais (autenticar)', () => {
    it('deve retornar USUARIO_NAO_ENCONTRADO quando usuário e senha não correspondem a nenhum registro', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar(
        'conta-inexistente',
        'qualquer123',
        IntentLogin.LOGIN,
      );

      expect(resultado.resultado).toBe(ResultadoAutenticacao.USUARIO_NAO_ENCONTRADO);
    });

    it('deve retornar CREDENCIAIS_INVALIDAS quando o usuário existe mas a senha está errada', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar('admin', 'senha-errada', IntentLogin.LOGIN);

      expect(resultado.resultado).toBe(ResultadoAutenticacao.CREDENCIAIS_INVALIDAS);
    });

    it('deve retornar CREDENCIAIS_INVALIDAS quando a senha existe em outro registro mas o usuário não existe', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar('usuario-errado', '123U', IntentLogin.LOGIN);

      expect(resultado.resultado).toBe(ResultadoAutenticacao.CREDENCIAIS_INVALIDAS);
    });

    it('deve autenticar role user com sucesso e gravar a sessão', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar('user', '123U', IntentLogin.LOGIN);

      expect(resultado).toEqual({
        resultado: ResultadoAutenticacao.SUCESSO,
        destino: '/landing-page',
      });
      expect(servico.sessao()).toEqual({ usuario: 'user', role: Role.USER });
      expect(JSON.parse(localStorage.getItem('login.sessao') ?? 'null')).toEqual({
        usuario: 'user',
        role: Role.USER,
      });
    });

    it('deve autenticar role admin com sucesso e redirecionar para /admin/{id da conta}', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar('admin', '123@', IntentLogin.LOGIN);

      expect(resultado).toEqual({
        resultado: ResultadoAutenticacao.SUCESSO,
        destino: '/admin/admin',
      });
    });

    it('deve autenticar role super com sucesso e redirecionar para /admin/control', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

      expect(resultado).toEqual({
        resultado: ResultadoAutenticacao.SUCESSO,
        destino: '/admin/control',
      });
    });

    it('deve negar acesso quando role user entra pelo intent painel-admin, mas ainda grava a sessão', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar('user', '123U', IntentLogin.PAINEL_ADMIN);

      expect(resultado).toEqual({ resultado: ResultadoAutenticacao.ACESSO_NEGADO });
      expect(servico.sessao()).toEqual({ usuario: 'user', role: Role.USER });
    });

    it('deve permitir sucesso normal quando role admin ou super entram pelo intent painel-admin', async () => {
      const servico = criarServico();

      const resultado = await servico.autenticar(
        'superAdmin',
        '123Super',
        IntentLogin.PAINEL_ADMIN,
      );

      expect(resultado).toEqual({
        resultado: ResultadoAutenticacao.SUCESSO,
        destino: '/admin/control',
      });
    });
  });

  describe('criação de conta (sem sessão prévia, pelo modal)', () => {
    it('deve criar uma conta role user sem exigir sessão prévia, com a senha criptografada', async () => {
      const servico = criarServico();

      const criado = await servico.criarUsuario(
        { usuario: 'novo-usuario-teste', senha: 'SenhaTeste1', role: Role.USER },
        null,
      );

      expect(criado).toBe(true);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      const registro = usuariosSalvos.find(
        (usuario: { usuario: string }) => usuario.usuario === 'novo-usuario-teste',
      );
      expect(registro.senha).not.toBe('SenhaTeste1');
      expect(registro.role).toBe(Role.USER);
    });

    it('deve criar uma conta role admin sem exigir sessão prévia', async () => {
      const servico = criarServico();

      const criado = await servico.criarUsuario(
        { usuario: 'novo-admin-teste', senha: 'SenhaTeste1', role: Role.ADMIN },
        null,
      );

      expect(criado).toBe(true);
    });

    it('nunca deve criar uma conta role super sem sessão prévia', async () => {
      const servico = criarServico();

      const criado = await servico.criarUsuario(
        { usuario: 'novo-super-teste', senha: 'SenhaTeste1', role: Role.SUPER },
        null,
      );

      expect(criado).toBe(false);
    });

    it('deve registrar uma notificação de log ao criar uma conta com sucesso', async () => {
      const servico = criarServico();
      const notificacaoService = TestBed.inject(NotificacaoService);

      await servico.criarUsuario(
        { usuario: 'novo-usuario-log', senha: 'SenhaTeste1', role: Role.USER },
        null,
      );

      const logs = notificacaoService.listarPorCategoria(CategoriaNotificacao.LOG);
      expect(logs).toHaveLength(1);
      expect(logs[0].usuarioOrigem).toBe('novo-usuario-log');
      expect(logs[0].notificacao.titulo).toBe('Novo usuário cadastrado');
      expect(logs[0].vista).toBe(false);
    });

    it('não deve registrar notificação quando a criação falha', async () => {
      const servico = criarServico();
      const notificacaoService = TestBed.inject(NotificacaoService);

      await servico.criarUsuario({ usuario: 'admin', senha: 'SenhaTeste1', role: Role.USER }, null);

      expect(notificacaoService.listarPorCategoria(CategoriaNotificacao.LOG)).toHaveLength(0);
    });
  });

  describe('promoverParaAdmin', () => {
    it('deve mudar a role de um usuário existente com role user para admin', async () => {
      const servico = criarServico();

      const promovido = await servico.promoverParaAdmin('user');

      expect(promovido).toBe(true);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      const registro = usuariosSalvos.find(
        (usuario: { usuario: string }) => usuario.usuario === 'user',
      );
      expect(registro.role).toBe(Role.ADMIN);
    });

    it('deve atualizar a sessão ativa quando o próprio usuário logado é promovido', async () => {
      const servico = criarServico();
      await servico.autenticar('user', '123U', IntentLogin.LOGIN);

      await servico.promoverParaAdmin('user');

      expect(servico.sessao()).toEqual({ usuario: 'user', role: Role.ADMIN });
    });

    it('não deve alterar a sessão ativa quando outro usuário é promovido', async () => {
      const servico = criarServico();
      await servico.autenticar('admin', '123@', IntentLogin.LOGIN);

      await servico.promoverParaAdmin('user');

      expect(servico.sessao()).toEqual({ usuario: 'admin', role: Role.ADMIN });
    });

    it('deve retornar false para um usuário que não existe', async () => {
      const servico = criarServico();

      expect(await servico.promoverParaAdmin('nao-existe')).toBe(false);
    });

    it('deve retornar false ao tentar promover uma conta que já é admin ou super', async () => {
      const servico = criarServico();

      expect(await servico.promoverParaAdmin('admin')).toBe(false);
      expect(await servico.promoverParaAdmin('superAdmin')).toBe(false);
    });

    it('deve registrar uma notificação de log de nova Landing Page ao promover com sucesso', async () => {
      const servico = criarServico();
      const notificacaoService = TestBed.inject(NotificacaoService);

      await servico.promoverParaAdmin('user');

      const logs = notificacaoService.listarPorCategoria(CategoriaNotificacao.LOG);
      expect(logs).toHaveLength(1);
      expect(logs[0].usuarioOrigem).toBe('user');
      expect(logs[0].notificacao.titulo).toBe('Nova Landing Page criada');
    });

    it('não deve registrar notificação quando a promoção falha', async () => {
      const servico = criarServico();
      const notificacaoService = TestBed.inject(NotificacaoService);

      await servico.promoverParaAdmin('nao-existe');

      expect(notificacaoService.listarPorCategoria(CategoriaNotificacao.LOG)).toHaveLength(0);
    });
  });

  describe('regras de criação por role de quem cria', () => {
    it('sessão super pode criar usuário com qualquer role, incluindo super', async () => {
      const servico = criarServico();

      const criado = await servico.criarUsuario(
        { usuario: 'outro-super', senha: 'Senha1', role: Role.SUPER },
        Role.SUPER,
      );

      expect(criado).toBe(true);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      expect(
        usuariosSalvos.some((usuario: { usuario: string }) => usuario.usuario === 'outro-super'),
      ).toBe(true);
    });

    it('sessão admin pode criar usuário com role user ou admin', async () => {
      const servico = criarServico();

      expect(
        await servico.criarUsuario(
          { usuario: 'criado-user', senha: 'Senha1', role: Role.USER },
          Role.ADMIN,
        ),
      ).toBe(true);
      expect(
        await servico.criarUsuario(
          { usuario: 'criado-admin', senha: 'Senha1', role: Role.ADMIN },
          Role.ADMIN,
        ),
      ).toBe(true);
    });

    it('sessão admin não pode criar usuário com role super', async () => {
      const servico = criarServico();

      const criado = await servico.criarUsuario(
        { usuario: 'tentativa-super', senha: 'Senha1', role: Role.SUPER },
        Role.ADMIN,
      );

      expect(criado).toBe(false);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      expect(
        usuariosSalvos.some(
          (usuario: { usuario: string }) => usuario.usuario === 'tentativa-super',
        ),
      ).toBe(false);
    });

    it('não deve criar um usuário com um identificador já existente', async () => {
      const servico = criarServico();

      const criado = await servico.criarUsuario(
        { usuario: 'admin', senha: 'Senha1', role: Role.USER },
        null,
      );

      expect(criado).toBe(false);
    });
  });

  describe('atualização de usuário existente (atualizarUsuario)', () => {
    it('deve trocar a senha e a role de um usuário existente, criptografando a nova senha', async () => {
      const servico = criarServico();

      const atualizado = await servico.atualizarUsuario(
        { usuario: 'user', senha: 'NovaSenha1', role: Role.ADMIN },
        Role.SUPER,
      );

      expect(atualizado).toBe(true);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      const registro = usuariosSalvos.find(
        (usuario: { usuario: string }) => usuario.usuario === 'user',
      );
      expect(registro.role).toBe(Role.ADMIN);
      expect(registro.senha).not.toBe('NovaSenha1');
    });

    it('deve atualizar a sessão ativa quando o usuário editado é quem está logado', async () => {
      const servico = criarServico();
      await servico.autenticar('admin', '123@', IntentLogin.LOGIN);

      await servico.atualizarUsuario(
        { usuario: 'admin', senha: 'NovaSenha1', role: Role.ADMIN },
        Role.SUPER,
      );

      expect(servico.sessao()).toEqual({ usuario: 'admin', role: Role.ADMIN });
    });

    it('não deve atualizar um usuário que não existe', async () => {
      const servico = criarServico();

      const atualizado = await servico.atualizarUsuario(
        { usuario: 'inexistente', senha: 'Senha1', role: Role.USER },
        Role.SUPER,
      );

      expect(atualizado).toBe(false);
    });

    it('sessão admin não pode promover um usuário para role super', async () => {
      const servico = criarServico();
      await servico.listarUsuarios(Role.SUPER);

      const atualizado = await servico.atualizarUsuario(
        { usuario: 'user', senha: 'Senha1', role: Role.SUPER },
        Role.ADMIN,
      );

      expect(atualizado).toBe(false);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      const registro = usuariosSalvos.find(
        (usuario: { usuario: string }) => usuario.usuario === 'user',
      );
      expect(registro.role).toBe(Role.USER);
    });

    it('deve sempre rejeitar rebaixar a role de uma conta super para outra role, mesmo por uma sessão super', async () => {
      const servico = criarServico();

      const atualizado = await servico.atualizarUsuario(
        { usuario: 'superAdmin', senha: 'Senha1', role: Role.ADMIN },
        Role.SUPER,
      );

      expect(atualizado).toBe(false);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      const registro = usuariosSalvos.find(
        (usuario: { usuario: string }) => usuario.usuario === 'superAdmin',
      );
      expect(registro.role).toBe(Role.SUPER);
    });

    it('deve permitir trocar apenas a senha de uma conta super, mantendo a role super', async () => {
      const servico = criarServico();

      const atualizado = await servico.atualizarUsuario(
        { usuario: 'superAdmin', senha: 'NovaSenhaSuper1', role: Role.SUPER },
        Role.SUPER,
      );

      expect(atualizado).toBe(true);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      const registro = usuariosSalvos.find(
        (usuario: { usuario: string }) => usuario.usuario === 'superAdmin',
      );
      expect(registro.role).toBe(Role.SUPER);
      expect(registro.senha).not.toBe('NovaSenhaSuper1');
    });
  });

  describe('invariante de não exclusão da conta superAdmin', () => {
    it('deve sempre rejeitar a exclusão da conta superAdmin', async () => {
      const servico = criarServico();

      const excluido = await servico.excluirUsuario('superAdmin');

      expect(excluido).toBe(false);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      expect(
        usuariosSalvos.some((usuario: { usuario: string }) => usuario.usuario === 'superAdmin'),
      ).toBe(true);
    });

    it('deve permitir a exclusão de um usuário que não tenha role super', async () => {
      const servico = criarServico();

      const excluido = await servico.excluirUsuario('user');

      expect(excluido).toBe(true);
      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      expect(
        usuariosSalvos.some((usuario: { usuario: string }) => usuario.usuario === 'user'),
      ).toBe(false);
    });
  });

  describe('listarUsuarios', () => {
    it('deve retornar todos os usuários, incluindo contas super, para quem vê com role super', async () => {
      const servico = criarServico();

      const usuarios = await servico.listarUsuarios(Role.SUPER);

      expect(usuarios.map((usuario) => usuario.usuario)).toEqual(
        expect.arrayContaining(['user', 'admin', 'superAdmin']),
      );
    });

    it('deve retornar apenas usuários user/admin, sem nenhuma conta super, para quem vê com role admin', async () => {
      const servico = criarServico();

      const usuarios = await servico.listarUsuarios(Role.ADMIN);

      expect(usuarios.map((usuario) => usuario.usuario)).toEqual(
        expect.arrayContaining(['user', 'admin']),
      );
      expect(usuarios.some((usuario) => usuario.role === Role.SUPER)).toBe(false);
    });
  });

  describe('rolesCriaveis', () => {
    it('deve permitir qualquer role, incluindo super, para quem cria com role super', () => {
      const servico = criarServico();

      expect(servico.rolesCriaveis(Role.SUPER)).toEqual([Role.USER, Role.ADMIN, Role.SUPER]);
    });

    it('deve permitir apenas user e admin, sem super, para quem cria com role admin ou sem sessão', () => {
      const servico = criarServico();

      expect(servico.rolesCriaveis(Role.ADMIN)).toEqual([Role.USER, Role.ADMIN]);
      expect(servico.rolesCriaveis(null)).toEqual([Role.USER, Role.ADMIN]);
    });
  });

  describe('resolverSegmentoAdmin', () => {
    it('deve devolver "control" para uma sessão super', () => {
      const servico = criarServico();

      expect(servico.resolverSegmentoAdmin({ usuario: 'superAdmin', role: Role.SUPER })).toBe(
        'control',
      );
    });

    it('deve devolver o próprio usuário para uma sessão admin', () => {
      const servico = criarServico();

      expect(servico.resolverSegmentoAdmin({ usuario: 'admin', role: Role.ADMIN })).toBe('admin');
    });
  });

  describe('logout', () => {
    it('deve remover a sessão de localStorage e do signal', async () => {
      const servico = criarServico();
      await servico.autenticar('user', '123U', IntentLogin.LOGIN);

      servico.logout();

      expect(servico.sessao()).toBeNull();
      expect(localStorage.getItem('login.sessao')).toBeNull();
    });
  });
});
