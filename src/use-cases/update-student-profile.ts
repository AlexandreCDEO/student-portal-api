import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'

interface UpdateStudentProfileUseCaseRequest {
  registration: string
  genderId?: number | null
  mail: string
  phone: {
    ddd: number
    number: number
  }
  race: number
}

interface UpdateStudentProfileUseCaseResponse {
  isSuccess: boolean
}

export class UpdateStudentProfileUseCase {
  constructor(private registrationsRepository: RegistrationsRepository) {}

  async execute({
    registration,
    genderId,
    mail,
    phone,
    race,
  }: UpdateStudentProfileUseCaseRequest): Promise<UpdateStudentProfileUseCaseResponse> {
    const studentExists =
      await this.registrationsRepository.existsByRegistration(registration)

    if (!studentExists) throw new StudentNotFoundError()

    const studentIsUpdated =
      await this.registrationsRepository.updateStudentProfile(
        registration,
        genderId,
        mail,
        phone,
        race
      )

    return { isSuccess: studentIsUpdated }
  }
}
