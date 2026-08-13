import { environment } from '../../../../environments/environment';

const ALGORITMO = 'AES-GCM';
const TAMANHO_IV_EM_BYTES = 12;
const CHAVE_FIXA_BASE64 = environment.chaveEncriptacaoBase64;

let chavePromise: Promise<CryptoKey> | null = null;

function obterChave(): Promise<CryptoKey> {
  if (!chavePromise) {
    chavePromise = crypto.subtle.importKey('raw', deBase64(CHAVE_FIXA_BASE64), ALGORITMO, false, [
      'encrypt',
      'decrypt',
    ]);
  }
  return chavePromise;
}

function paraBase64(bytes: Uint8Array): string {
  let binario = '';
  bytes.forEach((byte) => (binario += String.fromCharCode(byte)));
  return btoa(binario);
}

function deBase64(base64: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(Uint8Array.from(atob(base64), (caractere) => caractere.charCodeAt(0)));
}

export class Encrypter {
  static async encrypt(senha: string): Promise<string> {
    const chave = await obterChave();
    const iv = crypto.getRandomValues(new Uint8Array(TAMANHO_IV_EM_BYTES));
    const textoCifrado = await crypto.subtle.encrypt({ name: ALGORITMO, iv }, chave, new TextEncoder().encode(senha));

    const combinado = new Uint8Array(iv.length + textoCifrado.byteLength);
    combinado.set(iv, 0);
    combinado.set(new Uint8Array(textoCifrado), iv.length);

    return paraBase64(combinado);
  }

  static async matches(senhaDigitada: string, senhaArmazenada: string): Promise<boolean> {
    try {
      const combinado = deBase64(senhaArmazenada);
      const iv = combinado.slice(0, TAMANHO_IV_EM_BYTES);
      const textoCifrado = combinado.slice(TAMANHO_IV_EM_BYTES);
      const chave = await obterChave();
      const textoDecifrado = await crypto.subtle.decrypt({ name: ALGORITMO, iv }, chave, textoCifrado);

      return new TextDecoder().decode(textoDecifrado) === senhaDigitada;
    } catch {
      return false;
    }
  }
}
