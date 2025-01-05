import type { DisciplineRegistrationRepository } from '@/repositories/discipline-registration-repository.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'

interface GetStudentCompletedCourseHourUseCaseRequest {
  register: string
}

interface GetStudentCompletedCourseHourUseCaseResponse {
  totalCourseHours: number
  completionPercentage: number
  totalHoursCompleted: number
}

export class GetStudentCompletedCourseHourUseCase {
  constructor(
    private registrationRepository: RegistrationsRepository,
    private disciplineRegistrationRepository: DisciplineRegistrationRepository
  ) {}

  async execute({
    register,
  }: GetStudentCompletedCourseHourUseCaseRequest): Promise<GetStudentCompletedCourseHourUseCaseResponse> {
    const isExistRegistration =
      await this.registrationRepository.existsByRegistration(register)

    if (!isExistRegistration) {
      throw new StudentNotFoundError()
    }

    const result =
      await this.disciplineRegistrationRepository.getStudentCompletedCourseHour(
        register
      )

    return result
  }
}
