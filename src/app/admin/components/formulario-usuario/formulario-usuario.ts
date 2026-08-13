import { Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../../shared/models/enums/role.enum';
import { NovoUsuario } from '../../../shared/models/interfaces/novo-usuario.interface';
import { Usuario } from '../../../shared/models/interfaces/usuario.interface';

@Component({
  selector: 'app-formulario-usuario',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-usuario.html',
  styleUrl: './formulario-usuario.scss',
})
export class FormularioUsuario {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campoUsuario = viewChild<ElementRef<HTMLInputElement>>('campoUsuario');

  readonly usuarioInicial = input<Usuario | null>(null);
  readonly rolesDisponiveis = input.required<Role[]>();
  readonly erro = input<string | null>(null);
  readonly salvar = output<NovoUsuario>();
  readonly cancelar = output<void>();

  protected readonly tentouSubmeter = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    usuario: ['', Validators.required],
    senha: ['', Validators.required],
    role: [Role.USER, Validators.required],
  });

  constructor() {
    effect(() => {
      const inicial = this.usuarioInicial();
      this.tentouSubmeter.set(false);

      if (inicial) {
        this.formulario.setValue({ usuario: inicial.usuario, senha: '', role: inicial.role });
        this.formulario.controls.usuario.disable();
      } else {
        this.formulario.controls.usuario.enable();
        this.formulario.reset({ usuario: '', senha: '', role: Role.USER });
      }
    });
  }

  protected enviar(): void {
    this.tentouSubmeter.set(true);

    if (this.formulario.invalid) {
      this.campoUsuario()?.nativeElement.focus();
      return;
    }

    this.salvar.emit(this.formulario.getRawValue());
  }

  protected aoCancelar(): void {
    this.cancelar.emit();
  }
}
