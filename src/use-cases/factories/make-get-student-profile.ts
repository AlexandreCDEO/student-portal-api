import { PrismaRegistrationsRepository } from '@/repositories/prisma/prisma-registrations-repository.js'
import { GetStudentProfileUseCase } from '../get-student-profile.js'

export function makeGetStudentProfileUseCase() {
  const registrationsRepository = new PrismaRegistrationsRepository()
  const getStudentProfileUseCase = new GetStudentProfileUseCase(
    registrationsRepository
  )
  return getStudentProfileUseCase
}
