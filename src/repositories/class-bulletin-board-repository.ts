export interface ClassBulletinBoardRepository {
  bulletinBoardIfFromThisClass(
    companyId: number,
    bulletinBoardCode: number,
    courseCode: number,
    classCode: number
  ): Promise<boolean>
}
