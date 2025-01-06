export interface CourseBulletinBoardRepository {
  bulletinBoardIfFromThisCourse(
    companyId: number,
    bulletinBoardCode: number,
    courseCode: number
  ): Promise<boolean>
}
