import { prisma } from '@/lib/prisma.js'
import type { RequirementsRepository } from '../requirements-repository.js'
import { CompanyDefinedAsMainNotExistsError } from '@/use-cases/_errors/company-defined-as-main-not-exists.js'

export class PrismaRequirementsRepository implements RequirementsRepository {
  async getStudentRequirements(registration: string): Promise<
    {
      id: number
      numberOfUnreadMessages: number
      date: Date | null
      status: string | null
    }[]
  > {
    const company = await prisma.grupoEmpresaEmpresa.findFirst({
      select: {
        empresaId: true,
      },
      where: {
        empresaPrincipal: true,
        grupoEmpresa: {
          grupoEmpresaAtivo: true,
          grupoEmpresaPrincipal: true,
        },
      },
    })

    if (!company) {
      throw new CompanyDefinedAsMainNotExistsError()
    }

    const requirementsData = await prisma.requerimento.findMany({
      select: {
        requerimentoId: true,
        requerimentoData: true,
        requerimentoStatus: true,
      },
      where: {
        empresaId: company.empresaId,
        matriculaCodigo: registration,
      },
    })

    const requirementsWithUnreadMessages = await Promise.all(
      requirementsData.map(async requirement => {
        const numberOfUnreadMessages = await prisma.requerimentoConteudo.count({
          where: {
            empresaId: company.empresaId,
            requerimentoId: requirement.requerimentoId,
            requerimentoRequerente: false,
            requerimentoConteudoVisualizado: false,
          },
        })

        return {
          id: requirement.requerimentoId,
          numberOfUnreadMessages,
          date: requirement.requerimentoData,
          status: requirement.requerimentoStatus,
        }
      })
    )

    return requirementsWithUnreadMessages
  }
}
