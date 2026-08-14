import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { AboutModel } from '../../../shared/models/interfaces/about.model';
import { SobreMim } from './sobre-mim';

function dadosDeTeste(sobrescritas: Partial<AboutModel> = {}): AboutModel {
  return {
    nome: 'Fulano',
    idade: 30,
    carreira: 'TI',
    profissao: 'Desenvolvedor',
    empresa: 'DB1',
    imagem: '/logo.svg',
    descricao: {
      biografia: 'Minha biografia',
      hobbies: 'Meus hobbies',
      desgostos: 'Meus desgostos',
      objetivos: 'Meus objetivos',
    },
    ...sobrescritas,
  };
}

describe('SobreMim', () => {
  function configurar(dados: AboutModel): ComponentFixture<SobreMim> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [SobreMim] });

    const fixture = TestBed.createComponent(SobreMim);
    fixture.componentRef.setInput('dados', dados);
    fixture.detectChanges();
    return fixture;
  }

  it('deve exibir nome, idade, carreira, profissão, empresa e a descrição da entrada', () => {
    const fixture = configurar(dadosDeTeste());
    const texto = fixture.nativeElement.textContent as string;

    expect(texto).toContain('Fulano');
    expect(texto).toContain('30');
    expect(texto).toContain('TI');
    expect(texto).toContain('Desenvolvedor');
    expect(texto).toContain('DB1');
    expect(texto).toContain('Minha biografia');
    expect(texto).toContain('Meus hobbies');
    expect(texto).toContain('Meus desgostos');
    expect(texto).toContain('Meus objetivos');
  });

  it('deve exibir a logo do projeto quando a entrada não tem imagem própria', () => {
    const fixture = configurar(dadosDeTeste({ imagem: '/logo.svg' }));
    const imagem: HTMLImageElement = fixture.nativeElement.querySelector('.sobre-mim__imagem');

    expect(imagem.src).toContain('/logo.svg');
  });

  it('a foto de perfil deve ter um alt descritivo com o nome da pessoa, e efetivamente renderizar (src resolvido)', () => {
    const fixture = configurar(dadosDeTeste({ nome: 'Danilo' }));
    const imagem: HTMLImageElement = fixture.nativeElement.querySelector('.sobre-mim__imagem');

    expect(imagem.alt).toBe('Foto de perfil de Danilo');
    expect(imagem.getAttribute('src')).toBeTruthy();
  });

  it('não deve ter violações de acessibilidade na página com a foto de perfil renderizada', async () => {
    const fixture = configurar(dadosDeTeste());
    const resultados = await axe(fixture.nativeElement);

    expect(resultados).toHaveNoViolations();
  });
});
