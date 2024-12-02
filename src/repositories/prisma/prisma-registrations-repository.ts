import { prisma } from '@/lib/prisma.js'
import type {
  RegistrationsRepository,
  RegistrationWithCourse,
} from '../registrations-repository.js'

export class PrismaRegistrationsRepository implements RegistrationsRepository {
  async findByDocument(
    companyId: number,
    document: string
  ): Promise<RegistrationWithCourse[]> {
    const result = await prisma.matricula.findMany({
      include: {
        participanteFilial: true,
        curso: true,
      },
      where: {
        empresaId: companyId,
        matriculaSituacaoAluno: true,
        participanteFilial: {
          participanteFilialCnpj: Number(document),
        },
      },
    })

    const registrations: RegistrationWithCourse[] = result.map(
      registration => ({
        empresaId: registration.empresaId,
        alunoParticipanteCod: registration.alunoParticipanteCod,
        alunoParticipanteFilialCod: registration.alunoParticipanteFilialCod,
        cursoCodigo: registration.cursoCodigo,
        matriculaCodigo: registration.matriculaCodigo,
        matriculaDataCadastro: registration.matriculaDataCadastro,
        matriculaIdMoodle: registration.matriculaIdMoodle,
        matriculaIdPf: registration.matriculaIdPf,
        matriculaSituacaoAcademica: registration.matriculaSituacaoAcademica,
        matriculaSituacaoAluno: registration.matriculaSituacaoAluno,
        periodoEscolarAtualId: registration.periodoEscolarAtualId,
        periodoEscolarId: registration.periodoEscolarId,
        turmaCodigo: registration.turmaCodigo,
        cursoNome: registration.curso?.cursoNome,
      })
    )

    return registrations
  }
}
