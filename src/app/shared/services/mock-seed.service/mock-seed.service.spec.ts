import { TestBed } from '@angular/core/testing';
import { TipoHabilidade } from '../../models/enums/tipo-habilidade.enum';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
import { MockSeedService } from './mock-seed.service';
import { PessoaService } from '../pessoa.service/pessoa.service';

describe('MockSeedService', () => {
  let servico: MockSeedService;
  let pessoaService: PessoaService;
  let habilidadeService: HabilidadeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(MockSeedService);
    pessoaService = TestBed.inject(PessoaService);
    habilidadeService = TestBed.inject(HabilidadeService);
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
});
