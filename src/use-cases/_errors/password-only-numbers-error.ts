export class PasswordOnlyNumbersError extends Error {
  constructor() {
    super('A senha deve conter apenas números. Verifique!')
  }
}
