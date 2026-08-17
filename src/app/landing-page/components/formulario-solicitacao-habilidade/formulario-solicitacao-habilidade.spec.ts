import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { TipoSolicitacaoHabilidade } from '../../../shared/models/enums/tipo-solicitacao-habilidade.enum';
import { FormularioSolicitacaoHabilidade } from './formulario-solicitacao-habilidade';

describe('FormularioSolicitacaoHabilidade', () => {
  let fixture: ComponentFixture<FormularioSolicitacaoHabilidade>;
  let componente: FormularioSolicitacaoHabilidade;

  function configurar(tipoSolicitacao: TipoSolicitacaoHabilidade): void {
    TestBed.configureTestingModule({ imports: [FormularioSolicitacaoHabilidade] });
    fixture = TestBed.createComponent(FormularioSolicitacaoHabilidade);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('tipoSolicitacao', tipoSolicitacao);
    fixture.detectChanges();
  }

  describe('modo adicionar', () => {
    beforeEach(() => configurar(TipoSolicitacaoHabilidade.ADICIONAR));

    it('deve exibir os campos de nome e tipo, sem o seletor de habilidade existente', () => {
      expect(fixture.nativeElement.querySelector('#solicitacao-habilidade-nome')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#solicitacao-habilidade-tipo')).not.toBeNull();
      expect(
        fixture.nativeElement.querySelector('#solicitacao-habilidade-existente'),
      ).toBeNull();
    });

    it('não deve emitir nem enviar quando o nome estiver vazio, focando o campo', () => {
      const spy = jest.fn();
      componente.enviar.subscribe(spy);

      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(
        fixture.nativeElement.querySelector('#solicitacao-habilidade-nome'),
      );
      expect(fixture.nativeElement.textContent).toContain(
        'Nome da habilidade é um campo obrigatório.',
      );
    });

    it('deve emitir enviar com o nome e o tipo informados', () => {
      const spy = jest.fn();
      componente.enviar.subscribe(spy);

      const campoNome: HTMLInputElement = fixture.nativeElement.querySelector(
        '#solicitacao-habilidade-nome',
      );
      campoNome.value = 'Comunicação';
      campoNome.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      expect(spy).toHaveBeenCalledWith({
        habilidade: 'Comunicação',
        tipo: TipoHabilidade.SOFT,
      });
    });

    it('deve emitir cancelar ao clicar em Cancelar', () => {
      const spy = jest.fn();
      componente.cancelar.subscribe(spy);

      fixture.nativeElement.querySelector('button[type="button"]').click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('modo remover', () => {
    beforeEach(() => {
      configurar(TipoSolicitacaoHabilidade.REMOVER);
      fixture.componentRef.setInput('habilidadesExistentes', [
        { id: 1, habilidade: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, icone: '' } },
        { id: 1, habilidade: { habilidade: 'Comunicação', tipo: TipoHabilidade.SOFT, icone: '' } },
      ]);
      fixture.detectChanges();
    });

    it('deve exibir o seletor de habilidades existentes, sem os campos de nome/tipo livres', () => {
      expect(
        fixture.nativeElement.querySelector('#solicitacao-habilidade-existente'),
      ).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#solicitacao-habilidade-nome')).toBeNull();

      const opcoes: HTMLOptionElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('#solicitacao-habilidade-existente option'),
      );
      expect(opcoes.map((opcao) => opcao.textContent?.trim())).toEqual([
        'Selecione uma habilidade',
        'JavaScript (hard-skill)',
        'Comunicação (soft-skill)',
      ]);
    });

    it('deve emitir enviar com a habilidade e o tipo da opção selecionada', () => {
      const spy = jest.fn();
      componente.enviar.subscribe(spy);

      const select: HTMLSelectElement = fixture.nativeElement.querySelector(
        '#solicitacao-habilidade-existente',
      );
      select.value = '1';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      expect(spy).toHaveBeenCalledWith({
        habilidade: 'Comunicação',
        tipo: TipoHabilidade.SOFT,
      });
    });

    it('não deve emitir enquanto nenhuma habilidade for selecionada', () => {
      const spy = jest.fn();
      componente.enviar.subscribe(spy);

      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
