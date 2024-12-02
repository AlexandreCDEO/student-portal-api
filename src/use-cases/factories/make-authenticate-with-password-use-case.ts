import { PrismaCompanyCompanyGroupsRepository } from '@/repositories/prisma/prisma-company-company-groups-repository.js'
import { PrismaCompanyGroupsRepository } from '@/repositories/prisma/prisma-company-groups-repository.js'
import { PrismaRegistrationsRepository } from '@/repositories/prisma/prisma-registrations-repository.js'
import { PrismaSecuryPoliciesRepository } from '@/repositories/prisma/prisma-secury-policies-repository.js'
import { PrismaSecUserPassRepository } from '@/repositories/prisma/prisma-secuserpass-repository.js'
import { PrismaUserOccurrenciesRepository } from '@/repositories/prisma/prisma-user-occurrencies-repository.js'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.js'
import { AuthenticateWithPassword } from '../authenticate-with-password.js'

export function makeAuthenticateWithPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const registrationsRepository = new PrismaRegistrationsRepository()
  const companyGroupRepository = new PrismaCompanyGroupsRepository()
  const companyCompanyGroupsRepository =
    new PrismaCompanyCompanyGroupsRepository()
  const securyPoliciesRepository = new PrismaSecuryPoliciesRepository()
  const secUserPassRepository = new PrismaSecUserPassRepository()
  const userOccurrenciesRepository = new PrismaUserOccurrenciesRepository()
  const authenticateWithPasswordUseCase = new AuthenticateWithPassword(
    usersRepository,
    registrationsRepository,
    companyGroupRepository,
    companyCompanyGroupsRepository,
    securyPoliciesRepository,
    secUserPassRepository,
    userOccurrenciesRepository
  )

  return authenticateWithPasswordUseCase
}
