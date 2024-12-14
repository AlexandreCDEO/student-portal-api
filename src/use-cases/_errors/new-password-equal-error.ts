export class NewPasswordEqualError extends Error {
  constructor() {
    super('A nova senha deve ser diferente da senha atual. Verifique!')
  }
}
