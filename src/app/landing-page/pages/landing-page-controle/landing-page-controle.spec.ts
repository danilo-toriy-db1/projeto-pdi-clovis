import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IntentLogin } from '../../../shared/models/enums/intent-login.enum';
import { AboutModel } from '../../../shared/models/interfaces/about.model';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { LandingPageControle } from './landing-page-controle';

function dadosDeTeste(sobrescritas: Partial<AboutModel> = {}): AboutModel {
  return {
    nome: 'Fulano',
    idade: 30,
    carreira: 'TI',
    profissao: 'Desenvolvedor',
    empresa: 'DB1',
    imagem: '',
    descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
    ...sobrescritas,
  };
}

describe('LandingPageControle', () => {
  let fixture: ComponentFixture<LandingPageControle>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LandingPageControle],
      providers: [provideRouter([])],
    });
  });

  function criar(): ComponentFixture<LandingPageControle> {
    fixture = TestBed.createComponent(LandingPageControle);
    fixture.detectChanges();
    return fixture;
  }

  function botaoAnterior(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.landing-page-controle__paginacao button:first-child');
  }

  function botaoProximo(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.landing-page-controle__paginacao button:last-child');
  }

  it('sem sessão ativa, exibe a página de não encontrada sem revelar a listagem', () => {
    criar();

    expect(fixture.nativeElement.querySelector('.landing-page-nao-encontrada')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.landing-page-controle')).toBeNull();
  });

  it('sessão sem role super exibe a página de não encontrada', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('admin', '123@', IntentLogin.LOGIN);

    criar();

    expect(fixture.nativeElement.querySelector('.landing-page-nao-encontrada')).not.toBeNull();
  });

  it('sessão super vê a primeira entrada por ordem de id e o header sem páginas navegáveis', async () => {
    const pessoaService = TestBed.inject(PessoaService);
    pessoaService.criarNova(dadosDeTeste({ nome: 'Primeira' }));
    pessoaService.criarNova(dadosDeTeste({ nome: 'Segunda' }));

    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    criar();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Primeira');
    expect(fixture.nativeElement.querySelector('.header__paginas')).toBeNull();
    expect(botaoAnterior().disabled).toBe(true);
    expect(botaoProximo().disabled).toBe(false);
  });

  it('botão Próximo avança para a próxima entrada e Anterior retorna', async () => {
    const pessoaService = TestBed.inject(PessoaService);
    pessoaService.criarNova(dadosDeTeste({ nome: 'Primeira' }));
    pessoaService.criarNova(dadosDeTeste({ nome: 'Segunda' }));

    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    criar();
    botaoProximo().click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Segunda');
    expect(botaoProximo().disabled).toBe(true);
    expect(botaoAnterior().disabled).toBe(false);

    botaoAnterior().click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Primeira');
  });

  it('não avança além da última nem retrocede além da primeira entrada', async () => {
    const pessoaService = TestBed.inject(PessoaService);
    pessoaService.criarNova(dadosDeTeste({ nome: 'Única' }));

    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    criar();

    expect(botaoAnterior().disabled).toBe(true);
    expect(botaoProximo().disabled).toBe(true);

    botaoProximo().click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Única');
  });

  it('exibe mensagem de lista vazia sem os botões de paginação quando não há nenhuma entrada', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    criar();

    expect(fixture.nativeElement.querySelector('.landing-page-controle__vazio')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.landing-page-controle__paginacao')).toBeNull();
  });
});
