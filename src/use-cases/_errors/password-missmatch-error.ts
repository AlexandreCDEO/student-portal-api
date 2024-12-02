export class PasswordMissmatchError extends Error {
  constructor() {
    super('A nova senha e a confirmação de senha não são iguais.')
  }
}
