export interface DescricaoAbout {
  biografia: string;
  hobbies: string;
  desgostos: string;
  objetivos: string;
}

export interface AboutModel {
  nome: string;
  idade: number;
  carreira: string;
  profissao: string;
  empresa: string;
  imagem: string;
  descricao: DescricaoAbout;
}

export interface ArrayAboutModel {
  id: number;
  dados: AboutModel;
}
