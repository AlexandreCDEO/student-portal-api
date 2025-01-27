import { PrismaBulletinBoardRepository } from '../../repositories/prisma/prisma-bulletin-board-repository.js'
import { PrismaCompanyCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-company-groups-repository.js'
import { PrismaCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-groups-repository.js'
import { GetStudentMessageUseCase } from '../get-student-message.js'

export function makeGetStudentMessageUseCase() {
  const bulletinBoardRepository = new PrismaBulletinBoardRepository()

  const companyCompanyGroupsRepository =
    new PrismaCompanyCompanyGroupsRepository()
  const companyGroupsRepository = new PrismaCompanyGroupsRepository()

  const getStudentMessageUseCase = new GetStudentMessageUseCase(
    companyCompanyGroupsRepository,
    companyGroupsRepository,
    bulletinBoardRepository
  )

  return getStudentMessageUseCase
}
