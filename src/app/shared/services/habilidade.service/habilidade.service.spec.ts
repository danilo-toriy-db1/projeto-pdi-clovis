import { TestBed } from '@angular/core/testing';
import { TipoHabilidade } from '../../models/enums/tipo-habilidade.enum';
import { HabilidadeService } from './habilidade.service';

describe('HabilidadeService', () => {
  let servico: HabilidadeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(HabilidadeService);
  });

  it('deve listar apenas as habilidades associadas ao id informado', () => {
    servico.criar(1, {
      habilidade: 'JavaScript',
      tipo: TipoHabilidade.HARD,
      icone: 'javascript.svg',
    });
    servico.criar(2, {
      habilidade: 'Comunicação',
      tipo: TipoHabilidade.SOFT,
      icone: 'comunicacao.svg',
    });

    expect(servico.listarPorId(1)).toEqual([
      {
        id: 1,
        habilidade: {
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: 'javascript.svg',
        },
      },
    ]);
    expect(servico.listarPorId(2)).toHaveLength(1);
  });

  it('deve usar o ícone placeholder quando nenhum ícone for informado', () => {
    servico.criar(1, { habilidade: 'Trabalho em equipe', tipo: TipoHabilidade.SOFT, icone: '' });

    expect(servico.listarPorId(1)[0].habilidade.icone).toBe('placeholder.svg');
  });

  it('deve atualizar apenas a habilidade no índice informado, dentre as do mesmo id', () => {
    servico.criar(1, {
      habilidade: 'JavaScript',
      tipo: TipoHabilidade.HARD,
      icone: 'javascript.svg',
    });
    servico.criar(1, { habilidade: 'CSS', tipo: TipoHabilidade.HARD, icone: 'css.svg' });

    servico.atualizar(1, 1, {
      habilidade: 'CSS Avançado',
      tipo: TipoHabilidade.HARD,
      icone: 'css.svg',
    });

    const habilidades = servico.listarPorId(1);
    expect(habilidades[0].habilidade.habilidade).toBe('JavaScript');
    expect(habilidades[1].habilidade.habilidade).toBe('CSS Avançado');
  });

  it('deve remover apenas a habilidade no índice informado, dentre as do mesmo id', () => {
    servico.criar(1, {
      habilidade: 'JavaScript',
      tipo: TipoHabilidade.HARD,
      icone: 'javascript.svg',
    });
    servico.criar(1, { habilidade: 'CSS', tipo: TipoHabilidade.HARD, icone: 'css.svg' });

    servico.remover(1, 0);

    const habilidades = servico.listarPorId(1);
    expect(habilidades).toHaveLength(1);
    expect(habilidades[0].habilidade.habilidade).toBe('CSS');
  });

  it('deve listar os ícones disponíveis para seleção, incluindo o placeholder', () => {
    expect(servico.listarIconesDisponiveis()).toContain('placeholder.svg');
  });

  it('deve remover todas as habilidades de um id, sem afetar as de outros ids', () => {
    servico.criar(1, {
      habilidade: 'JavaScript',
      tipo: TipoHabilidade.HARD,
      icone: 'javascript.svg',
    });
    servico.criar(2, {
      habilidade: 'Comunicação',
      tipo: TipoHabilidade.SOFT,
      icone: 'comunicacao.svg',
    });

    servico.removerPorId(1);

    expect(servico.listarPorId(1)).toEqual([]);
    expect(servico.listarPorId(2)).toHaveLength(1);
  });
});
