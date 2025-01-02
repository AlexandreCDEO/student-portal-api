import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest'
import { UpdateStudentProdileUseCase } from './update-student-profile.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'

describe('UpdateStudentProdileUseCase', () => {
  let registrationsRepository: Mocked<RegistrationsRepository>
  let sut: UpdateStudentProdileUseCase

  beforeEach(() => {
    registrationsRepository = {
      existsByRegistration: vi.fn(),
      updateStudentProfile: vi.fn(),
    } as unknown as Mocked<RegistrationsRepository>

    sut = new UpdateStudentProdileUseCase(registrationsRepository)
  })

  it('should update student profile successfully', async () => {
    registrationsRepository.existsByRegistration.mockResolvedValue(true)
    registrationsRepository.updateStudentProfile.mockResolvedValue(true)

    const response = await sut.execute({
      registration: '123',
      genderId: 1,
      mail: 'test@mail.com',
      phone: {
        ddd: 1,
        number: 2,
      },
      race: 1,
    })

    expect(response).toEqual({ isSuccess: true })
    expect(registrationsRepository.existsByRegistration).toHaveBeenCalledWith(
      '123'
    )
    expect(registrationsRepository.updateStudentProfile).toHaveBeenCalledWith(
      '123',
      1,
      'test@mail.com',
      {
        ddd: 1,
        number: 2,
      },
      1
    )
  })

  it('should throw StudentNotFoundError if student is not found', async () => {
    registrationsRepository.existsByRegistration.mockResolvedValue(false)

    await expect(
      sut.execute({
        registration: '123',
        genderId: 1,
        mail: 'test@mail.com',
        phone: {
          ddd: 1,
          number: 2,
        },
        race: 1,
      })
    ).rejects.toBeInstanceOf(StudentNotFoundError)
    expect(registrationsRepository.existsByRegistration).toHaveBeenCalledWith(
      '123'
    )
    expect(registrationsRepository.updateStudentProfile).not.toHaveBeenCalled()
  })

  it('should return isSuccess false if update fails', async () => {
    registrationsRepository.existsByRegistration.mockResolvedValue(true)
    registrationsRepository.updateStudentProfile.mockResolvedValue(false)

    const response = await sut.execute({
      registration: '123',
      genderId: 1,
      mail: 'test@mail.com',
      phone: {
        ddd: 1,
        number: 2,
      },
      race: 1,
    })

    expect(response).toEqual({ isSuccess: false })
    expect(registrationsRepository.existsByRegistration).toHaveBeenCalledWith(
      '123'
    )
    expect(registrationsRepository.updateStudentProfile).toHaveBeenCalledWith(
      '123',
      1,
      'test@mail.com',
      {
        ddd: 1,
        number: 2,
      },
      1
    )
  })
})
