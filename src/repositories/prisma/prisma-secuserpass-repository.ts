import { prisma } from '@/lib/prisma.js'
import type { SecUserPassRepository } from '../secuser-pass-repository.js'

export class PrismaSecUserPassRepository implements SecUserPassRepository {
  async searchByUserId(userId: number): Promise<Date | null> {
    const result = await prisma.secUserPass.findFirst({
      where: {
        secUserId: userId,
      },
      orderBy: {
        secUserPassData: 'desc',
      },
      select: {
        secUserPassData: true,
      },
    })

    return result?.secUserPassData ?? null
  }
}
