import { Encrypter } from './encrypter';

describe('Encrypter', () => {
  it('deve produzir saídas diferentes ao cifrar a mesma senha duas vezes', async () => {
    const primeiraCifragem = await Encrypter.encrypt('SenhaTeste1');
    const segundaCifragem = await Encrypter.encrypt('SenhaTeste1');

    expect(primeiraCifragem).not.toEqual(segundaCifragem);
  });

  it('deve reconhecer a senha original a partir de qualquer uma das cifragens dela', async () => {
    const primeiraCifragem = await Encrypter.encrypt('SenhaTeste1');
    const segundaCifragem = await Encrypter.encrypt('SenhaTeste1');

    expect(await Encrypter.matches('SenhaTeste1', primeiraCifragem)).toBe(true);
    expect(await Encrypter.matches('SenhaTeste1', segundaCifragem)).toBe(true);
  });

  it('não deve reconhecer uma senha diferente da que foi cifrada', async () => {
    const senhaCifrada = await Encrypter.encrypt('SenhaTeste1');

    expect(await Encrypter.matches('SenhaErrada', senhaCifrada)).toBe(false);
  });

  it('não deve reconhecer um valor armazenado que não seja uma cifragem válida', async () => {
    expect(await Encrypter.matches('SenhaTeste1', 'valor-invalido')).toBe(false);
  });
});
