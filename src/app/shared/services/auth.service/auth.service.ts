import { Injectable, computed, inject, signal } from '@angular/core';
import { IntentLogin } from '../../models/enums/intent-login.enum';
import { ResultadoAutenticacao } from '../../models/enums/resultado-autenticacao.enum';
import { Role } from '../../models/enums/role.enum';
import { NovoUsuario } from '../../models/interfaces/novo-usuario.interface';
import { ResultadoLogin } from '../../models/interfaces/resultado-login.interface';
import { Sessao } from '../../models/interfaces/sessao.interface';
import { Usuario } from '../../models/interfaces/usuario.interface';
import { AtrasoService } from '../atraso.service/atraso.service';
import { Encrypter } from '../encrypter/encrypter';
import { Router } from '@angular/router';

const CHAVE_USUARIOS = 'login.usuarios';
const CHAVE_SESSAO = 'login.sessao';
const DURACAO_SIMULACAO_MS = 3000;

const USUARIOS_FIXOS: ReadonlyArray<{ usuario: string; senha: string; role: Role }> = [
  { usuario: 'user', senha: '123U', role: Role.USER },
  { usuario: 'admin', senha: '123@', role: Role.ADMIN },
  { usuario: 'superAdmin', senha: '123Super', role: Role.SUPER },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private readonly atrasoService = inject(AtrasoService);
  private readonly sessaoSignal = signal<Sessao | null>(this.lerSessao());
  readonly sessao = this.sessaoSignal.asReadonly();
  readonly role = computed<Role | null>(() => this.sessaoSignal()?.role ?? null);
  readonly estaAutenticado = computed(() => this.sessaoSignal() !== null);

  private usuariosSemeadosPromise: Promise<void> | null = null;

  aguardarSimulacaoDeRede(): Promise<void> {
    return this.atrasoService.aguardar(DURACAO_SIMULACAO_MS);
  }

  temPermissaoPainelAdmin(role: Role | null): boolean {
    return role === Role.ADMIN || role === Role.SUPER;
  }

  async autenticar(usuario: string, senha: string, intent: IntentLogin): Promise<ResultadoLogin> {
    await this.garantirSeed();
    const usuarios = this.lerUsuarios();
    const registro = usuarios.find((umUsuario) => umUsuario.usuario === usuario);
    const senhaValidaEmAlgumRegistro = await this.senhaCorrespondeAAlgumRegistro(senha, usuarios);

    if (!registro && !senhaValidaEmAlgumRegistro) {
      return { resultado: ResultadoAutenticacao.USUARIO_NAO_ENCONTRADO };
    }

    if (!registro || !(await Encrypter.matches(senha, registro.senha))) {
      return { resultado: ResultadoAutenticacao.CREDENCIAIS_INVALIDAS };
    }

    this.gravarSessao({ usuario: registro.usuario, role: registro.role });

    if (intent === IntentLogin.PAINEL_ADMIN && !this.temPermissaoPainelAdmin(registro.role)) {
      return { resultado: ResultadoAutenticacao.ACESSO_NEGADO };
    }

    return {
      resultado: ResultadoAutenticacao.SUCESSO,
      destino: this.resolverDestinoSucesso(registro),
    };
  }

  async criarUsuario(novoUsuario: NovoUsuario, roleDeQuemCria: Role | null): Promise<boolean> {
    if (!this.podeCriarRole(roleDeQuemCria, novoUsuario.role)) {
      return false;
    }

    await this.garantirSeed();
    const usuarios = this.lerUsuarios();
    if (usuarios.some((umUsuario) => umUsuario.usuario === novoUsuario.usuario)) {
      return false;
    }

    const senhaCriptografada = await Encrypter.encrypt(novoUsuario.senha);
    usuarios.push({
      usuario: novoUsuario.usuario,
      senha: senhaCriptografada,
      role: novoUsuario.role,
    });
    this.gravarUsuarios(usuarios);

    return true;
  }

  async atualizarUsuario(dados: NovoUsuario, roleDeQuemEdita: Role | null): Promise<boolean> {
    if (!this.podeCriarRole(roleDeQuemEdita, dados.role)) {
      return false;
    }

    await this.garantirSeed();
    const usuarios = this.lerUsuarios();
    const indice = usuarios.findIndex((umUsuario) => umUsuario.usuario === dados.usuario);
    if (indice === -1) {
      return false;
    }

    const senhaCriptografada = await Encrypter.encrypt(dados.senha);
    usuarios[indice] = { usuario: dados.usuario, senha: senhaCriptografada, role: dados.role };
    this.gravarUsuarios(usuarios);

    if (this.sessaoSignal()?.usuario === dados.usuario) {
      this.gravarSessao({ usuario: dados.usuario, role: dados.role });
    }

    return true;
  }

  async listarUsuarios(roleDeQuemVe: Role): Promise<Usuario[]> {
    await this.garantirSeed();
    const usuarios = this.lerUsuarios();

    if (roleDeQuemVe === Role.SUPER) {
      return usuarios;
    }

    return usuarios.filter(
      (umUsuario) => umUsuario.role === Role.USER || umUsuario.role === Role.ADMIN,
    );
  }

  rolesCriaveis(roleDeQuemCria: Role | null): Role[] {
    if (roleDeQuemCria === Role.SUPER) {
      return [Role.USER, Role.ADMIN, Role.SUPER];
    }

    return [Role.USER, Role.ADMIN];
  }

  async excluirUsuario(usuario: string): Promise<boolean> {
    await this.garantirSeed();
    const usuarios = this.lerUsuarios();
    const registro = usuarios.find((umUsuario) => umUsuario.usuario === usuario);
    if (!registro || registro.role === Role.SUPER) {
      return false;
    }

    this.gravarUsuarios(usuarios.filter((umUsuario) => umUsuario.usuario !== usuario));

    return true;
  }

  logout(): void {
    localStorage.removeItem(CHAVE_SESSAO);
    this.sessaoSignal.set(null);
    this.router.navigate(['/login']).catch(() => {});
  }

  private podeCriarRole(roleDeQuemCria: Role | null, roleDesejada: Role): boolean {
    return this.rolesCriaveis(roleDeQuemCria).includes(roleDesejada);
  }

  private resolverDestinoSucesso(usuario: Usuario): string {
    switch (usuario.role) {
      case Role.USER:
        return '/landing-page';
      case Role.ADMIN:
        return `/admin/${usuario.usuario}`;
      case Role.SUPER:
        return '/admin/super';
    }
  }

  private async senhaCorrespondeAAlgumRegistro(
    senha: string,
    usuarios: Usuario[],
  ): Promise<boolean> {
    for (const usuarioRegistrado of usuarios) {
      if (await Encrypter.matches(senha, usuarioRegistrado.senha)) {
        return true;
      }
    }

    return false;
  }

  private garantirSeed(): Promise<void> {
    if (!this.usuariosSemeadosPromise) {
      this.usuariosSemeadosPromise = this.semearUsuariosIniciais();
    }

    return this.usuariosSemeadosPromise;
  }

  private async semearUsuariosIniciais(): Promise<void> {
    if (localStorage.getItem(CHAVE_USUARIOS)) {
      return;
    }

    const usuarios: Usuario[] = await Promise.all(
      USUARIOS_FIXOS.map(async (usuarioFixo) => ({
        usuario: usuarioFixo.usuario,
        senha: await Encrypter.encrypt(usuarioFixo.senha),
        role: usuarioFixo.role,
      })),
    );

    this.gravarUsuarios(usuarios);
  }

  private lerUsuarios(): Usuario[] {
    const usuariosSalvos = localStorage.getItem(CHAVE_USUARIOS);
    return usuariosSalvos ? JSON.parse(usuariosSalvos) : [];
  }

  private gravarUsuarios(usuarios: Usuario[]): void {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
  }

  private lerSessao(): Sessao | null {
    const sessaoSalva = localStorage.getItem(CHAVE_SESSAO);
    return sessaoSalva ? JSON.parse(sessaoSalva) : null;
  }

  private gravarSessao(sessao: Sessao): void {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    this.sessaoSignal.set(sessao);
  }
}
