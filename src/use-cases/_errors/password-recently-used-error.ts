export class PasswordRecentlyUsedError extends Error {
  constructor(numberOfDays: number) {
    super(
      `A nova senha já foi utilizada nos últimos ${numberOfDays} dias. Escolha uma senha diferente.`
    )
  }
}
