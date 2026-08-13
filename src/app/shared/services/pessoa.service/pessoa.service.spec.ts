import { TestBed } from '@angular/core/testing';
import { TipoHabilidade } from '../../models/enums/tipo-habilidade.enum';
import { AboutModel } from '../../models/interfaces/about.model';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
import { PessoaService } from './pessoa.service';

function dadosDeTeste(sobrescritas: Partial<AboutModel> = {}): AboutModel {
  return {
    nome: 'Fulano',
    idade: 30,
    carreira: 'TI',
    profissao: 'Desenvolvedor',
    empresa: 'DB1',
    imagem: '',
    descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
    ...sobrescritas,
  };
}

describe('PessoaService', () => {
  let servico: PessoaService;
  let habilidadeService: HabilidadeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(PessoaService);
    habilidadeService = TestBed.inject(HabilidadeService);
  });

  describe('resolverEntradaAdmin', () => {
    it('deve criar uma nova entrada vazia com a logo do projeto na primeira vez que a sessão admin acessa', () => {
      const entrada = servico.resolverEntradaAdmin('admin');

      expect(entrada.dados.nome).toBe('');
      expect(entrada.dados.imagem).toBe('/logo.svg');
      expect(servico.listarTodas()).toHaveLength(1);
      expect(JSON.parse(localStorage.getItem('admin.vinculo-usuarios') ?? '{}')).toEqual({
        admin: entrada.id,
      });
    });

    it('deve devolver a mesma entrada em acessos seguintes da mesma sessão admin', () => {
      const primeiraChamada = servico.resolverEntradaAdmin('admin');
      servico.salvar(primeiraChamada.id, dadosDeTeste({ nome: 'Admin Um' }));

      const segundaChamada = servico.resolverEntradaAdmin('admin');

      expect(segundaChamada.id).toBe(primeiraChamada.id);
      expect(segundaChamada.dados.nome).toBe('Admin Um');
      expect(servico.listarTodas()).toHaveLength(1);
    });

    it('deve resolver entradas diferentes para sessões admin diferentes', () => {
      const entradaUm = servico.resolverEntradaAdmin('admin-1');
      const entradaDois = servico.resolverEntradaAdmin('admin-2');

      expect(entradaUm.id).not.toBe(entradaDois.id);
    });
  });

  describe('salvar', () => {
    it('deve atualizar os dados da entrada existente mantendo o id', () => {
      const entrada = servico.resolverEntradaAdmin('admin');

      servico.salvar(entrada.id, dadosDeTeste({ nome: 'Admin Editado' }));

      expect(servico.buscarPorId(entrada.id)?.dados.nome).toBe('Admin Editado');
    });

    it('deve usar a logo do projeto quando a imagem não for informada', () => {
      const entrada = servico.resolverEntradaAdmin('admin');

      servico.salvar(entrada.id, dadosDeTeste({ imagem: '' }));

      expect(servico.buscarPorId(entrada.id)?.dados.imagem).toBe('/logo.svg');
    });
  });

  describe('criarNova (sessão super)', () => {
    it('deve criar uma entrada com um id que nunca colide com um já existente', () => {
      servico.resolverEntradaAdmin('admin-1');
      servico.criarNova(dadosDeTeste({ nome: 'Pessoa Nova' }));

      const [primeira, segunda] = servico.listarTodas();

      expect(segunda.id).toBeGreaterThan(primeira.id);
    });

    it('deve listar todas as entradas, incluindo as criadas por sessões admin', () => {
      servico.resolverEntradaAdmin('admin-1');
      servico.criarNova(dadosDeTeste());

      expect(servico.listarTodas()).toHaveLength(2);
    });
  });

  describe('remover', () => {
    it('deve remover a entrada e todas as habilidades associadas ao mesmo id', () => {
      const entrada = servico.criarNova(dadosDeTeste());
      habilidadeService.criar(entrada.id, {
        habilidade: 'JavaScript',
        tipo: TipoHabilidade.HARD,
        icone: '',
      });

      servico.remover(entrada.id);

      expect(servico.buscarPorId(entrada.id)).toBeUndefined();
      expect(habilidadeService.listarPorId(entrada.id)).toEqual([]);
    });

    it('deve remover o vínculo usuario -> id quando a entrada vinculada é removida', () => {
      const entrada = servico.resolverEntradaAdmin('admin');

      servico.remover(entrada.id);

      expect(JSON.parse(localStorage.getItem('admin.vinculo-usuarios') ?? '{}')).toEqual({});
    });

    it('deve recriar uma entrada vazia se a sessão admin acessar novamente após a remoção pela sessão super', () => {
      const entrada = servico.resolverEntradaAdmin('admin');
      servico.remover(entrada.id);

      const novaEntrada = servico.resolverEntradaAdmin('admin');

      expect(novaEntrada.dados.nome).toBe('');
      expect(servico.listarTodas()).toHaveLength(1);
    });
  });
});
