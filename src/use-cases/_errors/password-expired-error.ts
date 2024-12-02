export class PasswordExpiredError extends Error {
  constructor() {
    super('Senha expirada. Verfifique!')
  }
}
