import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PainelAdmin } from './painel-admin';

describe('PainelAdmin', () => {
  let fixture: ComponentFixture<PainelAdmin>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [PainelAdmin],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(PainelAdmin);
    fixture.detectChanges();
  });

  it('deve exibir as 3 páginas navegáveis do painel no header', () => {
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.header .header__pagina'),
    );

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Página Inicial',
      'Editar Dados',
      'Editar Usuários',
    ]);
  });

  it('deve renderizar o router-outlet para a página ativa', () => {
    expect(fixture.nativeElement.querySelector('router-outlet, main')).not.toBeNull();
  });
});
