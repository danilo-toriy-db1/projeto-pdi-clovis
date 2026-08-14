import { Component, computed, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { ArrayHabilitiesModel } from '../../../shared/models/interfaces/habilities.model';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';

@Component({
  selector: 'app-habilidades-landing',
  imports: [NgOptimizedImage],
  templateUrl: './habilidades-landing.html',
  styleUrl: './habilidades-landing.scss',
})
export class HabilidadesLanding {
  private readonly habilidadeService = inject(HabilidadeService);
  private readonly themeService = inject(ThemeService);
  protected readonly tipoSoft = TipoHabilidade.SOFT;
  protected readonly temaEscuro = this.themeService.temaEscuro;

  readonly id = input.required<number>();

  private readonly todasHabilidades = computed<ArrayHabilitiesModel[]>(() =>
    this.habilidadeService.listarPorId(this.id()),
  );

  protected readonly habilidadesTrilha = computed(() => this.todasHabilidades());
}
