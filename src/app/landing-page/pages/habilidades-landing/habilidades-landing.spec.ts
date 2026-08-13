import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { axe } from 'jest-axe';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { HabilidadesLanding } from './habilidades-landing';

describe('HabilidadesLanding', () => {
  function configurar(id: number): ComponentFixture<HabilidadesLanding> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HabilidadesLanding],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { paramMap: convertToParamMap({ id: String(id) }) } } },
        },
      ],
    });

    const fixture = TestBed.createComponent(HabilidadesLanding);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
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

  it('deve exibir os botões de adicionar e remover habilidade sem nenhum manipulador associado', () => {
    const fixture = configurar(0);

    const adicionar: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.habilidades-landing__botao-adicionar',
    );
    const remover: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.habilidades-landing__botao-remover',
    );

    expect(adicionar).not.toBeNull();
    expect(remover).not.toBeNull();
    expect(adicionar.getAttribute('onclick')).toBeNull();
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

    const fixture = configurar(0);
    const resultados = await axe(fixture.nativeElement);

    expect(resultados).toHaveNoViolations();
  });
});
