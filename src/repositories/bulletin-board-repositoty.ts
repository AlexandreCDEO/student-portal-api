import type { MuralRecado } from '@prisma/client'

export interface BulletinBoardRepository {
  getStudentMessages(
    companyId: number,
    registration: string
  ): Promise<MuralRecado[]>
}
