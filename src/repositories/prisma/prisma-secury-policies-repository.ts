import type { SecuryPolicyType } from '@/enums/security-policy-type.js'
import type { SecuryPoliciesRepository } from '../secury-policies-repository.js'
import { prisma } from '@/lib/prisma.js'

export class PrismaSecuryPoliciesRepository
  implements SecuryPoliciesRepository
{
  async searchSecuryPolicyByType(
    empresaId: number,
    type: SecuryPolicyType
  ): Promise<number | null> {
    const result = await prisma.polSegNro.findFirst({
      where: {
        empresaId,
        empresaTipoPoliticaSeg: type,
      },
      select: {
        empresaAutenticaWindowsSeg: true,
      },
    })

    return result?.empresaAutenticaWindowsSeg ?? null
  }
}
