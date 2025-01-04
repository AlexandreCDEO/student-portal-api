import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest'
import { GetStudentCompletedSemesterHourUseCase } from './get-student-completed-semester-hour.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import type { DisciplineRegistrationRepository } from '@/repositories/discipline-registration.js'

describe('GetStudentCompletedSemesterHourUseCase', () => {
  let registrationsRepository: Mocked<RegistrationsRepository>
  let disciplineRegistrationRepository: Mocked<DisciplineRegistrationRepository>
  let sut: GetStudentCompletedSemesterHourUseCase

  beforeEach(() => {
    registrationsRepository = {
      existsByRegistration: vi.fn(),
    } as unknown as Mocked<RegistrationsRepository>

    disciplineRegistrationRepository = {
      getStudentCompletedSemesterHour: vi.fn(),
    } as unknown as Mocked<DisciplineRegistrationRepository>

    sut = new GetStudentCompletedSemesterHourUseCase(
      registrationsRepository,
      disciplineRegistrationRepository
    )
  })

  it('should return completed semester hour details if student is found', async () => {
    registrationsRepository.existsByRegistration.mockResolvedValue(true)
    disciplineRegistrationRepository.getStudentCompletedSemesterHour.mockResolvedValue(
      {
        totalCourseHours: 120,
        completionPercentage: 75,
        totalHoursCompleted: 90,
      }
    )

    const response = await sut.execute({ register: '123' })

    expect(response).toEqual({
      totalCourseHours: 120,
      completionPercentage: 75,
      totalHoursCompleted: 90,
    })

    expect(registrationsRepository.existsByRegistration).toHaveBeenCalledWith(
      '123'
    )

    expect(
      disciplineRegistrationRepository.getStudentCompletedSemesterHour
    ).toHaveBeenCalledWith('123')
  })

  it('should throw StudentNotFoundError if student is not found', async () => {
    registrationsRepository.existsByRegistration.mockResolvedValue(false)

    await expect(sut.execute({ register: '123' })).rejects.toBeInstanceOf(
      StudentNotFoundError
    )

    expect(registrationsRepository.existsByRegistration).toHaveBeenCalledWith(
      '123'
    )

    expect(
      disciplineRegistrationRepository.getStudentCompletedSemesterHour
    ).not.toHaveBeenCalled()
  })
})
