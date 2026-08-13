import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { axe } from 'jest-axe';
import { AboutModel } from '../../../shared/models/interfaces/about.model';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { SobreMim } from './sobre-mim';

function dadosDeTeste(sobrescritas: Partial<AboutModel> = {}): AboutModel {
  return {
    nome: 'Fulano',
    idade: 30,
    carreira: 'TI',
    profissao: 'Desenvolvedor',
    empresa: 'DB1',
    imagem: '',
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
  function configurar(id: number): ComponentFixture<SobreMim> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SobreMim],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { paramMap: convertToParamMap({ id: String(id) }) } } },
        },
      ],
    });

    const fixture = TestBed.createComponent(SobreMim);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('deve exibir nome, idade, carreira, profissão, empresa e a descrição da entrada', () => {
    const servico = TestBed.inject(PessoaService);
    const entrada = servico.criarNova(dadosDeTeste());

    const fixture = configurar(entrada.id);
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
    const servico = TestBed.inject(PessoaService);
    const entrada = servico.criarNova(dadosDeTeste({ imagem: '' }));

    const fixture = configurar(entrada.id);
    const imagem: HTMLImageElement = fixture.nativeElement.querySelector('.sobre-mim__imagem');

    expect(imagem.src).toContain('/logo.svg');
  });

  it('a foto de perfil deve ter um alt descritivo com o nome da pessoa, e efetivamente renderizar (src resolvido)', () => {
    const servico = TestBed.inject(PessoaService);
    const entrada = servico.criarNova(dadosDeTeste({ nome: 'Danilo' }));

    const fixture = configurar(entrada.id);
    const imagem: HTMLImageElement = fixture.nativeElement.querySelector('.sobre-mim__imagem');

    expect(imagem.alt).toBe('Foto de perfil de Danilo');
    expect(imagem.getAttribute('src')).toBeTruthy();
  });

  it('não deve ter violações de acessibilidade na página com a foto de perfil renderizada', async () => {
    const servico = TestBed.inject(PessoaService);
    const entrada = servico.criarNova(dadosDeTeste());

    const fixture = configurar(entrada.id);
    const resultados = await axe(fixture.nativeElement);

    expect(resultados).toHaveNoViolations();
  });
});
