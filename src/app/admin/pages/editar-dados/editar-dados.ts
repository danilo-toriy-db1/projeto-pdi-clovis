import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditModal, EditModalFeedback } from '../../../shared/components/edit-modal/edit-modal';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { ErroCampo } from '../../../shared/components/erro-campo/erro-campo';
import { Role } from '../../../shared/models/enums/role.enum';
import {
  AboutModel,
  ArrayAboutModel,
  DescricaoAbout,
} from '../../../shared/models/interfaces/about.model';
import {
  ArrayHabilitiesModel,
  HabilitiesModel,
} from '../../../shared/models/interfaces/habilities.model';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { FeedbackAcaoService } from '../../../shared/services/feedback-acao.service/feedback-acao.service';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { FormularioDescricaoAbout } from '../../components/formulario-descricao-about/formulario-descricao-about';
import { FormularioHabilidade } from '../../components/formulario-habilidade/formulario-habilidade';

type Visualizacao = 'lista' | 'formulario';
type CampoDescricao = keyof DescricaoAbout;

const ROTULOS_DESCRICAO: Record<CampoDescricao, string> = {
  biografia: 'Biografia',
  hobbies: 'Hobbies',
  desgostos: 'Desgostos',
  objetivos: 'Objetivos',
};

const FORM_VAZIO = {
  nome: '',
  idade: 0,
  carreira: '',
  profissao: '',
  empresa: '',
  imagem: '',
  descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
};

interface HabilidadeSelecionada {
  indice: number;
  habilidade: HabilitiesModel;
}

const CAMPOS_DADOS_PESSOAIS = ['nome', 'idade', 'carreira', 'profissao', 'empresa'] as const;

