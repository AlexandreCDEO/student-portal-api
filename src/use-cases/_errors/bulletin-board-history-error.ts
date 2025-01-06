export class BulletinBoardHistoryError extends Error {
  constructor() {
    super(
      'Aconteceu um problema ao gravar histórico de visualizações de recados no mural. Tente novamente mais tarde.'
    )
  }
}
