import { Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulario-descricao-about',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-descricao-about.html',
  styleUrl: './formulario-descricao-about.scss',
})
export class FormularioDescricaoAbout {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campoValor = viewChild<ElementRef<HTMLTextAreaElement>>('campoValor');

  readonly rotulo = input.required<string>();
  readonly valorInicial = input('');
  readonly salvar = output<string>();
  readonly cancelar = output<void>();

  protected readonly tentouSubmeter = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    valor: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      this.formulario.controls.valor.setValue(this.valorInicial());
      this.tentouSubmeter.set(false);
    });
  }

  protected enviar(): void {
    this.tentouSubmeter.set(true);

    if (this.formulario.invalid) {
      this.campoValor()?.nativeElement.focus();
      return;
    }

    this.salvar.emit(this.formulario.controls.valor.value);
  }

  protected aoCancelar(): void {
    this.cancelar.emit();
  }

  protected resetar(): void {
    this.formulario.controls.valor.setValue('');
    this.tentouSubmeter.set(false);
    this.salvar.emit('');
  }
}
