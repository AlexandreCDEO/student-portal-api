import { PrismaRegistrationsRepository } from '@/repositories/prisma/prisma-registrations-repository.js'
import { PrismaDisciplineRegistrationsFrequencyRepository } from '@/repositories/prisma/prisma-discipline-registrations-frequency-repository.js'
import { GetStudentFrequency } from '../get-student-frequency.js'

export function makeGetStudentFrequencyUseCase() {
  const registrationsRepository = new PrismaRegistrationsRepository()
  const disciplineRegistrationsfrequencyRepository =
    new PrismaDisciplineRegistrationsFrequencyRepository()
  return new GetStudentFrequency(
    disciplineRegistrationsfrequencyRepository,
    registrationsRepository
  )
}
