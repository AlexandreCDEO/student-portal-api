export interface PeriodBulletinBoardRepository {
  bulletinBoardIfFromThisPeriod(
    companyId: number,
    bulletinBoardCode: number,
    currentPeriod: number
  ): Promise<boolean>
}
