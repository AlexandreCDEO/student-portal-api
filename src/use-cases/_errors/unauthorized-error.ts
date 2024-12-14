export class UnauthorizedError extends Error {
  constructor() {
    super('Token de autenticação inválido ou ausente.')
  }
}
