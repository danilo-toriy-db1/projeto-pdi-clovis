import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Role } from '../../../shared/models/enums/role.enum';
import { FormularioUsuario } from './formulario-usuario';

describe('FormularioUsuario', () => {
  let fixture: ComponentFixture<FormularioUsuario>;
  let componente: FormularioUsuario;

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [FormularioUsuario] });
    fixture = TestBed.createComponent(FormularioUsuario);
    fixture.componentRef.setInput('rolesDisponiveis', [Role.USER, Role.ADMIN]);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  function campoUsuario(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#usuario-login');
  }

  function campoSenha(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#usuario-senha');
  }

  function botaoEnviar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  it('deve emitir salvar com usuário, senha e role informados', () => {
    criarComponente();
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    campoUsuario().value = 'novo-usuario';
    campoUsuario().dispatchEvent(new Event('input'));
    campoSenha().value = 'Senha1';
    campoSenha().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    botaoEnviar().click();

    expect(spy).toHaveBeenCalledWith({
      usuario: 'novo-usuario',
      senha: 'Senha1',
      role: Role.USER,
    });
  });

  it('deve listar apenas as roles disponíveis informadas via input', () => {
    criarComponente();

    const rotulos = Array.from(
      fixture.nativeElement.querySelectorAll('fieldset label'),
    ).map((label) => (label as HTMLElement).textContent?.trim());
    expect(rotulos).toEqual([Role.USER, Role.ADMIN]);
  });

  it('não deve emitir salvar e deve focar o campo usuário quando o formulário estiver inválido', () => {
    criarComponente();
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    botaoEnviar().click();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(campoUsuario());
    expect(campoUsuario().classList.contains('campo-invalido')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Usuário é um campo obrigatório.');
    expect(fixture.nativeElement.textContent).toContain('Senha é um campo obrigatório.');
  });

  it('deve pré-preencher usuário e role, mas não a senha, e desabilitar o campo usuário ao editar', () => {
    criarComponente();

    fixture.componentRef.setInput('usuarioInicial', {
      usuario: 'existente',
      senha: 'hash-qualquer',
      role: Role.ADMIN,
    });
    fixture.detectChanges();

    expect(campoUsuario().value).toBe('existente');
    expect(campoUsuario().disabled).toBe(true);
    expect(campoSenha().value).toBe('');
    expect(botaoEnviar().textContent?.trim()).toBe('Salvar alterações');
  });

  it('deve emitir salvar com o usuário original (campo desabilitado) ao editar', () => {
    criarComponente();
    fixture.componentRef.setInput('usuarioInicial', {
      usuario: 'existente',
      senha: 'hash-qualquer',
      role: Role.ADMIN,
    });
    fixture.detectChanges();
    const spy = jest.fn();
    componente.salvar.subscribe(spy);

    campoSenha().value = 'NovaSenha1';
    campoSenha().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    botaoEnviar().click();

    expect(spy).toHaveBeenCalledWith({
      usuario: 'existente',
      senha: 'NovaSenha1',
      role: Role.ADMIN,
    });
  });

  it('deve exibir a mensagem de erro recebida via input', () => {
    criarComponente();
    fixture.componentRef.setInput('erro', 'Esse usuário já existe.');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Esse usuário já existe.',
    );
  });

  it('deve emitir cancelar ao clicar em cancelar', () => {
    criarComponente();
    const spy = jest.fn();
    componente.cancelar.subscribe(spy);

    fixture.nativeElement.querySelector('button[type="button"]').click();

    expect(spy).toHaveBeenCalled();
  });

  it('não deve ter violações de acessibilidade', async () => {
    criarComponente();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
