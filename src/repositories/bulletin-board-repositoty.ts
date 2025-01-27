import type { MuralRecado } from '@prisma/client'

export interface BulletinBoardRepository {
  getStudentMessages(
    companyId: number,
    isGraduatingStudent: boolean
  ): Promise<MuralRecado[]>

  getStudentMessage(companyId: number, id: number): Promise<MuralRecado | null>
}
