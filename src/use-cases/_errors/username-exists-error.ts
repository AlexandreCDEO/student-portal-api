export class UsernameExistsError extends Error {
  constructor() {
    super('Já existe um usuário cadastrado com este usuário. Verifique!')
  }
}
