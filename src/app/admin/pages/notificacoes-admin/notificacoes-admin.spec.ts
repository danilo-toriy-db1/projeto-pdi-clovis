import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { CategoriaNotificacao } from '../../../shared/models/enums/categoria-notificacao.enum';
import { StatusNotificacao } from '../../../shared/models/enums/status-notificacao.enum';
import { NotificacaoService } from '../../../shared/services/notificacao.service/notificacao.service';
import { NotificacoesAdmin } from './notificacoes-admin';

describe('NotificacoesAdmin', () => {
  let fixture: ComponentFixture<NotificacoesAdmin>;
  let notificacaoService: NotificacaoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [NotificacoesAdmin] });
    notificacaoService = TestBed.inject(NotificacaoService);
  });

  function criarComponente(): void {
    fixture = TestBed.createComponent(NotificacoesAdmin);
    fixture.detectChanges();
  }

  function secao(titulo: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('.notificacoes-admin__secao')).find(
      (elemento) => (elemento as HTMLElement).querySelector('h2')?.textContent === titulo,
    ) as HTMLElement;
  }

  function cardsDe(titulo: string): HTMLElement[] {
    return Array.from(secao(titulo).querySelectorAll('.notificacoes-admin__card'));
  }

  it('deve exibir uma mensagem em cada seção quando não há notificações cadastradas', () => {
    criarComponente();

    expect(secao('Notificações do sistema').querySelector('.notificacoes-admin__vazio')).not.toBeNull();
    expect(secao('Notificações de log').querySelector('.notificacoes-admin__vazio')).not.toBeNull();
  });

  it('deve separar as notificações do sistema das notificações de log em seções distintas', () => {
    notificacaoService.criar({
      categoria: CategoriaNotificacao.SISTEMA,
      status: StatusNotificacao.PENDENTE,
      usuarioOrigem: 'user',
      usuarioDestino: 'admin',
      vista: true,
      notificacao: { titulo: 'Sugestão A', descricao: 'desc A' },
    });
    notificacaoService.criar({
      categoria: CategoriaNotificacao.LOG,
      status: null,
      usuarioOrigem: 'novo-usuario',
      usuarioDestino: null,
      vista: true,
      notificacao: { titulo: 'Novo usuário cadastrado', descricao: 'desc B' },
    });
    criarComponente();

    expect(cardsDe('Notificações do sistema')).toHaveLength(1);
    expect(cardsDe('Notificações do sistema')[0].textContent).toContain('Sugestão A');
    expect(cardsDe('Notificações de log')).toHaveLength(1);
    expect(cardsDe('Notificações de log')[0].textContent).toContain('Novo usuário cadastrado');
  });

  it('deve exibir o rótulo de status e a origem/destino apenas nas notificações do sistema', () => {
    notificacaoService.criar({
      categoria: CategoriaNotificacao.SISTEMA,
      status: StatusNotificacao.APROVADA,
      usuarioOrigem: 'user',
      usuarioDestino: 'admin',
      vista: true,
      notificacao: { titulo: 'Sugestão A', descricao: 'desc A' },
    });
    notificacaoService.criar({
      categoria: CategoriaNotificacao.LOG,
      status: null,
      usuarioOrigem: 'novo-usuario',
      usuarioDestino: null,
      vista: true,
      notificacao: { titulo: 'Log qualquer', descricao: 'desc B' },
    });
    criarComponente();

    const cardSistema = cardsDe('Notificações do sistema')[0];
    expect(cardSistema.querySelector('.notificacoes-admin__status')?.textContent?.trim()).toBe(
      'Aprovada',
    );
    expect(cardSistema.textContent).toContain('user → admin');

    const cardLog = cardsDe('Notificações de log')[0];
    expect(cardLog.querySelector('.notificacoes-admin__status')).toBeNull();
    expect(cardLog.textContent).toContain('Usuário: novo-usuario');
  });

  it('deve destacar visualmente apenas as notificações que estavam não vistas ao abrir a página', () => {
    notificacaoService.criar({
      categoria: CategoriaNotificacao.LOG,
      status: null,
      usuarioOrigem: 'ja-visto',
      usuarioDestino: null,
      vista: true,
      notificacao: { titulo: 'Antigo', descricao: 'desc' },
    });
    notificacaoService.criar({
      categoria: CategoriaNotificacao.LOG,
      status: null,
      usuarioOrigem: 'novo',
      usuarioDestino: null,
      vista: false,
      notificacao: { titulo: 'Recente', descricao: 'desc' },
    });
    criarComponente();

    const cards = cardsDe('Notificações de log');
    const antigo = cards.find((card) => card.textContent?.includes('Antigo'))!;
    const recente = cards.find((card) => card.textContent?.includes('Recente'))!;

    expect(antigo.classList.contains('notificacoes-admin__card--novo')).toBe(false);
    expect(recente.classList.contains('notificacoes-admin__card--novo')).toBe(true);
  });

  it('deve marcar todas as notificações como vistas ao abrir a página, zerando a contagem de não vistas', () => {
    notificacaoService.criar({
      categoria: CategoriaNotificacao.LOG,
      status: null,
      usuarioOrigem: 'novo',
      usuarioDestino: null,
      vista: false,
      notificacao: { titulo: 'Recente', descricao: 'desc' },
    });

    expect(notificacaoService.contarNaoVistas()).toBe(1);
    criarComponente();

    expect(notificacaoService.contarNaoVistas()).toBe(0);
  });

  it('não deve ter violações de acessibilidade com as notificações renderizadas', async () => {
    notificacaoService.criar({
      categoria: CategoriaNotificacao.SISTEMA,
      status: StatusNotificacao.PENDENTE,
      usuarioOrigem: 'user',
      usuarioDestino: 'admin',
      vista: false,
      notificacao: { titulo: 'Sugestão A', descricao: 'desc A' },
    });
    criarComponente();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
