export class PasswordIsEmptyError extends Error {
  constructor() {
    super('Você não está autorizado à utilizar este sistema')
  }
}
