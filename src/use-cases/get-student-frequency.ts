import type { DisciplineRegistrationsfrequencyRepository } from '@/repositories/discipline-registrations-frequency-repository.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'

interface GetStudentFrequencyRequest {
  registration: string
}

interface GetStudentFrequencyResponse {
  totalAbsences: number
  frequencyPercentage: number
}

export class GetStudentFrequency {
  constructor(
    private disciplineRegistrationsfrequencyRepository: DisciplineRegistrationsfrequencyRepository,
    private registrationsRepository: RegistrationsRepository
  ) {}

  async execute({
    registration,
  }: GetStudentFrequencyRequest): Promise<GetStudentFrequencyResponse> {
    const student =
      await this.registrationsRepository.existsByRegistration(registration)

    if (!student) {
      throw new StudentNotFoundError()
    }

    const result =
      await this.disciplineRegistrationsfrequencyRepository.getStudentFrequency(
        registration
      )

    return result
  }
}
