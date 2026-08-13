import { Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { HabilitiesModel } from '../../../shared/models/interfaces/habilities.model';
import { ICONE_PLACEHOLDER } from '../../../shared/services/habilidade.service/habilidade.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { SeletorIconeHabilidade } from '../seletor-icone-habilidade/seletor-icone-habilidade';

@Component({
  selector: 'app-formulario-habilidade',
  imports: [NgOptimizedImage, ReactiveFormsModule, SeletorIconeHabilidade],
  templateUrl: './formulario-habilidade.html',
  styleUrl: './formulario-habilidade.scss',
})
export class FormularioHabilidade {
  private readonly themeService = inject(ThemeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly campoHabilidade = viewChild<ElementRef<HTMLInputElement>>('campoHabilidade');

  readonly habilidadeInicial = input<HabilitiesModel | null>(null);
  readonly salvar = output<HabilitiesModel>();
  readonly cancelar = output<void>();

  protected readonly TipoHabilidade = TipoHabilidade;
  protected readonly ICONE_PLACEHOLDER = ICONE_PLACEHOLDER;
  protected readonly temaEscuro = this.themeService.temaEscuro;
  protected readonly tentouSubmeter = signal(false);
  protected readonly seletorIconeAberto = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    habilidade: ['', Validators.required],
    tipo: [TipoHabilidade.SOFT, Validators.required],
    icone: [''],
  });

  constructor() {
    effect(() => {
      const inicial = this.habilidadeInicial();
      this.tentouSubmeter.set(false);

      if (inicial) {
        this.formulario.setValue({
          habilidade: inicial.habilidade,
          tipo: inicial.tipo,
          icone: inicial.icone,
        });
      } else {
        this.formulario.reset({ habilidade: '', tipo: TipoHabilidade.SOFT, icone: '' });
      }
    });
  }

  protected enviar(): void {
    this.tentouSubmeter.set(true);

    if (this.formulario.invalid) {
      this.campoHabilidade()?.nativeElement.focus();
      return;
    }

    this.salvar.emit(this.formulario.getRawValue());

    if (!this.habilidadeInicial()) {
      this.formulario.reset({ habilidade: '', tipo: TipoHabilidade.SOFT, icone: '' });
      this.tentouSubmeter.set(false);
    }
  }

  protected aoCancelar(): void {
    this.cancelar.emit();
  }

  protected abrirSeletorIcone(): void {
    this.seletorIconeAberto.set(true);
  }

  protected fecharSeletorIcone(): void {
    this.seletorIconeAberto.set(false);
  }

  protected selecionarIcone(icone: string): void {
    this.formulario.controls.icone.setValue(icone);
    this.seletorIconeAberto.set(false);
  }
}
