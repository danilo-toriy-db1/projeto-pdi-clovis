import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AboutModel } from '../../../shared/models/interfaces/about.model';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';

@Component({
  selector: 'app-sobre-mim',
  imports: [],
  templateUrl: './sobre-mim.html',
  styleUrl: './sobre-mim.scss',
})
export class SobreMim {
  private readonly route = inject(ActivatedRoute);
  private readonly pessoaService = inject(PessoaService);

  protected readonly dados: AboutModel = this.resolverDados();

  private resolverDados(): AboutModel {
    const idParam = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    return this.pessoaService.buscarPorId(Number(idParam))!.dados;
  }
}
