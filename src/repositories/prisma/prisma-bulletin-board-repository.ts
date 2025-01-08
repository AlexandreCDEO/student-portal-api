import type { MuralRecado } from '@prisma/client'
import type { BulletinBoardRepository } from '../bulletin-board-repositoty.js'
import { prisma } from '@/lib/prisma.js'
import { startOfDay } from 'date-fns'
import { BulletinBoardDestiny } from '@/enums/bulletin-board-destiny.js'

export class PrismaBulletinBoardRepository implements BulletinBoardRepository {
  async getStudentMessages(
    companyId: number,
    isGraduatingStudent: boolean
  ): Promise<MuralRecado[]> {
    const bulletinBoards = await prisma.muralRecado.findMany({
      where: {
        empresaId: companyId,
        muralRecadoDataInicio: {
          lte: startOfDay(new Date()),
        },
        muralRecadoDataFinal: {
          gte: startOfDay(new Date()),
        },
        muralRecadoDestino: isGraduatingStudent
          ? BulletinBoardDestiny.GRADUATES
          : {
              in: [BulletinBoardDestiny.STUDENTS, BulletinBoardDestiny.BOTH],
            },
      },
      orderBy: {
        empresaId: 'asc',
        muralRecadoDataInicio: 'asc',
        muralRecadoDataFinal: 'asc',
      },
    })

    return bulletinBoards
  }
}
