import { PrismaRegistrationsRepository } from '@/repositories/prisma/prisma-registrations-repository.js'
import { PrismaDisciplineRegistrationRepository } from '@/repositories/prisma/prisma-discipline-registration-repository.js'
import { GetStudentCompletedCourseHourUseCase } from '../get-student-completed-course-hour.js'

export function makeGetStudentCompletedCourseHoursUseCase() {
  const registrationsRepository = new PrismaRegistrationsRepository()
  const disciplineRegistrationRepository =
    new PrismaDisciplineRegistrationRepository()

  const getStudentCompletedCourseHoursUseCase =
    new GetStudentCompletedCourseHourUseCase(
      registrationsRepository,
      disciplineRegistrationRepository
    )

  return getStudentCompletedCourseHoursUseCase
}
