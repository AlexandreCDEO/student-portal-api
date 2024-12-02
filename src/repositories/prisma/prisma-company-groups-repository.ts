import { prisma } from '@/lib/prisma.js'
import type { CompanyGroupsRepository } from '../company-groups-repository.js'

export class PrismaCompanyGroupsRepository implements CompanyGroupsRepository {
  async searchMainGroupOfCompanies(): Promise<number | null> {
    const companyGroup = await prisma.grupoEmpresa.findFirst({
      where: {
        grupoEmpresaPrincipal: true,
      },
    })

    if (!companyGroup) return null

    return companyGroup.grupoEmpresaId
  }
}
