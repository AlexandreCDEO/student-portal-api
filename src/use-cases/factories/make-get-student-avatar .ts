import { PrismaCompanyCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-company-groups-repository.js'
import { PrismaCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-groups-repository.js'
import { PrismaRegistrationsRepository } from '../../repositories/prisma/prisma-registrations-repository.js'
import { PrismaParticipantAffiliateAvatarRepository } from '@/repositories/prisma/prisma-participant-affiliate-avatar.js'
import { SaveStudentAvatarUseCase } from '../save-student-avatar.js'
import { GetStudentAvatarUseCase } from '../get-student-avatar.js'

export function makeGetStudentAvatarUseCase() {
  const companyCompanyGroupsRepository =
    new PrismaCompanyCompanyGroupsRepository()
  const companyGroupsRepository = new PrismaCompanyGroupsRepository()
  const registrationsRepository = new PrismaRegistrationsRepository()
  const participantAffiliateAvatarRepository =
    new PrismaParticipantAffiliateAvatarRepository()

  const getStudentAvatarUseCase = new GetStudentAvatarUseCase(
    companyGroupsRepository,
    companyCompanyGroupsRepository,
    registrationsRepository,
    participantAffiliateAvatarRepository
  )

  return getStudentAvatarUseCase
}
