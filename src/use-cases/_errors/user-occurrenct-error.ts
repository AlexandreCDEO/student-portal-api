export class UserOccurrencyError extends Error {
  constructor() {
    super(
      'Ocorreu um erro inesperado ao gravar ocorrência do usuário, tente novamente mais tarde!'
    )
  }
}
