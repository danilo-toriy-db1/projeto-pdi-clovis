import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Footer] });
    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('deve exibir a versão Beta na primeira linha', () => {
    expect(fixture.nativeElement.querySelector('.footer__versao').textContent).toContain('Beta');
  });

  it('deve exibir a mensagem de direitos reservados com o ano atual', () => {
    const anoAtual = new Date().getFullYear();
    expect(fixture.nativeElement.querySelector('.footer__direitos').textContent).toContain(
      `${anoAtual}`,
    );
    expect(fixture.nativeElement.querySelector('.footer__direitos').textContent).toContain(
      'Todos os direitos reservados',
    );
  });

  it('não deve ter violações de acessibilidade', async () => {
    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
