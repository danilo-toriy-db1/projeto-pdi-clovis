---
name: configuracao-testes-jest
description: >
  Como configurar o Jest (via jest-preset-angular) como runner de testes
  unitários do projeto, substituindo o Vitest padrão do scaffold Angular CLI
  21. Use ao criar, editar ou revisar `jest.config.ts`, `setup-jest.ts`,
  `tsconfig.spec.json`, o script `test` do `package.json`, o target `test` do
  `angular.json`, ou qualquer arquivo `.spec.ts` de teste unitário Angular,
  incluindo a estruturação de casos de teste no padrão AAA.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Configuração de testes com Jest

> **Maintaining this skill**
>
> Atualize este documento sempre que a estratégia de configuração do Jest mudar
> (novo pacote, nova opção obrigatória do preset, nova convenção de arquivo de
> teste). Um refactor que preserva a estratégia não exige alteração.

## Visão geral

O scaffold gerado pelo Angular CLI 21 configura Vitest como runner de testes: o
target `test` em `angular.json` usa o builder `@angular/build:unit-test`, e
`tsconfig.spec.json` declara `"types": ["vitest/globals"]`. O projeto exige
Jest para os testes unitários, o que substitui esse arranjo por completo — o
runner de testes deste projeto é Jest com `jest-preset-angular`, nunca o
builder Vitest do CLI.

## Como aplicar

1. Em `devDependencies` do `package.json`, remova `vitest` e adicione `jest`,
   `jest-preset-angular` e `@types/jest`.
2. Crie `jest.config.ts` na raiz do projeto usando o preset:

   ```ts
   import type { Config } from 'jest';

   const config: Config = {
     preset: 'jest-preset-angular',
     setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
     testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
   };

   export default config;
   ```

3. Crie `setup-jest.ts` na raiz do projeto:

   ```ts
   import 'jest-preset-angular/setup-jest';
   ```

4. Em `tsconfig.spec.json`, troque `"types": ["vitest/globals"]` por
   `"types": ["jest"]`. Mantenha o `include` (`src/**/*.d.ts`,
   `src/**/*.spec.ts`) como está — o padrão de nome de arquivo de teste
   (`*.spec.ts`) não muda.
5. No `package.json`, troque o script `test` de `"ng test"` para `"jest"`. A
   partir daí, `npm test` invoca o Jest diretamente, sem passar pelo builder do
   Angular CLI.
6. O target `test` em `angular.json` (builder `@angular/build:unit-test`)
   permanece associado ao Vitest e não é usado por este projeto — não invoque
   `ng test`; use sempre `npm test` (ou `npx jest`) diretamente.
7. Cada `.spec.ts` continua colocado ao lado do arquivo que testa (serviços em
   `shared/services`, componentes em seu próprio diretório); a convenção de
   localização dos arquivos de teste não é definida por este runner, apenas a
   ferramenta que os executa.
8. Estruture todo teste no padrão AAA (Arrange-Act-Assert): primeiro monte o
   cenário e as dependências (`TestBed`, mocks, dados de entrada), depois
   execute a ação sob teste, e só então valide o resultado com `expect`. Não
   intercale montagem, execução e verificação dentro do mesmo `it`/`test`.

## Ferramentas e artefatos envolvidos

- `jest.config.ts` (raiz) — configuração do runner e do preset.
- `setup-jest.ts` (raiz) — setup global executado antes da suíte, referenciado
  por `setupFilesAfterEnv`.
- `tsconfig.spec.json` — tipos globais dos testes (`types: ["jest"]`) e escopo
  de arquivos incluídos.
- `package.json` — script `test`.
- Pacote `jest-preset-angular` — fornece o `TestBed` do Angular integrado ao
  ambiente jsdom do Jest.

## Restrições e armadilhas conhecidas

- O ambiente jsdom já é fornecido pelo preset `jest-preset-angular`; a
  dependência solta `jsdom` do scaffold original só é necessária caso algum
  outro script a use diretamente — confirme antes de removê-la.
- `jest-preset-angular` depende do comportamento de `zone.js` para detectar
  fim de tarefas assíncronas nos testes; se o projeto rodar com change
  detection zoneless, valide o guia oficial do `jest-preset-angular` para a
  variante compatível de setup antes de assumir o `setup-jest.ts` padrão.
- Testes que usam Reactive Forms ou Signals não exigem configuração adicional
  do Jest — o preset já integra `TestBed` e `ComponentFixture` normalmente.
- Um `it`/`test` que mistura mais de uma ação sob teste antes da verificação
  quebra o padrão AAA e dificulta apontar a causa de uma falha — separe em
  casos de teste distintos, um por comportamento verificado.
