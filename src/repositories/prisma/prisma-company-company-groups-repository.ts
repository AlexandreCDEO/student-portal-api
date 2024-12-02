import { prisma } from '@/lib/prisma.js'
import type { CompanyCompanyGroupsRepository } from '../company-company-groups-repository.js'

export class PrismaCompanyCompanyGroupsRepository
  implements CompanyCompanyGroupsRepository
{
  async searchCompanyDefinedAsMain(
    grupoEmpresaId: number
  ): Promise<number | null> {
    const company = await prisma.grupoEmpresaEmpresa.findFirst({
      where: {
        grupoEmpresaId,
        empresaPrincipal: true,
      },
    })

    if (!company) return null

    return company.empresaId
  }
}
