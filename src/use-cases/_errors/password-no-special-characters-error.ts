export class PasswordNoSpecialCharactersError extends Error {
  constructor() {
    super(
      'A senha deve conter apenas números e letras, sem caracteres especiais. Verifique!'
    )
  }
}
