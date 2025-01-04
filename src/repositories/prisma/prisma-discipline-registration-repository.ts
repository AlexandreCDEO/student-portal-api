import { prisma } from '@/lib/prisma.js'
import type { DisciplineRegistrationRepository } from '../discipline-registration.js'
import { CompanyDefinedAsMainNotExistsError } from '@/use-cases/_errors/company-defined-as-main-not-exists.js'
import { DisciplineStatus } from '@/enums/discipline-status.js'

export class PrismaDisciplineRegistrationRepository
  implements DisciplineRegistrationRepository
{
  async getStudentCompletedCourseHour(register: string): Promise<{
    totalCourseHours: number
    completionPercentage: number
    totalHoursCompleted: number
  }> {
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

    const studentDataForCalculating = await prisma.matricula.findFirst({
      select: {
        cursoCodigo: true,
        turma: {
          select: {
            turmaMatrizCurricular: true,
          },
        },
      },
      where: {
        empresaId: company.empresaId,
        matriculaCodigo: register,
      },
    })

    const currentSequencesOfDisciplines =
      await prisma.matriculaDisciplina.groupBy({
        where: {
          empresaId: company.empresaId,
          matriculaCodigo: register,
        },
        by: ['empresaId', 'matriculaCodigo', 'disciplinaCodigo'],
        _max: {
          matriculaDisciplinaSeq: true,
        },
      })

    const result = await Promise.all(
      currentSequencesOfDisciplines.map(async currentSequenceOfDiscipline => {
        return await prisma.matriculaDisciplina.findFirst({
          where: {
            empresaId: currentSequenceOfDiscipline.empresaId,
            matriculaCodigo: currentSequenceOfDiscipline.matriculaCodigo,
            disciplinaCodigo: currentSequenceOfDiscipline.disciplinaCodigo,
            matriculaDisciplinaSeq:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              currentSequenceOfDiscipline._max.matriculaDisciplinaSeq!,
          },
        })
      })
    )

    let totalCourseHours = 0
    let totalHoursInProgress = 0
    let totalHoursCompleted = 0

    for (const discipline of result) {
      totalCourseHours += discipline?.matriculaDisciplinaCargaHor || 0
      if (discipline?.matriculaDisciplinaStatus === DisciplineStatus.CURSANDO) {
        totalHoursInProgress += discipline?.matriculaDisciplinaCargaHor || 0
      }
      if (
        discipline?.matriculaDisciplinaStatus === DisciplineStatus.APROVADO ||
        discipline?.matriculaDisciplinaStatus === DisciplineStatus.REPROVADO ||
        discipline?.matriculaDisciplinaStatus === DisciplineStatus.APROVEITADA
      ) {
        totalHoursCompleted += discipline?.matriculaDisciplinaCargaHor || 0
      }
    }

    let completionPercentage = 0

    const totalHoursCurriculumMatrix =
      await prisma.matrizCurricularPeriodoDisciplina.aggregate({
        where: {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          cursoCodigo: studentDataForCalculating?.cursoCodigo!,
          matrizCurricularCodigo:
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            studentDataForCalculating?.turma?.turmaMatrizCurricular!,
        },
        _sum: {
          matrizCurricularPeriodoDisciplinaCargaHorariaTotal: true,
        },
      })

    if (
      totalHoursCurriculumMatrix._sum
        .matrizCurricularPeriodoDisciplinaCargaHorariaTotal &&
      totalHoursCurriculumMatrix._sum
        .matrizCurricularPeriodoDisciplinaCargaHorariaTotal > 0
    ) {
      completionPercentage = Math.round(
        (totalHoursCompleted /
          totalHoursCurriculumMatrix._sum
            .matrizCurricularPeriodoDisciplinaCargaHorariaTotal) *
          100
      )
    }

    return {
      totalCourseHours:
        totalHoursCurriculumMatrix._sum
          .matrizCurricularPeriodoDisciplinaCargaHorariaTotal ?? 0,
      completionPercentage,
      totalHoursCompleted,
    }
  }

  async getStudentCompletedSemesterHour(register: string): Promise<{
    totalCourseHours: number
    completionPercentage: number
    totalHoursCompleted: number
  }> {
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

    const studentDataForCalculating = await prisma.matricula.findFirst({
      select: {
        cursoCodigo: true,
        turma: {
          select: {
            turmaPeriodoLetivo: true,
            turmaMatrizCurricular: true,
          },
        },
      },
      where: {
        empresaId: company.empresaId,
        matriculaCodigo: register,
      },
    })

    const currentSequencesOfDisciplines =
      await prisma.matriculaDisciplina.groupBy({
        where: {
          empresaId: company.empresaId,
          matriculaCodigo: register,
          matriculaDisciplinaPeriodo:
            studentDataForCalculating?.turma?.turmaPeriodoLetivo,
        },
        by: ['empresaId', 'matriculaCodigo', 'disciplinaCodigo'],
        _max: {
          matriculaDisciplinaSeq: true,
        },
      })

    const result = await Promise.all(
      currentSequencesOfDisciplines.map(async currentSequenceOfDiscipline => {
        return await prisma.matriculaDisciplina.findFirst({
          where: {
            empresaId: currentSequenceOfDiscipline.empresaId,
            matriculaCodigo: currentSequenceOfDiscipline.matriculaCodigo,
            disciplinaCodigo: currentSequenceOfDiscipline.disciplinaCodigo,
            matriculaDisciplinaSeq:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              currentSequenceOfDiscipline._max.matriculaDisciplinaSeq!,
          },
        })
      })
    )

    let totalCourseHours = 0
    let totalHoursInProgress = 0
    let totalHoursCompleted = 0

    for (const discipline of result) {
      totalCourseHours += discipline?.matriculaDisciplinaCargaHor || 0
      if (discipline?.matriculaDisciplinaStatus === DisciplineStatus.CURSANDO) {
        totalHoursInProgress += discipline?.matriculaDisciplinaCargaHor || 0
      }
      if (
        discipline?.matriculaDisciplinaStatus === DisciplineStatus.APROVADO ||
        discipline?.matriculaDisciplinaStatus === DisciplineStatus.REPROVADO ||
        discipline?.matriculaDisciplinaStatus === DisciplineStatus.APROVEITADA
      ) {
        totalHoursCompleted += discipline?.matriculaDisciplinaCargaHor || 0
      }
    }

    let completionPercentage = 0

    if (
      studentDataForCalculating?.cursoCodigo &&
      studentDataForCalculating?.turma?.turmaMatrizCurricular &&
      studentDataForCalculating?.turma?.turmaPeriodoLetivo
    ) {
      const totalHoursCurriculumMatrix =
        await prisma.matrizCurricularPeriodoDisciplina.aggregate({
          where: {
            cursoCodigo: studentDataForCalculating?.cursoCodigo,
            matrizCurricularCodigo:
              studentDataForCalculating?.turma?.turmaMatrizCurricular,
            matrizCurricularPeriodo:
              studentDataForCalculating?.turma?.turmaPeriodoLetivo,
          },
          _sum: {
            matrizCurricularPeriodoDisciplinaCargaHorariaTotal: true,
          },
        })

      if (
        totalHoursCurriculumMatrix._sum
          .matrizCurricularPeriodoDisciplinaCargaHorariaTotal &&
        totalHoursCurriculumMatrix._sum
          .matrizCurricularPeriodoDisciplinaCargaHorariaTotal > 0
      ) {
        completionPercentage = Math.round(
          (totalHoursCompleted /
            totalHoursCurriculumMatrix._sum
              .matrizCurricularPeriodoDisciplinaCargaHorariaTotal) *
            100
        )
      }
    }

    return {
      totalCourseHours,
      completionPercentage,
      totalHoursCompleted,
    }
  }
}
