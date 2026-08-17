import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SUFIXO_TITULO = 'My Landing Page';

export interface DadosSeo {
  titulo: string;
  descricao: string;
  semIndexacao?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  atualizar(dados: DadosSeo): void {
    const tituloCompleto = `${dados.titulo} | ${SUFIXO_TITULO}`;

    this.title.setTitle(tituloCompleto);
    this.meta.updateTag({ name: 'description', content: dados.descricao });
    this.meta.updateTag({
      name: 'robots',
      content: dados.semIndexacao ? 'noindex, nofollow' : 'index, follow',
    });
    this.meta.updateTag({ property: 'og:title', content: tituloCompleto });
    this.meta.updateTag({ property: 'og:description', content: dados.descricao });
    this.meta.updateTag({ name: 'twitter:title', content: tituloCompleto });
    this.meta.updateTag({ name: 'twitter:description', content: dados.descricao });
  }
}
