export interface HistoryBulletinBoardRepository {
  create(
    companyId: number,
    bulletinBoardCode: number,
    userId: number
  ): Promise<boolean>
}
