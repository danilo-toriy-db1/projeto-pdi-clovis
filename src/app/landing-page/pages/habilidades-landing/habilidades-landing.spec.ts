import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Role } from '../../../shared/models/enums/role.enum';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { SolicitacaoHabilidadeService } from '../../../shared/services/solicitacao-habilidade.service/solicitacao-habilidade.service';
import { autenticarComo } from '../../../shared/testing/autenticar-como';
import { HabilidadesLanding } from './habilidades-landing';

describe('HabilidadesLanding', () => {
  function configurar(id: number): ComponentFixture<HabilidadesLanding> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HabilidadesLanding] });

    const fixture = TestBed.createComponent(HabilidadesLanding);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve ramificar as habilidades SOFT para a esquerda e HARD para a direita, exibindo o ícone de cada uma', () => {
    const habilidadeService = TestBed.inject(HabilidadeService);
    habilidadeService.criar(0, { habilidade: 'Comunicação', tipo: TipoHabilidade.SOFT, icone: 'comunicacao.svg' });
    habilidadeService.criar(0, { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, icone: 'javascript.svg' });

    const fixture = configurar(0);

    const cartoesSoft: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.habilidades-landing__ramo--soft .habilidades-landing__cartao'),
    );
    const cartoesHard: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.habilidades-landing__ramo--hard .habilidades-landing__cartao'),
    );

    expect(cartoesSoft).toHaveLength(1);
    expect(cartoesSoft[0].textContent).toContain('Comunicação');
    expect((cartoesSoft[0].querySelector('img') as HTMLImageElement).src).toContain(
      '/icons/skills/comunicacao.svg',
    );

    expect(cartoesHard).toHaveLength(1);
    expect(cartoesHard[0].textContent).toContain('JavaScript');
    expect((cartoesHard[0].querySelector('img') as HTMLImageElement).src).toContain(
      '/icons/skills/javascript.svg',
    );
  });

  it('os ícones de cada habilidade e dos botões de ação devem ser decorativos (alt vazio) e renderizar um src resolvido', () => {
    const habilidadeService = TestBed.inject(HabilidadeService);
    habilidadeService.criar(0, {
      habilidade: 'Comunicação',
      tipo: TipoHabilidade.SOFT,
      icone: 'comunicacao.svg',
    });

    const fixture = configurar(0);

    const iconeHabilidade: HTMLImageElement = fixture.nativeElement.querySelector(
      '.habilidades-landing__cartao img',
    );
    const iconeAdicionar: HTMLImageElement = fixture.nativeElement.querySelector(
      '.habilidades-landing__botao-adicionar img',
    );
    const iconeRemover: HTMLImageElement = fixture.nativeElement.querySelector(
      '.habilidades-landing__botao-remover img',
    );

    for (const icone of [iconeHabilidade, iconeAdicionar, iconeRemover]) {
      expect(icone.getAttribute('alt')).toBe('');
      expect(icone.getAttribute('src')).toBeTruthy();
    }
  });

  it('não deve ter violações de acessibilidade com habilidades soft e hard renderizadas', async () => {
    const habilidadeService = TestBed.inject(HabilidadeService);
    habilidadeService.criar(0, { habilidade: 'Comunicação', tipo: TipoHabilidade.SOFT, icone: '' });
    habilidadeService.criar(0, { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, icone: '' });

    jest.useRealTimers();
    const fixture = configurar(0);
    const resultados = await axe(fixture.nativeElement);

    expect(resultados).toHaveNoViolations();
  });

  it('deve desabilitar o botão de remover quando não há nenhuma habilidade cadastrada', () => {
    const fixture = configurar(0);

    const remover: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.habilidades-landing__botao-remover',
    );

    expect(remover.disabled).toBe(true);
  });

  describe('sem sessão ativa', () => {
    it('deve bloquear a solicitação e exibir o aviso de login ao clicar em Adicionar habilidade', () => {
      const fixture = configurar(0);

      fixture.nativeElement.querySelector('.habilidades-landing__botao-adicionar').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-alert-modal')).not.toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Você deve estar logado para isso!');
    });

    it('deve fechar o aviso de login ao clicar em Entendi', () => {
      const fixture = configurar(0);

      fixture.nativeElement.querySelector('.habilidades-landing__botao-adicionar').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.alert-modal__confirmar').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('Você deve estar logado para isso!');
    });
  });

  describe('com sessão ativa', () => {
    beforeEach(() => {
      autenticarComo('visitante', Role.USER);
    });

    it('deve abrir o modal de solicitação com Reactive Forms ao clicar em Adicionar habilidade', () => {
      const fixture = configurar(7);

      fixture.nativeElement.querySelector('.habilidades-landing__botao-adicionar').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#solicitacao-habilidade-nome')).not.toBeNull();
    });

    it('deve registrar a solicitação de adição vinculada ao admin dono da landing page e ao usuário solicitante', async () => {
      TestBed.inject(PessoaService).resolverEntradaAdmin('admin-dono');
      const idPessoa = TestBed.inject(PessoaService).listarTodas()[0].id;
      const fixture = configurar(idPessoa);

      fixture.nativeElement.querySelector('.habilidades-landing__botao-adicionar').click();
      fixture.detectChanges();

      const campoNome: HTMLInputElement = fixture.nativeElement.querySelector(
        '#solicitacao-habilidade-nome',
      );
      campoNome.value = 'Comunicação';
      campoNome.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.nativeElement
        .querySelector('.formulario-solicitacao-habilidade__acoes button[type="submit"]')
        .click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-feedback-modal')).not.toBeNull();

      await jest.advanceTimersByTimeAsync(500);
      fixture.detectChanges();

      const solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
      const [solicitacao] = solicitacaoService.listarPendentesParaAdmin('admin-dono');
      expect(solicitacao.idPessoa).toBe(idPessoa);
      expect(solicitacao.solicitacao.habilidade).toBe('Comunicação');
      expect(solicitacao.solicitacao.usuarioSolicitante).toBe('visitante');

      await jest.advanceTimersByTimeAsync(1000);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
    });

    it('não deve permitir que outro admin, diferente do dono da landing page, veja a solicitação', async () => {
      TestBed.inject(PessoaService).resolverEntradaAdmin('admin-dono');
      const idPessoa = TestBed.inject(PessoaService).listarTodas()[0].id;
      const fixture = configurar(idPessoa);

      fixture.nativeElement.querySelector('.habilidades-landing__botao-adicionar').click();
      fixture.detectChanges();
      fixture.nativeElement.querySelector('#solicitacao-habilidade-nome').value = 'Comunicação';
      fixture.nativeElement
        .querySelector('#solicitacao-habilidade-nome')
        .dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.nativeElement
        .querySelector('.formulario-solicitacao-habilidade__acoes button[type="submit"]')
        .click();
      await jest.advanceTimersByTimeAsync(500);

      const solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
      expect(solicitacaoService.listarPendentesParaAdmin('outro-admin')).toEqual([]);
    });
  });

  describe('sessão admin visitando a landing page de outro admin', () => {
    beforeEach(() => {
      autenticarComo('admin-visitante', Role.ADMIN);
    });

    it('deve ter os mesmos direitos de um usuário comum: abrir e enviar uma solicitação de habilidade', async () => {
      TestBed.inject(PessoaService).resolverEntradaAdmin('admin-dono');
      const idPessoa = TestBed.inject(PessoaService).listarTodas()[0].id;
      const fixture = configurar(idPessoa);

      fixture.nativeElement.querySelector('.habilidades-landing__botao-adicionar').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();

      const campoNome: HTMLInputElement = fixture.nativeElement.querySelector(
        '#solicitacao-habilidade-nome',
      );
      campoNome.value = 'Liderança';
      campoNome.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.nativeElement
        .querySelector('.formulario-solicitacao-habilidade__acoes button[type="submit"]')
        .click();
      await jest.advanceTimersByTimeAsync(500);
      fixture.detectChanges();

      const solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
      const [solicitacao] = solicitacaoService.listarPendentesParaAdmin('admin-dono');
      expect(solicitacao.solicitacao.habilidade).toBe('Liderança');
      expect(solicitacao.solicitacao.usuarioSolicitante).toBe('admin-visitante');
    });
  });
});
