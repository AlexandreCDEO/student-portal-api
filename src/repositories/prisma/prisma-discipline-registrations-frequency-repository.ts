import { prisma } from '@/lib/prisma.js'
import type { DisciplineRegistrationsfrequencyRepository } from '../discipline-registrations-frequency-repository.js'
import { CompanyDefinedAsMainNotExistsError } from '@/use-cases/_errors/company-defined-as-main-not-exists.js'

export class PrismaDisciplineRegistrationsFrequencyRepository
  implements DisciplineRegistrationsfrequencyRepository
{
  async getStudentFrequency(
    registration: string
  ): Promise<{ totalAbsences: number; frequencyPercentage: number }> {
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

    const studentFrequencyData =
      await prisma.matriculaDisciplinaFrequencia.findMany({
        select: {
          matriculaDisciplinaFreqPresente: true,
        },
        where: {
          empresaId: company.empresaId,
          matriculaCodigo: registration,
        },
      })

    const totalAbsences = studentFrequencyData.filter(
      data => !data.matriculaDisciplinaFreqPresente
    ).length

    const frequencyPercentage =
      studentFrequencyData.length > 0
        ? Math.round(
            ((studentFrequencyData.length - totalAbsences) /
              studentFrequencyData.length) *
              100
          )
        : 100

    return { totalAbsences, frequencyPercentage }
  }
}
