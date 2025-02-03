import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import type { ParticipantAffliateAvatarRepository } from '@/repositories/participant-affliate-avatar.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import { InvalidDataInRegisteringError } from './_errors/invalid-data-in-regitering-error.js'

type SaveStudentAvatarUseCaseRequest = {
  registration: string
  avatar: Buffer
  name: string
  type: string
}

export class SaveStudentAvatarUseCase {
  constructor(
    private companyGroupsRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private registrationsRepository: RegistrationsRepository,
    private participantAffliateAvatarRepository: ParticipantAffliateAvatarRepository
  ) {}
  async execute({
    registration,
    avatar,
    name,
    type,
  }: SaveStudentAvatarUseCaseRequest) {
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

    /** Salva avatar do Estudante */
    const avatarSaved =
      await this.participantAffliateAvatarRepository.saveStudentAvatar(
        companyId,
        studentData.alunoParticipanteCod,
        studentData.alunoParticipanteFilialCod,
        avatar,
        name,
        type
      )

    return avatarSaved
  }
}
