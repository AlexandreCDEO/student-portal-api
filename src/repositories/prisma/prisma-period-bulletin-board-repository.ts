import { prisma } from '@/lib/prisma.js'
import type { PeriodBulletinBoardRepository } from '../period-bulletin-board-repository.js'

export class PrismaPeriodBulletinBoardRepository
  implements PeriodBulletinBoardRepository
{
  async bulletinBoardIfFromThisPeriod(
    companyId: number,
    bulletinBoardCode: number,
    currentPeriod: number
  ): Promise<boolean> {
    const isFromThisPeriod = await prisma.muralRecadoPeriodo.findFirst({
      where: {
        empresaId: companyId,
        muralRecadoCodigo: bulletinBoardCode,
        muralRecadoPeriodoEscolarId: currentPeriod,
      },
    })

    return !!isFromThisPeriod
  }
}
