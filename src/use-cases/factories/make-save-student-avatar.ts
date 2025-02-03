import { PrismaCompanyCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-company-groups-repository.js'
import { PrismaCompanyGroupsRepository } from '../../repositories/prisma/prisma-company-groups-repository.js'
import { PrismaRegistrationsRepository } from '../../repositories/prisma/prisma-registrations-repository.js'
import { PrismaParticipantAffiliateAvatarRepository } from '@/repositories/prisma/prisma-participant-affiliate-avatar.js'
import { SaveStudentAvatarUseCase } from '../save-student-avatar.js'

export function makeSaveStudentAvatarUseCase() {
  const companyCompanyGroupsRepository =
    new PrismaCompanyCompanyGroupsRepository()
  const companyGroupsRepository = new PrismaCompanyGroupsRepository()
  const registrationsRepository = new PrismaRegistrationsRepository()
  const participantAffiliateAvatarRepository =
    new PrismaParticipantAffiliateAvatarRepository()

  const saveStudentAvatarUseCase = new SaveStudentAvatarUseCase(
    companyGroupsRepository,
    companyCompanyGroupsRepository,
    registrationsRepository,
    participantAffiliateAvatarRepository
  )

  return saveStudentAvatarUseCase
}
