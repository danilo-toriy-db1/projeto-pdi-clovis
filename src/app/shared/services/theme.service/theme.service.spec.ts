import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
  });

  function criarServico(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  it('deve iniciar no tema claro quando não há preferência salva', () => {
    const servico = criarServico();

    expect(servico.temaEscuro()).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  it('deve restaurar o tema escuro salvo em localStorage ao iniciar', () => {
    localStorage.setItem('tema-ativo', 'escuro');

    const servico = criarServico();

    expect(servico.temaEscuro()).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('deve alternar entre os temas claro e escuro, persistindo e aplicando a classe no documento', () => {
    const servico = criarServico();

    servico.alternarTema();

    expect(servico.temaEscuro()).toBe(true);
    expect(localStorage.getItem('tema-ativo')).toBe('escuro');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);

    servico.alternarTema();

    expect(servico.temaEscuro()).toBe(false);
    expect(localStorage.getItem('tema-ativo')).toBe('claro');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });
});
