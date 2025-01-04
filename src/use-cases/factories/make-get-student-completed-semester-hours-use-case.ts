import { PrismaRegistrationsRepository } from '@/repositories/prisma/prisma-registrations-repository.js'
import { PrismaDisciplineRegistrationRepository } from '@/repositories/prisma/prisma-discipline-registration-repository.js'
import { GetStudentCompletedSemesterHourUseCase } from '../get-student-completed-semester-hour.js'

export function makeGetStudentCompletedSemesterHoursUseCase() {
  const registrationsRepository = new PrismaRegistrationsRepository()
  const disciplineRegistrationRepository =
    new PrismaDisciplineRegistrationRepository()

  const getStudentCompletedSemesterHoursUseCase =
    new GetStudentCompletedSemesterHourUseCase(
      registrationsRepository,
      disciplineRegistrationRepository
    )

  return getStudentCompletedSemesterHoursUseCase
}
