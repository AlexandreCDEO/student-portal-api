export class NewPasswordEqualError extends Error {
  constructor() {
    super('A nova senha deve ser diferente a senha atual. Verifique!')
  }
}
