import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header, PaginaHeader } from '../../../shared/components/header/header';

const PAGINAS_PAINEL: PaginaHeader[] = [
  { rotulo: 'Página Inicial', rota: '.' },
  { rotulo: 'Editar Dados', rota: 'editar-dados' },
  { rotulo: 'Editar Usuários', rota: 'editar-usuarios' },
];

@Component({
  selector: 'app-painel-admin',
  imports: [Header, RouterOutlet],
  templateUrl: './painel-admin.html',
  styleUrl: './painel-admin.scss',
})
export class PainelAdmin {
  protected readonly paginasPainel = PAGINAS_PAINEL;
}
