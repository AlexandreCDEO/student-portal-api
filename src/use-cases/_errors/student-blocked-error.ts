export class StudentBlockedError extends Error {
  constructor() {
    super(
      'Usuário BLOQUEADO. Entre em contato com a área responsável pela administração do controle de acesso.'
    )
  }
}
