import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Footer } from '../../../shared/components/footer/footer';
import { Header } from '../../../shared/components/header/header';
import { SeoService } from '../../../shared/services/seo.service/seo.service';
import { ErroCampo } from '../../../shared/components/erro-campo/erro-campo';

@Component({
  selector: 'app-url-invalida',
  imports: [ReactiveFormsModule, Header, Footer, ErroCampo],
  templateUrl: './url-invalida.html',
  styleUrl: './url-invalida.scss',
})
export class UrlInvalida {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly seoService = inject(SeoService);
  private readonly campoId = viewChild<ElementRef<HTMLInputElement>>('campoId');

  protected readonly tentouSubmeter = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    id: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
  });

  constructor() {
    this.seoService.atualizar({
      titulo: 'URL inválida',
      descricao: 'Informe o id de uma landing page para acessá-la.',
      semIndexacao: true,
    });
  }

  protected irParaId(): void {
    this.tentouSubmeter.set(true);

    if (this.formulario.invalid) {
      this.campoId()?.nativeElement.focus();
      return;
    }

    this.router.navigateByUrl(`/landing-page/${this.formulario.controls.id.value}`);
  }
}
