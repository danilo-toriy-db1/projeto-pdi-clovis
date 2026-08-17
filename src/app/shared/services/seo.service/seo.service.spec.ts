import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let servico: SeoService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servico = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  it('deve definir o título da página com o sufixo do site', () => {
    servico.atualizar({ titulo: 'Habilidades de Fulano', descricao: 'desc' });

    expect(title.getTitle()).toBe('Habilidades de Fulano | My Landing Page');
  });

  it('deve atualizar a meta description, og e twitter com o texto informado', () => {
    servico.atualizar({ titulo: 'Fulano', descricao: 'Perfil de Fulano, desenvolvedor.' });

    expect(meta.getTag('name="description"')?.content).toBe('Perfil de Fulano, desenvolvedor.');
    expect(meta.getTag('property="og:title"')?.content).toBe('Fulano | My Landing Page');
    expect(meta.getTag('property="og:description"')?.content).toBe(
      'Perfil de Fulano, desenvolvedor.',
    );
    expect(meta.getTag('name="twitter:title"')?.content).toBe('Fulano | My Landing Page');
  });

  it('deve marcar robots como index, follow por padrão', () => {
    servico.atualizar({ titulo: 'Fulano', descricao: 'desc' });

    expect(meta.getTag('name="robots"')?.content).toBe('index, follow');
  });

  it('deve marcar robots como noindex, nofollow quando semIndexacao for true', () => {
    servico.atualizar({ titulo: 'Login', descricao: 'desc', semIndexacao: true });

    expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });
});
