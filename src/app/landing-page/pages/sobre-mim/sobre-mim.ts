import { Component, input } from '@angular/core';
import { AboutModel } from '../../../shared/models/interfaces/about.model';

@Component({
  selector: 'app-sobre-mim',
  imports: [],
  templateUrl: './sobre-mim.html',
  styleUrl: './sobre-mim.scss',
})
export class SobreMim {
  readonly dados = input.required<AboutModel>();
}
