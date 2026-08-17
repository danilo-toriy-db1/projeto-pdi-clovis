import { TestBed } from '@angular/core/testing';
import { CategoriaNotificacao } from '../../models/enums/categoria-notificacao.enum';
import { StatusNotificacao } from '../../models/enums/status-notificacao.enum';
import { TipoHabilidade } from '../../models/enums/tipo-habilidade.enum';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
import { NotificacaoService } from '../notificacao.service/notificacao.service';
import { MockSeedService } from './mock-seed.service';
import { PessoaService } from '../pessoa.service/pessoa.service';

describe('MockSeedService', () => {
  let servico: MockSeedService;
  let pessoaService: PessoaService;
  let habilidadeService: HabilidadeService;
  let notificacaoService: NotificacaoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(MockSeedService);
    pessoaService = TestBed.inject(PessoaService);
    habilidadeService = TestBed.inject(HabilidadeService);
    notificacaoService = TestBed.inject(NotificacaoService);
  });

  it('deve semear a entrada de "Sobre Mim" vinculada ao usuário admin quando o armazenamento está vazio', () => {
    servico.semearDadosDeExemplo();

    const entradas = pessoaService.listarTodas();
    expect(entradas).toHaveLength(1);
    expect(entradas[0].dados.nome).toBe('Danilo');
    expect(entradas[0].dados.imagem).toBe('/logo.svg');
    expect(JSON.parse(localStorage.getItem('admin.vinculo-usuarios') ?? '{}')).toEqual({
      admin: entradas[0].id,
    });
  });

  it('deve semear as 4 habilidades de exemplo (2 soft e 2 hard) vinculadas à mesma entrada', () => {
    servico.semearDadosDeExemplo();

    const entrada = pessoaService.listarTodas()[0];
    const habilidades = habilidadeService.listarPorId(entrada.id);

    expect(habilidades).toHaveLength(4);
    expect(habilidades.filter((item) => item.habilidade.tipo === TipoHabilidade.SOFT)).toHaveLength(2);
    expect(habilidades.filter((item) => item.habilidade.tipo === TipoHabilidade.HARD)).toHaveLength(2);
  });

  it('não deve semear novamente quando já existe alguma pessoa cadastrada', () => {
    pessoaService.criarNova({
      nome: 'Pessoa Existente',
      idade: 1,
      carreira: '',
      profissao: '',
      empresa: '',
      imagem: '',
      descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
    });

    servico.semearDadosDeExemplo();

    expect(pessoaService.listarTodas()).toHaveLength(1);
    expect(pessoaService.listarTodas()[0].dados.nome).toBe('Pessoa Existente');
  });

  it('deve semear notificações de log (novo usuário e nova Landing Page)', () => {
    servico.semearDadosDeExemplo();

    const logs = notificacaoService.listarPorCategoria(CategoriaNotificacao.LOG);
    expect(logs).toHaveLength(2);
    expect(logs.map((item) => item.notificacao.titulo)).toEqual(
      expect.arrayContaining(['Novo usuário cadastrado', 'Nova Landing Page criada']),
    );
  });

  it('deve semear notificações do sistema de exemplo (1 pendente, 2 aprovadas e 1 rejeitada)', () => {
    servico.semearDadosDeExemplo();

    const sistema = notificacaoService.listarPorCategoria(CategoriaNotificacao.SISTEMA);
    expect(sistema).toHaveLength(4);
    expect(sistema.filter((item) => item.status === StatusNotificacao.PENDENTE)).toHaveLength(1);
    expect(sistema.filter((item) => item.status === StatusNotificacao.APROVADA)).toHaveLength(2);
    expect(sistema.filter((item) => item.status === StatusNotificacao.REJEITADA)).toHaveLength(1);
  });

  it('deve semear ao menos uma notificação não vista, para validar o destaque visual', () => {
    servico.semearDadosDeExemplo();

    expect(notificacaoService.contarNaoVistas()).toBeGreaterThan(0);
  });

  it('não deve semear notificações novamente quando já existe alguma cadastrada', () => {
    notificacaoService.criar({
      categoria: CategoriaNotificacao.LOG,
      status: null,
      usuarioOrigem: 'admin',
      usuarioDestino: null,
      vista: true,
      notificacao: { titulo: 'Existente', descricao: '' },
    });

    servico.semearDadosDeExemplo();

    expect(notificacaoService.listarTodas()).toHaveLength(1);
    expect(notificacaoService.listarTodas()[0].notificacao.titulo).toBe('Existente');
  });
});
