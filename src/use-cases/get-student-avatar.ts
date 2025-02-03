import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { ParticipantAffliateAvatarRepository } from '@/repositories/participant-affliate-avatar.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import { InvalidDataInRegisteringError } from './_errors/invalid-data-in-regitering-error.js'

type GetStudentAvatarUseCaseRequest = {
  registration: string
}

export class GetStudentAvatarUseCase {
  constructor(
    private companyGroupsRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private registrationsRepository: RegistrationsRepository,
    private participantAffliateAvatarRepository: ParticipantAffliateAvatarRepository
  ) {}

  async execute({ registration }: GetStudentAvatarUseCaseRequest) {
    /** Recupera dados da empresa */
    const companyGroup =
      await this.companyGroupsRepository.searchMainGroupOfCompanies()

    if (!companyGroup) throw new MainGroupOfCompaniesNotExistsError()

    const companyId =
      await this.companyCompanyGroupsRepository.searchCompanyDefinedAsMain(
        companyGroup
      )
    if (!companyId) throw new CompanyDefinedAsMainNotExistsError()

    /** Recupera dados da matrícula */
    const studentData = await this.registrationsRepository.getStudentData(
      companyId,
      registration
    )

    if (!studentData) throw new StudentNotFoundError()

    if (
      !studentData.alunoParticipanteCod ||
      !studentData.alunoParticipanteFilialCod
    )
      throw new InvalidDataInRegisteringError()

    /** Recupera avatar do Estudante */
    const studentAvatar =
      await this.participantAffliateAvatarRepository.getStudentAvatar(
        companyId,
        studentData.alunoParticipanteCod,
        studentData.alunoParticipanteFilialCod
      )

    return studentAvatar
  }
}
