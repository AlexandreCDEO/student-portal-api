import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest'
import { GetStudentFrequency } from './get-student-frequency.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import type { DisciplineRegistrationsfrequencyRepository } from '@/repositories/discipline-registrations-frequency-repository.js'

describe('GetStudentFrequency', () => {
  let registrationsRepository: Mocked<RegistrationsRepository>
  let disciplineRegistrationsfrequencyRepository: Mocked<DisciplineRegistrationsfrequencyRepository>
  let sut: GetStudentFrequency

  beforeEach(() => {
    registrationsRepository = {
      existsByRegistration: vi.fn(),
    } as unknown as Mocked<RegistrationsRepository>

    disciplineRegistrationsfrequencyRepository = {
      getStudentFrequency: vi.fn(),
    } as unknown as Mocked<DisciplineRegistrationsfrequencyRepository>

    sut = new GetStudentFrequency(
      disciplineRegistrationsfrequencyRepository,
      registrationsRepository
    )
  })

  it('should return student frequency details if student is found', async () => {
    registrationsRepository.existsByRegistration.mockResolvedValue(true)
    disciplineRegistrationsfrequencyRepository.getStudentFrequency.mockResolvedValue(
      {
        totalAbsences: 5,
        frequencyPercentage: 95,
      }
    )

    const response = await sut.execute({ registration: '123' })

    expect(response).toEqual({
      totalAbsences: 5,
      frequencyPercentage: 95,
    })

    expect(registrationsRepository.existsByRegistration).toHaveBeenCalledWith(
      '123'
    )

    expect(
      disciplineRegistrationsfrequencyRepository.getStudentFrequency
    ).toHaveBeenCalledWith('123')
  })

  it('should throw StudentNotFoundError if student is not found', async () => {
    registrationsRepository.existsByRegistration.mockResolvedValue(false)

    await expect(sut.execute({ registration: '123' })).rejects.toBeInstanceOf(
      StudentNotFoundError
    )

    expect(registrationsRepository.existsByRegistration).toHaveBeenCalledWith(
      '123'
    )

    expect(
      disciplineRegistrationsfrequencyRepository.getStudentFrequency
    ).not.toHaveBeenCalled()
  })
})
