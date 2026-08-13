import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { FormularioDescricaoAbout } from './formulario-descricao-about';

describe('FormularioDescricaoAbout', () => {
  let fixture: ComponentFixture<FormularioDescricaoAbout>;
  let componente: FormularioDescricaoAbout;

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [FormularioDescricaoAbout] });
    fixture = TestBed.createComponent(FormularioDescricaoAbout);
    fixture.componentRef.setInput('rotulo', 'Biografia');
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  function campoValor(): HTMLTextAreaElement {
    return fixture.nativeElement.querySelector('#descricao-valor');
  }

  function botaoSalvar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  function botaoPorTexto(texto: string): HTMLButtonElement {
    const botoes: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button[type="button"]'),
    );
    return botoes.find((botao) => botao.textContent?.trim() === texto)!;
  }

  it('deve pré-preencher o campo com o valor inicial e usar o rótulo informado', () => {
    criarComponente();
    fixture.componentRef.setInput('valorInicial', 'Texto existente');
    fixture.detectChanges();

    expect(campoValor().value).toBe('Texto existente');
    expect(fixture.nativeElement.querySelector('label').textContent).toBe('Biografia');
  });

  it('deve emitir salvar com o valor digitado', () => {
    criarComponente();
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    campoValor().value = 'Novo texto';
    campoValor().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    botaoSalvar().click();

    expect(spy).toHaveBeenCalledWith('Novo texto');
  });

  it('não deve emitir salvar e deve focar o campo quando ele estiver vazio', () => {
    criarComponente();
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    botaoSalvar().click();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(campoValor());
  });

  it('deve emitir cancelar ao clicar em cancelar', () => {
    criarComponente();
    const spy = jest.fn();
    componente.cancelar.subscribe(spy);

    botaoPorTexto('Cancelar').click();

    expect(spy).toHaveBeenCalled();
  });

  it('deve emitir salvar com string vazia e limpar o campo ao clicar em resetar, mesmo com texto preenchido', () => {
    criarComponente();
    fixture.componentRef.setInput('valorInicial', 'Texto existente');
    fixture.detectChanges();
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    botaoPorTexto('Resetar').click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('');
    expect(campoValor().value).toBe('');
  });

  it('deve permitir resetar mesmo quando o campo está vazio e nunca foi submetido (não exige valor válido)', () => {
    criarComponente();
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    botaoPorTexto('Resetar').click();

    expect(spy).toHaveBeenCalledWith('');
  });

  it('não deve ter violações de acessibilidade', async () => {
    criarComponente();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
