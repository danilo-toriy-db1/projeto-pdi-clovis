import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContatoESobre } from './contato-e-sobre';

describe('ContatoESobre', () => {
  let fixture: ComponentFixture<ContatoESobre>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ContatoESobre] });
    fixture = TestBed.createComponent(ContatoESobre);
    fixture.detectChanges();
  });

  it('deve exibir o conteúdo estático da página, sem depender de nenhum dado dinâmico', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Contato e Sobre');
    expect(fixture.nativeElement.querySelector('p').textContent?.length).toBeGreaterThan(0);
  });
});
