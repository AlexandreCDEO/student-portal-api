export class PasswordEncryptionError extends Error {
  constructor() {
    super('Erro no processe de criptografia de senha. Tente mais tarde.')
  }
}
