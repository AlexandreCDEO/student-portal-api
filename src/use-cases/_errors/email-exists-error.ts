export class EmailExistsError extends Error {
  constructor() {
    super('Já existe um usuário cadastrado com este email. Verifique!')
  }
}
