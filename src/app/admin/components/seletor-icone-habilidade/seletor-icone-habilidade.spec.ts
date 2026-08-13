import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { SeletorIconeHabilidade } from './seletor-icone-habilidade';

describe('SeletorIconeHabilidade', () => {
  let fixture: ComponentFixture<SeletorIconeHabilidade>;
  let componente: SeletorIconeHabilidade;
  let primeiroIcone: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SeletorIconeHabilidade] });
    fixture = TestBed.createComponent(SeletorIconeHabilidade);
    componente = fixture.componentInstance;
    primeiroIcone = TestBed.inject(HabilidadeService).listarIconesDisponiveis()[0];
    fixture.detectChanges();
  });

  function opcoes(): NodeListOf<HTMLButtonElement> {
    return fixture.nativeElement.querySelectorAll('.seletor-icone-habilidade__opcao');
  }

  it('deve listar uma opção para cada ícone disponível no serviço', () => {
    const disponiveis = TestBed.inject(HabilidadeService).listarIconesDisponiveis();
    expect(opcoes()).toHaveLength(disponiveis.length);
  });

  it('deve emitir selecionar com o nome do arquivo do ícone escolhido', () => {
    const spy = jest.fn();
    componente.selecionar.subscribe(spy);

    opcoes()[0].click();

    expect(spy).toHaveBeenCalledWith(primeiroIcone);
  });

  it('deve marcar como selecionado (aria-pressed) o ícone informado via input', () => {
    fixture.componentRef.setInput('iconeSelecionado', primeiroIcone);
    fixture.detectChanges();

    expect(opcoes()[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('deve emitir fechar ao clicar no botão de fechar', () => {
    const spy = jest.fn();
    componente.fechar.subscribe(spy);

    fixture.nativeElement.querySelector('.seletor-icone-habilidade__fechar').click();

    expect(spy).toHaveBeenCalled();
  });

  it('não deve ter violações de acessibilidade', async () => {
    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
