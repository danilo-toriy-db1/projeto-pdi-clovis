import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErroCampo } from '../../../shared/components/erro-campo/erro-campo';

@Component({
  selector: 'app-formulario-mensagem-feedback',
  imports: [ReactiveFormsModule, ErroCampo],
  templateUrl: './formulario-mensagem-feedback.html',
  styleUrl: './formulario-mensagem-feedback.scss',
})
export class FormularioMensagemFeedback {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campoMensagem = viewChild<ElementRef<HTMLTextAreaElement>>('campoMensagem');

  readonly enviar = output<string>();
  readonly cancelar = output<void>();

  protected readonly tentouSubmeter = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    mensagem: ['', Validators.required],
  });

  protected aoEnviar(): void {
    this.tentouSubmeter.set(true);

    if (this.formulario.invalid) {
      this.campoMensagem()?.nativeElement.focus();
      return;
    }

    this.enviar.emit(this.formulario.controls.mensagem.value);
  }

  protected aoCancelar(): void {
    this.cancelar.emit();
  }
}
