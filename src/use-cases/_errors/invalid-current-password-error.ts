export class InvalidCurrentPasswordError extends Error {
  constructor() {
    super('Senha Atual inválida. Verifique!')
  }
}
