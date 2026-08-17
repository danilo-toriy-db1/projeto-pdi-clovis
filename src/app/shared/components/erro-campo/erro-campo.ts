import { Component, input } from '@angular/core';

@Component({
  selector: 'app-erro-campo',
  templateUrl: './erro-campo.html',
  styleUrl: './erro-campo.scss',
})
export class ErroCampo {
  readonly rotulo = input.required<string>();
  readonly mostrar = input(false);
}
