import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { EditModal, EditModalFeedback } from './edit-modal';

@Component({
  imports: [EditModal],
  template: `
    <app-edit-modal
      [titulo]="'Editar habilidade'"
      [feedback]="feedback()"
      [largo]="largo()"
      (fechar)="fechado = true"
    >
      <p>Conteúdo de teste</p>
    </app-edit-modal>
  `,
})
class HospedeiraTeste {
  readonly feedback = input<EditModalFeedback | null>(null);
  readonly largo = input(false);
  fechado = false;
}

describe('EditModal', () => {
  let fixture: ComponentFixture<HospedeiraTeste>;

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [HospedeiraTeste] });
    fixture = TestBed.createComponent(HospedeiraTeste);
    fixture.detectChanges();
  }

  function botaoFechar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.edit-modal__fechar');
  }

  it('deve exibir o título recebido e o conteúdo projetado', () => {
    criarComponente();

    expect(fixture.nativeElement.querySelector('#edit-modal-titulo').textContent).toContain(
      'Editar habilidade',
    );
    expect(fixture.nativeElement.querySelector('p').textContent).toBe('Conteúdo de teste');
  });

  it('deve emitir fechar ao clicar no botão de fechar', () => {
    criarComponente();

    botaoFechar().click();
    fixture.detectChanges();

    expect(fixture.componentInstance.fechado).toBe(true);
  });

  it('deve devolver o foco ao elemento que abriu o modal quando fechado', () => {
    const botaoAbridor = document.createElement('button');
    document.body.appendChild(botaoAbridor);
    botaoAbridor.focus();

    criarComponente();
    botaoFechar().click();

    expect(document.activeElement).toBe(botaoAbridor);
    botaoAbridor.remove();
  });

  it('não deve ter violações de acessibilidade', async () => {
    criarComponente();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });

  it('não deve aplicar a variante larga por padrão', () => {
    criarComponente();

    expect(fixture.nativeElement.querySelector('.edit-modal--largo')).toBeNull();
  });

  it('deve aplicar a variante larga quando largo for true', () => {
    criarComponente();
    fixture.componentRef.setInput('largo', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.edit-modal--largo')).not.toBeNull();
  });

  describe('estado de feedback (carregando/sucesso)', () => {
    it('deve exibir o app-feedback-modal e ocultar o conteúdo projetado e o botão de fechar durante o carregamento', () => {
      criarComponente();
      fixture.componentRef.setInput('feedback', { estado: 'carregando' });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-feedback-modal')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Conteúdo de teste');
      expect(botaoFechar()).toBeNull();
    });

    it('deve repassar a mensagem de feedback ao app-feedback-modal', () => {
      criarComponente();
      fixture.componentRef.setInput('feedback', { estado: 'sucesso', mensagem: 'Salvo!' });
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Salvo!');
    });

    it('deve voltar a exibir o conteúdo projetado e o botão de fechar quando o feedback é removido', () => {
      criarComponente();
      fixture.componentRef.setInput('feedback', { estado: 'carregando' });
      fixture.detectChanges();

      fixture.componentRef.setInput('feedback', null);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('p')).not.toBeNull();
      expect(botaoFechar()).not.toBeNull();
    });

    it('não deve ter violações de acessibilidade com o feedback de carregando visível', async () => {
      criarComponente();
      fixture.componentRef.setInput('feedback', { estado: 'carregando' });
      fixture.detectChanges();

      const resultados = await axe(fixture.nativeElement);
      expect(resultados).toHaveNoViolations();
    });
  });
});
