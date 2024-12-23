export class StudentNotFoundError extends Error {
  constructor() {
    super('Estudante não encontrado. Verifique!')
  }
}
