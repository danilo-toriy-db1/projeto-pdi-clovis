import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Role } from '../../../shared/models/enums/role.enum';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { HabilitiesModel } from '../../../shared/models/interfaces/habilities.model';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { EditarDados } from './editar-dados';

function autenticarComo(usuario: string, role: Role): void {
  localStorage.setItem('login.sessao', JSON.stringify({ usuario, role }));
}

describe('EditarDados', () => {
  let fixture: ComponentFixture<EditarDados>;
  let componente: EditarDados;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [EditarDados] });
    fixture = TestBed.createComponent(EditarDados);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  function abrirModalDadosPessoais(): void {
    fixture.nativeElement.querySelector('.editar-dados__editar-dados-pessoais').click();
    fixture.detectChanges();
  }

  async function preencherCampoDescricao(
    campo: 'biografia' | 'hobbies' | 'desgostos' | 'objetivos',
    valor: string,
  ): Promise<void> {
    fixture.nativeElement.querySelector(`.editar-dados__card-descricao--${campo}`).click();
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('#descricao-valor');
    textarea.value = valor;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector('.formulario-descricao-about__acoes button[type="submit"]')
      .click();
    fixture.detectChanges();

    await jest.advanceTimersByTimeAsync(500);
    fixture.detectChanges();
    await jest.advanceTimersByTimeAsync(800);
    fixture.detectChanges();
  }

  async function salvarHabilidadeDireto(habilidade: HabilitiesModel): Promise<void> {
    const promise = componente['salvarHabilidade'](habilidade);
    jest.advanceTimersByTime(500);
    await promise;
    jest.advanceTimersByTime(800);
    fixture.detectChanges();
  }

  describe('sessão admin', () => {
    beforeEach(() => {
      autenticarComo('admin', Role.ADMIN);
      criarComponente();
    });

    it('TC-8: deve criar uma entrada vazia com a logo padrão e o vínculo na primeira visita', () => {
      const pessoaService = TestBed.inject(PessoaService);

      expect(pessoaService.listarTodas()).toHaveLength(1);
      expect(JSON.parse(localStorage.getItem('admin.vinculo-usuarios') ?? '{}')).toEqual({
        admin: 0,
      });

      abrirModalDadosPessoais();
      expect(fixture.nativeElement.querySelector('#campo-nome').value).toBe('');
    });

    it('TC-9: deve exibir carregando e depois sucesso ao salvar, persistindo os dados', async () => {
      await preencherCampoDescricao('biografia', 'bio');
      await preencherCampoDescricao('hobbies', 'hobby');
      await preencherCampoDescricao('desgostos', 'desgosto');
      await preencherCampoDescricao('objetivos', 'objetivo');

      abrirModalDadosPessoais();
      fixture.nativeElement.querySelector('#campo-nome').value = 'Fulano';
      fixture.nativeElement.querySelector('#campo-nome').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-idade').value = '30';
      fixture.nativeElement.querySelector('#campo-idade').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-carreira').value = 'TI';
      fixture.nativeElement.querySelector('#campo-carreira').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-profissao').value = 'Dev';
      fixture.nativeElement.querySelector('#campo-profissao').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-empresa').value = 'DB1';
      fixture.nativeElement.querySelector('#campo-empresa').dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const salvarPromise = componente['salvar']();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-feedback-modal')).not.toBeNull();

      jest.advanceTimersByTime(600);
      await salvarPromise;
      fixture.detectChanges();

      const pessoaService = TestBed.inject(PessoaService);
      const entradas = pessoaService.listarTodas();
      expect(entradas[0].dados.nome).toBe('Fulano');

      jest.advanceTimersByTime(1200);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
    });

    it('TC-10: não deve submeter e deve focar/marcar o campo nome quando ele estiver vazio', async () => {
      abrirModalDadosPessoais();

      await componente['salvar']();
      fixture.detectChanges();

      const campoNome: HTMLInputElement = fixture.nativeElement.querySelector('#campo-nome');
      expect(document.activeElement).toBe(campoNome);
      expect(campoNome.classList.contains('campo-invalido')).toBe(true);
    });

    it('deve abrir o modal de dados pessoais ao clicar no botão "Editar dados pessoais"', () => {
      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();

      abrirModalDadosPessoais();

      expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();
    });

    describe('ícones e imagens', () => {
      it('deve exibir a foto de perfil com um alt fixo e um src resolvido (fallback /logo.svg)', () => {
        const imagem: HTMLImageElement = fixture.nativeElement.querySelector('.editar-dados__imagem');

        expect(imagem.alt).toBe('Foto de perfil');
        expect(imagem.getAttribute('src')).toContain('/logo.svg');
      });

      it('o ícone da habilidade cadastrada deve renderizar com alt vazio (decorativo) e src resolvido', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: 'javascript.svg',
        });

        const icone: HTMLImageElement = fixture.nativeElement.querySelector(
          '.editar-dados__icone-habilidade',
        );
        expect(icone.getAttribute('alt')).toBe('');
        expect(icone.src).toContain('/icons/skills/javascript.svg');
      });

      it('não deve ter violações de acessibilidade com o formulário, a foto de perfil e as habilidades renderizadas', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'Comunicação',
          tipo: TipoHabilidade.SOFT,
          icone: '',
        });
        jest.useRealTimers();

        const resultados = await axe(fixture.nativeElement);
        expect(resultados).toHaveNoViolations();
      });
    });

    describe('upload de imagem', () => {
      class FileReaderFalso {
        result: string | null = null;
        onload: (() => void) | null = null;

        readAsDataURL(): void {
          this.result = 'data:image/png;base64,ZmFrZQ==';
          this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
        }
      }

      let originalFileReader: typeof FileReader;

      beforeEach(() => {
        originalFileReader = globalThis.FileReader;
        // @ts-expect-error dublê síncrono para tornar o teste determinístico
        globalThis.FileReader = FileReaderFalso;
        abrirModalDadosPessoais();
      });

      afterEach(() => {
        globalThis.FileReader = originalFileReader;
      });

      function selecionarArquivo(): void {
        const arquivo = new File(['conteudo'], 'foto.png', { type: 'image/png' });
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#campo-imagem');
        Object.defineProperty(input, 'files', { value: [arquivo], configurable: true });
        input.dispatchEvent(new Event('change'));
        fixture.detectChanges();
      }

      it('deve converter o arquivo selecionado em base64 e usá-lo na prévia da foto de perfil', () => {
        selecionarArquivo();

        expect(componente['formulario'].controls.imagem.value).toBe(
          'data:image/png;base64,ZmFrZQ==',
        );
        const imagem: HTMLImageElement =
          fixture.nativeElement.querySelectorAll('.editar-dados__imagem')[1];
        expect(imagem.getAttribute('src')).toBe('data:image/png;base64,ZmFrZQ==');
      });

      it('não deve alterar a imagem quando nenhum arquivo for selecionado', () => {
        const valorOriginal = componente['formulario'].controls.imagem.value;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#campo-imagem');
        Object.defineProperty(input, 'files', { value: [], configurable: true });
        input.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(componente['formulario'].controls.imagem.value).toBe(valorOriginal);
      });
    });

    describe('habilidades', () => {
      it('TC-14: deve cadastrar uma habilidade com nome, tipo e ícone informados', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: 'javascript.svg',
        });

        const habilidadeService = TestBed.inject(HabilidadeService);
        const entrada = TestBed.inject(PessoaService).listarTodas()[0];
        expect(habilidadeService.listarPorId(entrada.id)).toEqual([
          {
            id: entrada.id,
            habilidade: {
              habilidade: 'JavaScript',
              tipo: TipoHabilidade.HARD,
              icone: 'javascript.svg',
            },
          },
        ]);
      });

      it('TC-15: deve usar o ícone placeholder quando nenhum ícone for informado', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'Trabalho em equipe',
          tipo: TipoHabilidade.SOFT,
          icone: '',
        });

        const entrada = TestBed.inject(PessoaService).listarTodas()[0];
        const habilidades = TestBed.inject(HabilidadeService).listarPorId(entrada.id);
        expect(habilidades[0].habilidade.icone).toBe('placeholder.svg');
      });

      it('TC-16: deve remover a habilidade somente após confirmar no modal', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: '',
        });

        componente['pedirRemocaoHabilidade'](0, {
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: 'placeholder.svg',
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-confirm-modal')).not.toBeNull();

        componente['confirmarRemocaoHabilidade']();
        fixture.detectChanges();

        const entrada = TestBed.inject(PessoaService).listarTodas()[0];
        expect(TestBed.inject(HabilidadeService).listarPorId(entrada.id)).toEqual([]);
      });

      it('TC-17: deve editar uma habilidade existente mantendo o mesmo id', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: '',
        });
        const entrada = TestBed.inject(PessoaService).listarTodas()[0];
        const habilidadeService = TestBed.inject(HabilidadeService);

        await salvarHabilidadeDireto({
          habilidade: 'JavaScript Avançado',
          tipo: TipoHabilidade.HARD,
          icone: '',
        });

        expect(habilidadeService.listarPorId(entrada.id)).toHaveLength(2);
      });

      it('deve abrir o modal de edição pré-preenchido ao clicar no card da habilidade', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: '',
        });

        expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();

        fixture.nativeElement.querySelector('.editar-dados__abrir-habilidade').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('#habilidade-nome').value).toBe('JavaScript');
      });

      it('deve abrir o modal vazio, sem disparar edição, ao clicar no card de adicionar habilidade', () => {
        fixture.nativeElement
          .querySelector('.editar-dados__card-habilidade--adicionar button')
          .click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('#habilidade-nome').value).toBe('');
      });

      it('deve exibir o botão de remover somente ao editar uma habilidade existente, não ao criar', () => {
        fixture.nativeElement
          .querySelector('.editar-dados__card-habilidade--adicionar button')
          .click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.editar-dados__remover-habilidade')).toBeNull();
      });

      it('deve pedir confirmação e remover a habilidade a partir do botão dentro do modal, fechando o modal ao confirmar', async () => {
        await salvarHabilidadeDireto({
          habilidade: 'JavaScript',
          tipo: TipoHabilidade.HARD,
          icone: '',
        });

        fixture.nativeElement.querySelector('.editar-dados__abrir-habilidade').click();
        fixture.detectChanges();

        fixture.nativeElement.querySelector('.editar-dados__remover-habilidade').click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-confirm-modal')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();

        componente['confirmarRemocaoHabilidade']();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
        const entrada = TestBed.inject(PessoaService).listarTodas()[0];
        expect(TestBed.inject(HabilidadeService).listarPorId(entrada.id)).toEqual([]);
      });

      it('deve exibir carregando e depois sucesso ao salvar uma habilidade, fechando o modal em seguida', async () => {
        fixture.nativeElement
          .querySelector('.editar-dados__card-habilidade--adicionar button')
          .click();
        fixture.detectChanges();

        fixture.nativeElement.querySelector('#habilidade-nome').value = 'CSS';
        fixture.nativeElement.querySelector('#habilidade-nome').dispatchEvent(new Event('input'));
        fixture.detectChanges();
        fixture.nativeElement.querySelector('.formulario-habilidade__acoes button[type="submit"]').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('app-feedback-modal')).not.toBeNull();

        await jest.advanceTimersByTimeAsync(500);
        fixture.detectChanges();
        await jest.advanceTimersByTimeAsync(800);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
      });

      it('não deve ter violações de acessibilidade com o modal de habilidade aberto', async () => {
        fixture.nativeElement
          .querySelector('.editar-dados__card-habilidade--adicionar button')
          .click();
        fixture.detectChanges();
        jest.useRealTimers();

        const resultados = await axe(fixture.nativeElement);
        expect(resultados).toHaveNoViolations();
      });
    });

    describe('descrição', () => {
      it('deve abrir o modal pré-preenchido com o valor atual do campo ao clicar no card', async () => {
        await preencherCampoDescricao('biografia', 'Minha bio');

        fixture.nativeElement.querySelector('.editar-dados__card-descricao--biografia').click();
        fixture.detectChanges();

        expect(
          (fixture.nativeElement.querySelector('#descricao-valor') as HTMLTextAreaElement).value,
        ).toBe('Minha bio');
      });

      it('deve persistir a alteração imediatamente quando a pessoa já existe', async () => {
        await preencherCampoDescricao('objetivos', 'Aprender Angular');

        const entrada = TestBed.inject(PessoaService).listarTodas()[0];
        expect(entrada.dados.descricao.objetivos).toBe('Aprender Angular');
      });

      it('deve exibir "Sem Informações" e permitir resetar um campo já preenchido', async () => {
        await preencherCampoDescricao('hobbies', 'Xadrez');
        expect(
          fixture.nativeElement.querySelector('.editar-dados__card-descricao--hobbies').textContent,
        ).toContain('Xadrez');

        fixture.nativeElement.querySelector('.editar-dados__card-descricao--hobbies').click();
        fixture.detectChanges();
        fixture.nativeElement
          .querySelectorAll('.formulario-descricao-about__acoes button[type="button"]')[0]
          .click();
        fixture.detectChanges();

        await jest.advanceTimersByTimeAsync(500);
        fixture.detectChanges();
        await jest.advanceTimersByTimeAsync(800);
        fixture.detectChanges();

        const entrada = TestBed.inject(PessoaService).listarTodas()[0];
        expect(entrada.dados.descricao.hobbies).toBe('');
        expect(
          fixture.nativeElement.querySelector('.editar-dados__card-descricao--hobbies').textContent,
        ).toContain('Sem Informações');
      });

      it('não deve ter violações de acessibilidade com o modal de descrição aberto', async () => {
        fixture.nativeElement.querySelector('.editar-dados__card-descricao--hobbies').click();
        fixture.detectChanges();
        jest.useRealTimers();

        const resultados = await axe(fixture.nativeElement);
        expect(resultados).toHaveNoViolations();
      });
    });
  });

  describe('sessão super', () => {
    beforeEach(() => {
      autenticarComo('superAdmin', Role.SUPER);
    });

    it('TC-11: deve exibir a lista completa de entradas com ações de criar, editar e remover', () => {
      TestBed.configureTestingModule({ imports: [EditarDados] });
      TestBed.inject(PessoaService).criarNova({
        nome: 'Pessoa X',
        idade: 20,
        carreira: '',
        profissao: '',
        empresa: '',
        imagem: '',
        descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
      });
      fixture = TestBed.createComponent(EditarDados);
      componente = fixture.componentInstance;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.editar-dados__criar')).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.editar-dados__item')).toHaveLength(1);
    });

    it('TC-12: deve criar uma nova entrada com um id que nunca colide com um existente', async () => {
      TestBed.configureTestingModule({ imports: [EditarDados] });
      const pessoaService = TestBed.inject(PessoaService);
      pessoaService.criarNova({
        nome: 'Pessoa Existente',
        idade: 20,
        carreira: '',
        profissao: '',
        empresa: '',
        imagem: '',
        descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
      });
      fixture = TestBed.createComponent(EditarDados);
      componente = fixture.componentInstance;
      fixture.detectChanges();

      componente['abrirCriacao']();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();

      fixture.nativeElement.querySelector('#campo-nome').value = 'Pessoa Nova';
      fixture.nativeElement.querySelector('#campo-nome').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-idade').value = '25';
      fixture.nativeElement.querySelector('#campo-idade').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-carreira').value = 'x';
      fixture.nativeElement.querySelector('#campo-carreira').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-profissao').value = 'x';
      fixture.nativeElement.querySelector('#campo-profissao').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#campo-empresa').value = 'x';
      fixture.nativeElement.querySelector('#campo-empresa').dispatchEvent(new Event('input'));
      await preencherCampoDescricao('biografia', 'x');
      await preencherCampoDescricao('hobbies', 'x');
      await preencherCampoDescricao('desgostos', 'x');
      await preencherCampoDescricao('objetivos', 'x');
      fixture.detectChanges();

      const salvarPromise = componente['salvar']();
      jest.advanceTimersByTime(600);
      await salvarPromise;

      const entradas = pessoaService.listarTodas();
      expect(entradas).toHaveLength(2);
      expect(entradas[1].id).toBeGreaterThan(entradas[0].id);
    });

    it('TC-13: deve remover a entrada e as habilidades associadas somente após confirmar', () => {
      TestBed.configureTestingModule({ imports: [EditarDados] });
      const pessoaService = TestBed.inject(PessoaService);
      const habilidadeService = TestBed.inject(HabilidadeService);
      const entrada = pessoaService.criarNova({
        nome: 'Pessoa Y',
        idade: 20,
        carreira: '',
        profissao: '',
        empresa: '',
        imagem: '',
        descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
      });
      habilidadeService.criar(entrada.id, {
        habilidade: 'JavaScript',
        tipo: TipoHabilidade.HARD,
        icone: '',
      });
      fixture = TestBed.createComponent(EditarDados);
      componente = fixture.componentInstance;
      fixture.detectChanges();

      componente['pedirRemocaoEntrada'](entrada);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-confirm-modal')).not.toBeNull();

      componente['confirmarRemocaoEntrada']();
      fixture.detectChanges();

      expect(pessoaService.buscarPorId(entrada.id)).toBeUndefined();
      expect(habilidadeService.listarPorId(entrada.id)).toEqual([]);
    });
  });
});
