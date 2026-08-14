import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Role } from '../../../shared/models/enums/role.enum';
import { PainelAdmin } from './painel-admin';

function autenticarComo(usuario: string, role: Role): void {
  localStorage.setItem('login.sessao', JSON.stringify({ usuario, role }));
}

describe('PainelAdmin', () => {
  let fixture: ComponentFixture<PainelAdmin>;

  beforeEach(() => {
    localStorage.clear();
    autenticarComo('admin', Role.ADMIN);
    TestBed.configureTestingModule({ imports: [PainelAdmin], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(PainelAdmin);
    fixture.detectChanges();
  });

  afterEach(() => {
    history.replaceState(null, '');
  });

  function linksDePaginas(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.header .header__pagina'));
  }

  it('deve exibir as 3 páginas navegáveis do painel no header', () => {
    expect(linksDePaginas().map((link) => link.textContent?.trim())).toEqual([
      'Página Inicial',
      'Editar Dados',
      'Editar Usuários',
    ]);
  });

  it('deve exibir a página inicial por padrão, sem montar as demais vistas', () => {
    expect(fixture.nativeElement.querySelector('app-pagina-inicial-admin')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-editar-dados')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-editar-usuarios')).toBeNull();
  });

  it('deve trocar para Editar Dados ao clicar no link do header, sem navegar de verdade (mesma URL)', () => {
    const link = linksDePaginas().find((elemento) => elemento.textContent?.trim() === 'Editar Dados')!;

    link.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-editar-dados')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-pagina-inicial-admin')).toBeNull();
  });

  it('deve trocar para Editar Usuários ao clicar no link do header', () => {
    const link = linksDePaginas().find(
      (elemento) => elemento.textContent?.trim() === 'Editar Usuários',
    )!;

    link.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-editar-usuarios')).not.toBeNull();
  });

  it('deve trocar para Editar Dados quando a página inicial emite irParaEditarDados', () => {
    const cartaoEditarDados: HTMLButtonElement = fixture.nativeElement.querySelectorAll(
      '.pagina-inicial-admin__card',
    )[2];

    cartaoEditarDados.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-editar-dados')).not.toBeNull();
  });

  it('deve iniciar direto na vista indicada por history.state.vistaInicial', () => {
    history.replaceState({ vistaInicial: 'editar-usuarios' }, '');

    const novaFixture = TestBed.createComponent(PainelAdmin);
    novaFixture.detectChanges();

    expect(novaFixture.nativeElement.querySelector('app-editar-usuarios')).not.toBeNull();
  });

  it('deve exibir o footer', () => {
    expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
  });
});
