export class UserUpdateError extends Error {
  constructor() {
    super('Error ao atualizar os dados do usuário. Tente novamente')
  }
}
