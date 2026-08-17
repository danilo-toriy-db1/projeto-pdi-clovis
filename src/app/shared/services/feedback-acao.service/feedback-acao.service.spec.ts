import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EditModalFeedback } from '../../components/edit-modal/edit-modal';
import { FeedbackAcaoService } from './feedback-acao.service';

describe('FeedbackAcaoService', () => {
  let servico: FeedbackAcaoService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(FeedbackAcaoService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve exibir carregando durante o delay e sucesso em seguida, chamando aoSucesso ao expirar o delay de sucesso', async () => {
    const feedback = signal<EditModalFeedback | null>(null);
    const aoSucesso = jest.fn();
    const acao = jest.fn();

    const promessa = servico.executar(feedback, {
      delayCarregando: 500,
      acao,
      mensagemSucesso: 'Feito!',
      delaySucesso: 800,
      aoSucesso,
    });

    expect(feedback()).toEqual({ estado: 'carregando', mensagem: '' });
    expect(acao).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(500);
    const resultado = await promessa;

    expect(acao).toHaveBeenCalled();
    expect(feedback()).toEqual({ estado: 'sucesso', mensagem: 'Feito!' });
    expect(resultado).toBe(true);
    expect(aoSucesso).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(800);

    expect(feedback()).toBeNull();
    expect(aoSucesso).toHaveBeenCalled();
  });

  it('deve aguardar uma ação assíncrona antes de exibir sucesso', async () => {
    const feedback = signal<EditModalFeedback | null>(null);
    const acao = jest.fn().mockResolvedValue(undefined);

    const promessa = servico.executar(feedback, {
      delayCarregando: 100,
      acao,
      delaySucesso: 100,
    });

    await jest.advanceTimersByTimeAsync(100);
    await promessa;

    expect(feedback()).toEqual({ estado: 'sucesso', mensagem: '' });
  });

  it('deve limpar o feedback e chamar aoErro sem agendar sucesso quando a ação devolve sucesso: false', async () => {
    const feedback = signal<EditModalFeedback | null>(null);
    const aoSucesso = jest.fn();
    const aoErro = jest.fn();

    const promessa = servico.executar(feedback, {
      delayCarregando: 500,
      acao: () => ({ sucesso: false, mensagemErro: 'Deu ruim' }),
      delaySucesso: 800,
      aoSucesso,
      aoErro,
    });

    await jest.advanceTimersByTimeAsync(500);
    const resultado = await promessa;

    expect(resultado).toBe(false);
    expect(feedback()).toBeNull();
    expect(aoErro).toHaveBeenCalledWith('Deu ruim');
    expect(aoSucesso).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(800);
    expect(aoSucesso).not.toHaveBeenCalled();
  });
});
