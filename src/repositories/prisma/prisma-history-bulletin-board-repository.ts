import { prisma } from '@/lib/prisma.js'
import type { HistoryBulletinBoardRepository } from '../history-bulletin-board-repository.js'

export class PrismaHistoryBulletinBoardRepository
  implements HistoryBulletinBoardRepository
{
  async create(
    companyId: number,
    bulletinBoardCode: number,
    userId: number
  ): Promise<boolean> {
    const lastSequence = await prisma.muralRecadoLog.findMany({
      select: {
        muralRecadoLogCodigo: true,
      },
      where: {
        empresaId: companyId,
        muralRecadoCodigo: bulletinBoardCode,
      },
      orderBy: [
        { empresaId: 'asc' },
        { muralRecadoCodigo: 'asc' },
        { muralRecadoLogCodigo: 'desc' },
      ],
      take: 1,
    })

    const newLogCode = lastSequence[0]?.muralRecadoLogCodigo
      ? lastSequence[0].muralRecadoLogCodigo + 1
      : 1

    const data = await prisma.muralRecadoLog.create({
      data: {
        empresaId: companyId,
        muralRecadoCodigo: bulletinBoardCode,
        muralRecadoLogCodigo: newLogCode,
        muralRecadoLogData: new Date(),
        secUserId: userId,
      },
    })

    return !!data
  }
}
