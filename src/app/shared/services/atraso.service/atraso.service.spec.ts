import { TestBed } from '@angular/core/testing';
import { AtrasoService } from './atraso.service';

describe('AtrasoService', () => {
  let servico: AtrasoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servico = TestBed.inject(AtrasoService);
  });

  it('deve resolver somente após o tempo informado', () => {
    jest.useFakeTimers();
    const resolvido = jest.fn();

    servico.aguardar(500).then(resolvido);
    jest.advanceTimersByTime(499);
    expect(resolvido).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    return Promise.resolve().then(() => {
      expect(resolvido).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });
});
