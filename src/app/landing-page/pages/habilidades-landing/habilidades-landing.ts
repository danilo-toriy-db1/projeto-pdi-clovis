import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly habilidadeService = inject(HabilidadeService);
  private readonly themeService = inject(ThemeService);
  protected readonly temaEscuro = this.themeService.temaEscuro;

  private readonly todasHabilidades: ArrayHabilitiesModel[] = this.resolverHabilidades();

  protected readonly habilidadesSoft = this.todasHabilidades.filter(
    (entrada) => entrada.habilidade.tipo === TipoHabilidade.SOFT,
  );

  protected readonly habilidadesHard = this.todasHabilidades.filter(
    (entrada) => entrada.habilidade.tipo === TipoHabilidade.HARD,
  );

  private resolverHabilidades(): ArrayHabilitiesModel[] {
    const idParam = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    return this.habilidadeService.listarPorId(Number(idParam));
  }
}
