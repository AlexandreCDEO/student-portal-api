import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { BulletinBoardRepository } from '@/repositories/bulletin-board-repositoty.js'
import { BulletinBoardNotFoundError } from './_errors/bulletin-board-not-found-error.js'

type GetStudentMessageUseCaseRequest = {
  MessageId: number
}

type GetStudentMessageUseCaseResponse = {
  id: number
  title: string
  date: Date
  message: string
}

export class GetStudentMessageUseCase {
  constructor(
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private companyGroupsRepository: CompanyGroupsRepository,
    private bulletinBoardRepository: BulletinBoardRepository
  ) {}

  async execute({
    MessageId,
  }: GetStudentMessageUseCaseRequest): Promise<GetStudentMessageUseCaseResponse> {
    /** Recupera dados da empresa */
    const companyGroup =
      await this.companyGroupsRepository.searchMainGroupOfCompanies()

    if (!companyGroup) throw new MainGroupOfCompaniesNotExistsError()

    const companyId =
      await this.companyCompanyGroupsRepository.searchCompanyDefinedAsMain(
        companyGroup
      )
    if (!companyId) throw new CompanyDefinedAsMainNotExistsError()

    const studentMessage = await this.bulletinBoardRepository.getStudentMessage(
      companyId,
      MessageId
    )

    if (!studentMessage) throw new BulletinBoardNotFoundError()

    return {
      id: Number(studentMessage.muralRecadoCodigo),
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      title: studentMessage.muralRecadoTitulo!,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      date: studentMessage.muralRecadoDtaLog!,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      message: studentMessage.muralRecadoMensagem!,
    }
  }
}
