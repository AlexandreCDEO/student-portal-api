export class PasswordComplexityError extends Error {
  constructor() {
    super(
      'A senha deve conter números, letras e caracteres especiais. Verifique!'
    )
  }
}