@Component({
  selector: 'app-editar-dados',
  imports: [
    ReactiveFormsModule,
    NgOptimizedImage,
    NgTemplateOutlet,
    ConfirmModal,
    EditModal,
    ErroCampo,
    FormularioHabilidade,
    FormularioDescricaoAbout,
  ],
  templateUrl: './editar-dados.html',
  styleUrl: './editar-dados.scss',
})
export class EditarDados {
  private readonly authService = inject(AuthService);
  private readonly pessoaService = inject(PessoaService);
  private readonly habilidadeService = inject(HabilidadeService);
  private readonly themeService = inject(ThemeService);
  private readonly feedbackAcaoService = inject(FeedbackAcaoService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly campoNome = viewChild<ElementRef<HTMLInputElement>>('campoNome');

  protected readonly sessao = this.authService.sessao;
  protected readonly ehSuper = computed(() => this.authService.role() === Role.SUPER);
  protected readonly temaEscuro = this.themeService.temaEscuro;

  protected readonly pessoas = signal<ArrayAboutModel[]>([]);
  protected readonly visualizacao = signal<Visualizacao>('formulario');
  protected readonly pessoaEmEdicao = signal<ArrayAboutModel | null>(null);
  protected readonly versaoHabilidades = signal(0);
  protected readonly habilidadesAtuais = computed<ArrayHabilitiesModel[]>(() => {
    this.versaoHabilidades();
    const entrada = this.pessoaEmEdicao();
    return entrada ? this.habilidadeService.listarPorId(entrada.id) : [];
  });

  protected readonly entradaParaRemover = signal<ArrayAboutModel | null>(null);
  protected readonly habilidadeParaRemover = signal<HabilidadeSelecionada | null>(null);
  protected readonly habilidadeEmEdicao = signal<HabilidadeSelecionada | null>(null);
  protected readonly modalHabilidadeAberto = signal(false);
  protected readonly modalDadosPessoaisAberto = signal(false);
  protected readonly campoDescricaoEmEdicao = signal<CampoDescricao | null>(null);
  protected readonly rotulosDescricao = ROTULOS_DESCRICAO;

  protected readonly feedback = signal<EditModalFeedback | null>(null);
  protected readonly feedbackHabilidade = signal<EditModalFeedback | null>(null);
  protected readonly feedbackDescricao = signal<EditModalFeedback | null>(null);
  protected readonly tentouSubmeter = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    nome: ['', Validators.required],
    idade: [0, Validators.required],
    carreira: ['', Validators.required],
    profissao: ['', Validators.required],
    empresa: ['', Validators.required],
    imagem: [''],
    descricao: this.formBuilder.nonNullable.group({
      biografia: ['', Validators.required],
      hobbies: ['', Validators.required],
      desgostos: ['', Validators.required],
      objetivos: ['', Validators.required],
    }),
  });

  constructor() {
    if (this.ehSuper()) {
      this.visualizacao.set('lista');
      this.carregarPessoas();
    } else {
      const entrada = this.pessoaService.resolverEntradaAdmin(this.sessao()!.usuario);
      this.pessoaEmEdicao.set(entrada);
      this.preencherFormulario(entrada.dados);
    }
  }

  protected ehImagemPlaceholder(imagem: string): boolean {
    return !imagem || imagem === '/logo.svg';
  }

  protected aoSelecionarImagem(evento: Event): void {
    const arquivo = (evento.target as HTMLInputElement).files?.[0];
    if (!arquivo) {
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      this.formulario.controls.imagem.setValue(leitor.result as string);
    };
    leitor.readAsDataURL(arquivo);
  }

  protected abrirCriacao(): void {
    this.pessoaEmEdicao.set(null);
    this.formulario.reset(FORM_VAZIO);
    this.tentouSubmeter.set(false);
    this.visualizacao.set('formulario');
    this.modalDadosPessoaisAberto.set(true);
  }

  protected abrirEdicao(entrada: ArrayAboutModel): void {
    this.pessoaEmEdicao.set(entrada);
    this.preencherFormulario(entrada.dados);
    this.tentouSubmeter.set(false);
    this.visualizacao.set('formulario');
  }

  protected abrirEdicaoDadosPessoais(): void {
    this.tentouSubmeter.set(false);
    this.modalDadosPessoaisAberto.set(true);
  }

  protected cancelarEdicaoDadosPessoais(): void {
    const entradaAtual = this.pessoaEmEdicao();
    if (entradaAtual) {
      this.preencherFormulario(entradaAtual.dados);
    } else {
      this.formulario.reset(FORM_VAZIO);
    }

    this.tentouSubmeter.set(false);
    this.modalDadosPessoaisAberto.set(false);
  }

  protected voltarParaLista(): void {
    this.visualizacao.set('lista');
    this.pessoaEmEdicao.set(null);
    this.carregarPessoas();
  }

  protected pedirRemocaoEntrada(entrada: ArrayAboutModel): void {
    this.entradaParaRemover.set(entrada);
  }

  protected confirmarRemocaoEntrada(): void {
    const entrada = this.entradaParaRemover();
    if (!entrada) {
      return;
    }

    this.pessoaService.remover(entrada.id);
    this.entradaParaRemover.set(null);
    this.carregarPessoas();
  }

  protected cancelarRemocaoEntrada(): void {
    this.entradaParaRemover.set(null);
  }

  protected async salvar(): Promise<void> {
    this.tentouSubmeter.set(true);

    const dadosPessoaisInvalidos = CAMPOS_DADOS_PESSOAIS.some(
      (campo) => this.formulario.controls[campo].invalid,
    );
    if (dadosPessoaisInvalidos) {
      this.campoNome()?.nativeElement.focus();
      return;
    }

    const dados = this.formulario.getRawValue();

    await this.feedbackAcaoService.executar(this.feedback, {
      delayCarregando: 600,
      acao: () => {
        const entradaAtual = this.pessoaEmEdicao();
        if (entradaAtual) {
          this.pessoaService.salvar(entradaAtual.id, dados);
          this.pessoaEmEdicao.set(this.pessoaService.buscarPorId(entradaAtual.id) ?? null);
        } else {
          this.pessoaEmEdicao.set(this.pessoaService.criarNova(dados));
        }
      },
      delaySucesso: 1200,
      aoSucesso: () => this.modalDadosPessoaisAberto.set(false),
    });
  }

  protected abrirCriacaoHabilidade(): void {
    this.habilidadeEmEdicao.set(null);
    this.modalHabilidadeAberto.set(true);
  }

  protected abrirEdicaoHabilidade(indice: number, entrada: ArrayHabilitiesModel): void {
    this.habilidadeEmEdicao.set({ indice, habilidade: entrada.habilidade });
    this.modalHabilidadeAberto.set(true);
  }

  protected cancelarEdicaoHabilidade(): void {
    this.habilidadeEmEdicao.set(null);
    this.modalHabilidadeAberto.set(false);
  }

  protected async salvarHabilidade(habilidade: HabilitiesModel): Promise<void> {
    const idAtual = this.pessoaEmEdicao()!.id;
    const emEdicao = this.habilidadeEmEdicao();

    await this.feedbackAcaoService.executar(this.feedbackHabilidade, {
      delayCarregando: 500,
      acao: () => {
        if (emEdicao) {
          this.habilidadeService.atualizar(idAtual, emEdicao.indice, habilidade);
        } else {
          this.habilidadeService.criar(idAtual, habilidade);
        }

        this.versaoHabilidades.update((versao) => versao + 1);
      },
      delaySucesso: 800,
      aoSucesso: () => {
        this.habilidadeEmEdicao.set(null);
        this.modalHabilidadeAberto.set(false);
      },
    });
  }

  protected pedirRemocaoHabilidadeEmEdicao(): void {
    const emEdicao = this.habilidadeEmEdicao();
    if (!emEdicao) {
      return;
    }

    this.pedirRemocaoHabilidade(emEdicao.indice, emEdicao.habilidade);
  }

  protected abrirEdicaoDescricao(campo: CampoDescricao): void {
    this.campoDescricaoEmEdicao.set(campo);
  }

  protected cancelarEdicaoDescricao(): void {
    this.campoDescricaoEmEdicao.set(null);
  }

  protected async salvarDescricao(valor: string): Promise<void> {
    const campo = this.campoDescricaoEmEdicao();
    if (!campo) {
      return;
    }

    this.formulario.controls.descricao.controls[campo].setValue(valor);

    const entradaAtual = this.pessoaEmEdicao();
    if (!entradaAtual) {
      this.campoDescricaoEmEdicao.set(null);
      return;
    }

    await this.feedbackAcaoService.executar(this.feedbackDescricao, {
      delayCarregando: 500,
      acao: () => {
        this.pessoaService.salvar(entradaAtual.id, this.formulario.getRawValue());
        this.pessoaEmEdicao.set(this.pessoaService.buscarPorId(entradaAtual.id) ?? null);
      },
      delaySucesso: 800,
      aoSucesso: () => this.campoDescricaoEmEdicao.set(null),
    });
  }

  protected pedirRemocaoHabilidade(indice: number, habilidade: HabilitiesModel): void {
    this.habilidadeParaRemover.set({ indice, habilidade });
  }

  protected confirmarRemocaoHabilidade(): void {
    const alvo = this.habilidadeParaRemover();
    if (!alvo) {
      return;
    }

    this.habilidadeService.remover(this.pessoaEmEdicao()!.id, alvo.indice);
    this.habilidadeParaRemover.set(null);
    this.versaoHabilidades.update((versao) => versao + 1);
    this.habilidadeEmEdicao.set(null);
    this.modalHabilidadeAberto.set(false);
  }

  protected cancelarRemocaoHabilidade(): void {
    this.habilidadeParaRemover.set(null);
  }

  private carregarPessoas(): void {
    this.pessoas.set(this.pessoaService.listarTodas());
  }

  private preencherFormulario(dados: AboutModel): void {
    this.formulario.setValue({
      nome: dados.nome,
      idade: dados.idade,
      carreira: dados.carreira,
      profissao: dados.profissao,
      empresa: dados.empresa,
      imagem: dados.imagem,
      descricao: { ...dados.descricao },
    });
  }
}
