import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Footer } from '../../../shared/components/footer/footer';
import { Header } from '../../../shared/components/header/header';
import { Role } from '../../../shared/models/enums/role.enum';
import { ArrayAboutModel } from '../../../shared/models/interfaces/about.model';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import {
  LandingPageNaoEncontrada,
  MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA,
} from '../../components/landing-page-nao-encontrada/landing-page-nao-encontrada';

@Component({
  selector: 'app-landing-page-controle',
  imports: [Header, Footer, NgOptimizedImage, LandingPageNaoEncontrada],
  templateUrl: './landing-page-controle.html',
  styleUrl: './landing-page-controle.scss',
})
export class LandingPageControle {
  private readonly authService = inject(AuthService);
  private readonly pessoaService = inject(PessoaService);
  private readonly habilidadeService = inject(HabilidadeService);

  private readonly entradasOrdenadas: ArrayAboutModel[] = this.pessoaService
    .listarTodas()
    .sort((a, b) => a.id - b.id);

  protected readonly mensagemNaoEncontrada = MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA;
  protected readonly ehSuper = computed(() => this.authService.role() === Role.SUPER);

  protected readonly indiceAtual = signal(0);

  protected readonly entradaAtual = computed(() => this.entradasOrdenadas[this.indiceAtual()]);
  protected readonly entradaAnterior = computed(
    () => this.entradasOrdenadas[this.indiceAtual() - 1],
  );
  protected readonly entradaProxima = computed(
    () => this.entradasOrdenadas[this.indiceAtual() + 1],
  );

  protected readonly habilidadesAtuais = computed(() => {
    const entrada = this.entradaAtual();
    return entrada ? this.habilidadeService.listarPorId(entrada.id) : [];
  });

  protected readonly temEntradaAnterior = computed(() => this.indiceAtual() > 0);
  protected readonly temProximaEntrada = computed(
    () => this.indiceAtual() < this.entradasOrdenadas.length - 1,
  );

  protected readonly rotuloAnterior = computed(() => this.rotuloNavegacao(this.entradaAnterior()));
  protected readonly rotuloProximo = computed(() => this.rotuloNavegacao(this.entradaProxima()));

  protected voltar(): void {
    this.indiceAtual.update((indice) => Math.max(0, indice - 1));
  }

  protected avancar(): void {
    this.indiceAtual.update((indice) => Math.min(this.entradasOrdenadas.length - 1, indice + 1));
  }

  private rotuloNavegacao(entradaDestino: ArrayAboutModel | undefined): string {
    const atual = this.entradaAtual();
    if (!entradaDestino || !atual) {
      return 'Não há outra Landing Page nessa direção';
    }

    return `Ir da Landing Page de ${this.nomeOuId(atual)} para a de ${this.nomeOuId(entradaDestino)}`;
  }

  private nomeOuId(entrada: ArrayAboutModel): string {
    return entrada.dados.nome || `pessoa ${entrada.id}`;
  }
}
