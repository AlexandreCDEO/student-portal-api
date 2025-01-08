import { prisma } from '@/lib/prisma.js'
import type { CourseBulletinBoardRepository } from '../course-bulletin-board-repository.js'

export class PrismaCourseBulletinBoardRepository
  implements CourseBulletinBoardRepository
{
  async bulletinBoardIfFromThisCourse(
    companyId: number,
    bulletinBoardCode: number,
    courseCode: number
  ): Promise<boolean> {
    const isFromThisCourse = await prisma.muralRecadoCurso.findFirst({
      where: {
        empresaId: companyId,
        muralRecadoCodigo: bulletinBoardCode,
        muralRecadoCursoEmpresa: companyId,
        muralRecadoCursoCodigo: courseCode,
      },
    })

    return !!isFromThisCourse
  }
}
