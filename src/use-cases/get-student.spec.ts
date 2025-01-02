import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest'
import { GetStudentProfileUseCase } from './get-student-profile.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'

describe('GetStudentProfileUseCase', () => {
  let registrationsRepository: Mocked<RegistrationsRepository>
  let sut: GetStudentProfileUseCase

  beforeEach(() => {
    registrationsRepository = {
      getStudentProfile: vi.fn(),
    } as unknown as Mocked<RegistrationsRepository>

    sut = new GetStudentProfileUseCase(registrationsRepository)
  })

  it('should retrieve student profile successfully', async () => {
    const mockProfile = {
      document: '123456789',
      name: 'John Doe',
      sex: 'M',
      socialName: 'Johnny',
      genderId: 1,
      status: 'Active',
      birth: new Date('2000-01-01'),
      mail: 'john.doe@mail.com',
      race: 1,
      phone: {
        ddi: 55,
        ddd: 11,
        number: 1234567890,
      },
      country: 'Country',
      UF: 'UF',
      city: 'City',
      RG: 'RG123456',
      UFRG: 'UF123',
      issuingAgency: '1',
      addresses: [
        {
          type: 'Home',
          CEP: '12345-678',
          street: 'Street',
          number: '123',
          complement: 'Apt 1',
          neighborhood: 'Neighborhood',
          city: 'City',
          UF: 'UF',
          country: 'Country',
          phone: {
            ddi: 55,
            ddd: 11,
            number: 1234567890,
          },
        },
      ],
      parents: [
        {
          name: 'Parent Name',
          CPF: '12345678901',
          relation: 'Father',
          status: true,
        },
      ],
    }

    registrationsRepository.getStudentProfile.mockResolvedValue(mockProfile)

    const response = await sut.execute({ registration: '123' })

    expect(response).toEqual({
      document: '123456789',
      name: 'John Doe',
      sex: 'M',
      socialName: 'Johnny',
      genderId: 1,
      status: 'Active',
      birth: new Date('2000-01-01'),
      mail: 'john.doe@mail.com',
      race: 1,
      phone: {
        ddi: 55,
        ddd: 11,
        number: 1234567890,
      },
      country: 'Country',
      UF: 'UF',
      city: 'City',
      RG: 'RG123456',
      UFRG: 'UF123',
      issuingAgency: '1',
      addresses: [
        {
          type: 'Home',
          CEP: '12345-678',
          street: 'Street',
          number: '123',
          complement: 'Apt 1',
          neighborhood: 'Neighborhood',
          city: 'City',
          UF: 'UF',
          country: 'Country',
          phone: {
            ddi: 55,
            ddd: 11,
            number: 1234567890,
          },
        },
      ],
      parents: [
        {
          name: 'Parent Name',
          CPF: '12345678901',
          relation: 'Father',
          status: 'Ativo',
        },
      ],
    })
    expect(registrationsRepository.getStudentProfile).toHaveBeenCalledWith(
      '123'
    )
  })

  it('should throw StudentNotFoundError if student is not found', async () => {
    registrationsRepository.getStudentProfile.mockResolvedValue(null)

    await expect(sut.execute({ registration: '123' })).rejects.toBeInstanceOf(
      StudentNotFoundError
    )
    expect(registrationsRepository.getStudentProfile).toHaveBeenCalledWith(
      '123'
    )
  })

  it('should handle null values in the response', async () => {
    const mockProfile = {
      document: null,
      name: null,
      sex: null,
      socialName: null,
      genderId: null,
      status: null,
      birth: null,
      mail: null,
      race: null,
      phone: {
        ddi: null,
        ddd: null,
        number: null,
      },
      country: null,
      UF: null,
      city: null,
      RG: null,
      UFRG: null,
      issuingAgency: null,
      addresses: null,
      parents: null,
    }

    registrationsRepository.getStudentProfile.mockResolvedValue(mockProfile)

    const response = await sut.execute({ registration: '123' })

    expect(response).toEqual(mockProfile)
    expect(registrationsRepository.getStudentProfile).toHaveBeenCalledWith(
      '123'
    )
  })
})
