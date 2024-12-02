import { PrismaCompanyCompanyGroupsRepository } from '@/repositories/prisma/prisma-company-company-groups-repository.js'
import { PrismaCompanyGroupsRepository } from '@/repositories/prisma/prisma-company-groups-repository.js'
import { PrismaSecuryPoliciesRepository } from '@/repositories/prisma/prisma-secury-policies-repository.js'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.js'
import { ChangePasswordUseCase } from '../change-password.js'

export function makeChangePasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const companyGroupRepository = new PrismaCompanyGroupsRepository()
  const companyCompanyGroupsRepository =
    new PrismaCompanyCompanyGroupsRepository()
  const securyPoliciesRepository = new PrismaSecuryPoliciesRepository()
  const changePasswordUseCase = new ChangePasswordUseCase(
    usersRepository,
    securyPoliciesRepository,
    companyGroupRepository,
    companyCompanyGroupsRepository
  )

  return changePasswordUseCase
}
