import { PrismaCompanyCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-company-groups-repository.js'
import { PrismaCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-groups-repository.js'
import { PrismaRegistrationsRepository } from '../../repositories/prisma/prisma-registrations-repository.js'
import { GetStudentCardDataUseCase } from '../get-student-card-data.js'

export function makeGetStudentCardDataUseCase() {
  const companyCompanyGroupsRepository =
    new PrismaCompanyCompanyGroupsRepository()
  const companyGroupsRepository = new PrismaCompanyGroupsRepository()
  const registrationsRepository = new PrismaRegistrationsRepository()

  const getStudentCardUseCase = new GetStudentCardDataUseCase(
    companyGroupsRepository,
    companyCompanyGroupsRepository,
    registrationsRepository
  )

  return getStudentCardUseCase
}
