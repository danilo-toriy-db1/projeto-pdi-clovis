import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { ErroCampo } from './erro-campo';

describe('ErroCampo', () => {
  let fixture: ComponentFixture<ErroCampo>;

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [ErroCampo] });
    fixture = TestBed.createComponent(ErroCampo);
    fixture.componentRef.setInput('rotulo', 'Nome');
    fixture.detectChanges();
  }

  function mensagem(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.erro-campo');
  }

  it('não deve exibir nenhuma mensagem quando mostrar for false (padrão)', () => {
    criarComponente();

    expect(mensagem()).toBeNull();
  });

  it('deve exibir "{rotulo} é um campo obrigatório." quando mostrar for true', () => {
    criarComponente();
    fixture.componentRef.setInput('mostrar', true);
    fixture.detectChanges();

    expect(mensagem()?.textContent?.trim()).toBe('Nome é um campo obrigatório.');
  });

  it('deve anunciar a mensagem com role="alert"', () => {
    criarComponente();
    fixture.componentRef.setInput('mostrar', true);
    fixture.detectChanges();

    expect(mensagem()?.getAttribute('role')).toBe('alert');
  });

  it('deve atualizar o rótulo exibido quando o input rotulo muda', () => {
    criarComponente();
    fixture.componentRef.setInput('mostrar', true);
    fixture.componentRef.setInput('rotulo', 'Idade');
    fixture.detectChanges();

    expect(mensagem()?.textContent?.trim()).toBe('Idade é um campo obrigatório.');
  });

  it('não deve ter violações de acessibilidade', async () => {
    criarComponente();
    fixture.componentRef.setInput('mostrar', true);
    fixture.detectChanges();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
