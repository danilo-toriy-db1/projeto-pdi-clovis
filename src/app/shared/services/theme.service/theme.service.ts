import { Injectable, computed, signal } from '@angular/core';

const CHAVE_ARMAZENAMENTO = 'tema-ativo';
const VALOR_TEMA_ESCURO = 'escuro';
const CLASSE_TEMA_ESCURO = 'dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly temaEscuroSignal = signal<boolean>(this.lerPreferenciaSalva());
  readonly temaEscuro = this.temaEscuroSignal.asReadonly();
  readonly rotuloAlternancia = computed(() =>
    this.temaEscuroSignal() ? 'Alternar para o tema claro' : 'Alternar para o tema escuro',
  );

  constructor() {
    this.aplicarClasseNoDocumento(this.temaEscuroSignal());
  }

  alternarTema(): void {
    this.definirTemaEscuro(!this.temaEscuroSignal());
  }

  private definirTemaEscuro(ativo: boolean): void {
    this.temaEscuroSignal.set(ativo);
    localStorage.setItem(CHAVE_ARMAZENAMENTO, ativo ? VALOR_TEMA_ESCURO : 'claro');
    this.aplicarClasseNoDocumento(ativo);
  }

  private aplicarClasseNoDocumento(ativo: boolean): void {
    document.documentElement.classList.toggle(CLASSE_TEMA_ESCURO, ativo);
  }

  private lerPreferenciaSalva(): boolean {
    return localStorage.getItem(CHAVE_ARMAZENAMENTO) === VALOR_TEMA_ESCURO;
  }
}
