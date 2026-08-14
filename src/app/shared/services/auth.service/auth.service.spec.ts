import { TestBed } from '@angular/core/testing';
import { IntentLogin } from '../../models/enums/intent-login.enum';
import { ResultadoAutenticacao } from '../../models/enums/resultado-autenticacao.enum';
import { Role } from '../../models/enums/role.enum';
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
