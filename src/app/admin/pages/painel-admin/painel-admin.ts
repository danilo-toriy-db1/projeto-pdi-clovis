import { Component, signal } from '@angular/core';
import { Footer } from '../../../shared/components/footer/footer';
import { Header, PaginaHeader } from '../../../shared/components/header/header';
import { EditarDados } from '../editar-dados/editar-dados';
import { EditarUsuarios } from '../editar-usuarios/editar-usuarios';
import { PaginaInicialAdmin } from '../pagina-inicial-admin/pagina-inicial-admin';

type VistaAdmin = 'inicio' | 'editar-dados' | 'editar-usuarios';

const VISTA_PADRAO: VistaAdmin = 'inicio';

const PAGINAS_PAINEL: PaginaHeader[] = [
  { id: VISTA_PADRAO, rotulo: 'Página Inicial' },
  { id: 'editar-dados', rotulo: 'Editar Dados' },
  { id: 'editar-usuarios', rotulo: 'Editar Usuários' },
];

@Component({
  selector: 'app-painel-admin',
  imports: [Header, Footer, PaginaInicialAdmin, EditarDados, EditarUsuarios],
  templateUrl: './painel-admin.html',
  styleUrl: './painel-admin.scss',
})
export class PainelAdmin {
  protected readonly paginasPainel = PAGINAS_PAINEL;
  protected readonly vistaAtual = signal<VistaAdmin>(this.resolverVistaInicial());

  protected selecionarVista(id: string): void {
    this.vistaAtual.set(this.paraVistaValida(id));
  }

  private resolverVistaInicial(): VistaAdmin {
    const estado = history.state as { vistaInicial?: string } | undefined;
    return this.paraVistaValida(estado?.vistaInicial ?? VISTA_PADRAO);
  }

  private paraVistaValida(id: string): VistaAdmin {
    return PAGINAS_PAINEL.some((pagina) => pagina.id === id) ? (id as VistaAdmin) : VISTA_PADRAO;
  }
}
