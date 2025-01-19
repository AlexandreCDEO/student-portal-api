import { GetStudentMessagesUseCase } from '../get-student-messages.js'
import { PrismaBulletinBoardRepository } from '../../repositories/prisma/prisma-bulletin-board-repository.js'
import { PrismaCompanyCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-company-groups-repository.js'
import { PrismaCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-groups-repository.js'
import { PrismaCourseBulletinBoardRepository } from '../../repositories/prisma/prisma-course-bulletin-board-repository.js'
import { PrismaRegistrationsRepository } from '../../repositories/prisma/prisma-registrations-repository.js'
import { PrismaClassBulletinBoardRepository } from '../../repositories/prisma/prisma-class-bulletin-board-repository.js'
import { PrismaPeriodBulletinBoardRepository } from '../../repositories/prisma/prisma-period-bulletin-board-repository.js'
import { PrismaHistoryBulletinBoardRepository } from '../../repositories/prisma/prisma-history-bulletin-board-repository.js'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository.js'

export function makeGetStudentMessagesUseCase() {
  const bulletinBoardRepository = new PrismaBulletinBoardRepository()

  const companyCompanyGroupsRepository =
    new PrismaCompanyCompanyGroupsRepository()
  const companyGroupsRepository = new PrismaCompanyGroupsRepository()

  const courseBulletinBoardRepository =
    new PrismaCourseBulletinBoardRepository()
  const registrationsRepository = new PrismaRegistrationsRepository()
  const classBulletinBoardRepository = new PrismaClassBulletinBoardRepository()
  const periodBulletinBoardRepository =
    new PrismaPeriodBulletinBoardRepository()
  const historyBulletinBoardRepository =
    new PrismaHistoryBulletinBoardRepository()
  const usersRepository = new PrismaUsersRepository()

  const getStudentMessagesUseCase = new GetStudentMessagesUseCase(
    bulletinBoardRepository,
    companyCompanyGroupsRepository,
    companyGroupsRepository,
    courseBulletinBoardRepository,
    registrationsRepository,
    classBulletinBoardRepository,
    periodBulletinBoardRepository,
    historyBulletinBoardRepository,
    usersRepository
  )

  return getStudentMessagesUseCase
}
