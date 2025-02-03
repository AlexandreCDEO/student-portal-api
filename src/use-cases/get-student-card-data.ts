import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'

type GetStudentCardDataUseCaseRequest = {
  registration: string
}

export class GetStudentCardDataUseCase {
  constructor(
    private companyGroupsRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private registrationsRepository: RegistrationsRepository
  ) {}

  async execute({ registration }: GetStudentCardDataUseCaseRequest) {
    /** Recupera dados da empresa */
    const companyGroup =
      await this.companyGroupsRepository.searchMainGroupOfCompanies()

    if (!companyGroup) throw new MainGroupOfCompaniesNotExistsError()

    const companyId =
      await this.companyCompanyGroupsRepository.searchCompanyDefinedAsMain(
        companyGroup
      )
    if (!companyId) throw new CompanyDefinedAsMainNotExistsError()

    const studentCardData =
      await this.registrationsRepository.getStudentCardData(
        companyId,
        registration
      )

    return studentCardData
  }
}
