import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { FormularioHabilidade } from './formulario-habilidade';

describe('FormularioHabilidade', () => {
  let fixture: ComponentFixture<FormularioHabilidade>;
  let componente: FormularioHabilidade;
  let primeiroIcone: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FormularioHabilidade] });
    fixture = TestBed.createComponent(FormularioHabilidade);
    componente = fixture.componentInstance;
    primeiroIcone = TestBed.inject(HabilidadeService).listarIconesDisponiveis()[0];
    fixture.detectChanges();
  });

  function campoNome(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#habilidade-nome');
  }

  function botaoEnviar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  function abrirSeletorEEscolherPrimeiroIcone(): void {
    fixture.nativeElement.querySelector('.formulario-habilidade__seletor-icone').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.seletor-icone-habilidade__opcao').click();
    fixture.detectChanges();
  }

  it('deve emitir salvar com nome, tipo e o ícone escolhido no seletor', () => {
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    campoNome().value = 'JavaScript';
    campoNome().dispatchEvent(new Event('input'));
    abrirSeletorEEscolherPrimeiroIcone();

    botaoEnviar().click();

    expect(spy).toHaveBeenCalledWith({
      habilidade: 'JavaScript',
      tipo: TipoHabilidade.SOFT,
      icone: primeiroIcone,
    });
  });

  it('deve abrir e fechar o seletor de ícone ao clicar no botão de escolher e no de fechar', () => {
    expect(fixture.nativeElement.querySelector('app-seletor-icone-habilidade')).toBeNull();

    fixture.nativeElement.querySelector('.formulario-habilidade__seletor-icone').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-seletor-icone-habilidade')).not.toBeNull();

    fixture.nativeElement.querySelector('.seletor-icone-habilidade__fechar').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-seletor-icone-habilidade')).toBeNull();
  });

  it('deve emitir salvar com ícone vazio quando nenhum for informado, deixando o fallback ao service', () => {
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    campoNome().value = 'Comunicação';
    campoNome().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    botaoEnviar().click();

    expect(spy).toHaveBeenCalledWith({
      habilidade: 'Comunicação',
      tipo: TipoHabilidade.SOFT,
      icone: '',
    });
  });

  it('não deve emitir salvar e deve focar o campo nome quando ele estiver vazio', () => {
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    botaoEnviar().click();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(campoNome());
    expect(campoNome().classList.contains('campo-invalido')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      'Nome da habilidade é um campo obrigatório.',
    );
  });

  it('deve pré-preencher o formulário quando uma habilidade inicial é informada, para edição', () => {
    fixture.componentRef.setInput('habilidadeInicial', {
      habilidade: 'CSS',
      tipo: TipoHabilidade.HARD,
      icone: 'css.svg',
    });
    fixture.detectChanges();

    expect(campoNome().value).toBe('CSS');
    expect(botaoEnviar().textContent?.trim()).toBe('Salvar habilidade');
  });

  it('deve exibir o ícone de adicionar (decorativo) quando não há habilidade inicial, e o de editar quando há', () => {
    expect(botaoEnviar().querySelector('img')!.src).toContain('-add-icon.svg');

    fixture.componentRef.setInput('habilidadeInicial', {
      habilidade: 'CSS',
      tipo: TipoHabilidade.HARD,
      icone: 'css.svg',
    });
    fixture.detectChanges();

    const icone = botaoEnviar().querySelector('img')!;
    expect(icone.getAttribute('alt')).toBe('');
    expect(icone.src).toContain('/icons/edit-icon.svg');
  });

  it('não deve ter violações de acessibilidade no formulário de habilidade', async () => {
    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });

  it('não deve ter violações de acessibilidade com o seletor de ícone aberto', async () => {
    fixture.nativeElement.querySelector('.formulario-habilidade__seletor-icone').click();
    fixture.detectChanges();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
