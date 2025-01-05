import type { DisciplineRegistrationRepository } from '@/repositories/discipline-registration-repository.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'

interface GetStudentCompletedSemesterHourUseCaseRequest {
  register: string
}

interface GetStudentCompletedSemesterHourUseCaseResponse {
  totalCourseHours: number
  completionPercentage: number
  totalHoursCompleted: number
}

export class GetStudentCompletedSemesterHourUseCase {
  constructor(
    private registrationRepository: RegistrationsRepository,
    private disciplineRegistrationRepository: DisciplineRegistrationRepository
  ) {}

  async execute({
    register,
  }: GetStudentCompletedSemesterHourUseCaseRequest): Promise<GetStudentCompletedSemesterHourUseCaseResponse> {
    const isExistRegistration =
      await this.registrationRepository.existsByRegistration(register)

    if (!isExistRegistration) {
      throw new StudentNotFoundError()
    }

    const result =
      await this.disciplineRegistrationRepository.getStudentCompletedSemesterHour(
        register
      )

    return result
  }
}
