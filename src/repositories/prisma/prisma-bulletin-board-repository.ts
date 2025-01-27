import type { MuralRecado } from '@prisma/client'
import type { BulletinBoardRepository } from '../bulletin-board-repositoty.js'
import { prisma } from '@/lib/prisma.js'
import { startOfDay } from 'date-fns'
import { BulletinBoardDestiny } from '@/enums/bulletin-board-destiny.js'

export class PrismaBulletinBoardRepository implements BulletinBoardRepository {
  async getStudentMessage(
    companyId: number,
    id: number
  ): Promise<MuralRecado | null> {
    const bulletinBoard = await prisma.muralRecado.findFirst({
      where: {
        empresaId: companyId,
        muralRecadoCodigo: id,
      },
    })

    return bulletinBoard
  }

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
        // muralRecadoDataFinal: {
        //   gte: startOfDay(new Date()),
        // },
        muralRecadoDestino: isGraduatingStudent
          ? BulletinBoardDestiny.GRADUATES
          : {
              in: [BulletinBoardDestiny.STUDENTS, BulletinBoardDestiny.BOTH],
            },
      },
      orderBy: [{ empresaId: 'asc' }, { muralRecadoDataInicio: 'desc' }],
    })

    return bulletinBoards
  }
}
