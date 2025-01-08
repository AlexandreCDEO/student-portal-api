import { prisma } from '@/lib/prisma.js'
import type { ClassBulletinBoardRepository } from '../class-bulletin-board-repository.js'

export class PrismaClassBulletinBoardRepository
  implements ClassBulletinBoardRepository
{
  async bulletinBoardIfFromThisClass(
    companyId: number,
    bulletinBoardCode: number,
    courseCode: number,
    classCode: number
  ): Promise<boolean> {
    const isFromThisClass = await prisma.muralRecadoTurma.findFirst({
      where: {
        empresaId: companyId,
        muralRecadoCodigo: bulletinBoardCode,
        muralRecadoTurmaEmpresa: companyId,
        muralRecadoTurmaCurso: courseCode,
        muralRecadoTurmaCodigo: classCode,
      },
    })

    return !!isFromThisClass
  }
}
