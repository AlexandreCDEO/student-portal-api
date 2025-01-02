import { PrismaRegistrationsRepository } from '@/repositories/prisma/prisma-registrations-repository.js'
import { UpdateStudentProfileUseCase } from '../update-student-profile.js'

export function makeUpdateProfileUseCase() {
  const registrationsRepository = new PrismaRegistrationsRepository()
  const updateStudentProfileUseCase = new UpdateStudentProfileUseCase(
    registrationsRepository
  )
  return updateStudentProfileUseCase
}
