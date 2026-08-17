import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { TipoSolicitacaoHabilidade } from '../../../shared/models/enums/tipo-solicitacao-habilidade.enum';
import { ArrayHabilitiesModel } from '../../../shared/models/interfaces/habilities.model';
import { ErroCampo } from '../../../shared/components/erro-campo/erro-campo';

export interface SolicitacaoHabilidadeFormValue {
  habilidade: string;
  tipo: TipoHabilidade;
}

@Component({
  selector: 'app-formulario-solicitacao-habilidade',
  imports: [ReactiveFormsModule, ErroCampo],
  templateUrl: './formulario-solicitacao-habilidade.html',
  styleUrl: './formulario-solicitacao-habilidade.scss',
})
export class FormularioSolicitacaoHabilidade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campoHabilidade = viewChild<ElementRef<HTMLInputElement>>('campoHabilidade');
  private readonly campoExistente = viewChild<ElementRef<HTMLSelectElement>>('campoExistente');

  readonly tipoSolicitacao = input.required<TipoSolicitacaoHabilidade>();
  readonly habilidadesExistentes = input<ArrayHabilitiesModel[]>([]);
  readonly enviar = output<SolicitacaoHabilidadeFormValue>();
  readonly cancelar = output<void>();

  protected readonly TipoHabilidade = TipoHabilidade;
  protected readonly modoRemocao = computed(
    () => this.tipoSolicitacao() === TipoSolicitacaoHabilidade.REMOVER,
  );
  protected readonly tentouSubmeter = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    habilidade: ['', Validators.required],
    tipo: [TipoHabilidade.SOFT, Validators.required],
  });

  protected selecionarExistente(evento: Event): void {
    const indice = Number((evento.target as HTMLSelectElement).value);
    const entrada = this.habilidadesExistentes()[indice];
    if (!entrada) {
      return;
    }

    this.formulario.setValue({
      habilidade: entrada.habilidade.habilidade,
      tipo: entrada.habilidade.tipo,
    });
  }

  protected enviarSolicitacao(): void {
    this.tentouSubmeter.set(true);

    if (this.formulario.invalid) {
      if (this.modoRemocao()) {
        this.campoExistente()?.nativeElement.focus();
      } else {
        this.campoHabilidade()?.nativeElement.focus();
      }
      return;
    }

    this.enviar.emit(this.formulario.getRawValue());
  }

  protected aoCancelar(): void {
    this.cancelar.emit();
  }
}
