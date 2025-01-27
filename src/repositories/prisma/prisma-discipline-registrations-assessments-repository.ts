import { prisma } from '@/lib/prisma.js'
import type { DisciplineRegistrationsAssessmentRepository } from '../discipline-registrations-assessment-repository.js'
import { CompanyDefinedAsMainNotExistsError } from '@/use-cases/_errors/company-defined-as-main-not-exists.js'

type AssessmentData = {
  discipline: string | null
  assessment: string | null
  note: number | null
  weight: number | null
}[]

export class PrismaDisciplineRegistrationsAssessmentsRepository
  implements DisciplineRegistrationsAssessmentRepository
{
  async getStudentAssessments(registration: string): Promise<AssessmentData> {
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

    const assessmentsData = await prisma.matriculaDisciplinaAvaliacao.findMany({
      select: {
        matriculaDisciplinaAvalDesc: true,
        matriculaDisciplinaAvalNota: true,
        matriculaDisciplinaAvalPeso: true,
        disciplina: {
          select: {
            disciplinaNome: true,
          },
        },
      },
      where: {
        empresaId: company.empresaId,
        matriculaCodigo: registration,
      },
      orderBy: [
        { empresaId: 'asc' },
        { matriculaCodigo: 'asc' },
        { disciplinaAvaliacaoDtaLog: 'desc' },
      ],
    })

    const assessments = assessmentsData.map(assessment => ({
      discipline: assessment.disciplina.disciplinaNome,
      assessment: assessment.matriculaDisciplinaAvalDesc,
      note: assessment.matriculaDisciplinaAvalNota
        ? assessment.matriculaDisciplinaAvalNota.toNumber()
        : null,
      weight: assessment.matriculaDisciplinaAvalPeso
        ? assessment.matriculaDisciplinaAvalPeso.toNumber()
        : null,
    }))

    return assessments
  }
}
