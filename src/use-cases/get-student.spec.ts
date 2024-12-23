import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { GetStudentProfileUseCase } from './get-student-profile.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'

describe('GetStudentProfileUseCase', () => {
  let registrationRepository: Mocked<RegistrationsRepository>
  let sut: GetStudentProfileUseCase

  beforeEach(() => {
    registrationRepository = {
      getStudentProfile: vi.fn(),
    } as unknown as Mocked<RegistrationsRepository>

    sut = new GetStudentProfileUseCase(registrationRepository)
  })

  it('Deve retornar Perfil do estudante(get-student-spec.ts)', async () => {
    const mockData = {
      document: '123456789',
      name: 'John Doe',
      sex: 'M',
      socialName: 'Johnny',
      genderId: 1,
      status: 'Active',
      birth: new Date('2000-01-01'),
      mail: 'john.doe@example.com',
      race: 1,
      phone: '1234567890',
      country: 1,
      UF: 'CA',
      city: 1,
      RG: '987654321',
      UFRG: 'CA',
      issuingAgency: 1,
      addresses: [
        {
          type: 'Home',
          CEP: '90001',
          street: 'Main St',
          number: '123',
          complement: 'Apt 4',
          neighborhood: 'Downtown',
          city: 1,
          UF: 'CA',
          country: 1,
        },
      ],
      parents: [
        {
          name: 'Jane Doe',
          CPF: '12345678901',
          relation: 'Mother',
          status: true,
        },
      ],
    }

    registrationRepository.getStudentProfile.mockResolvedValue(mockData)

    const result = await sut.execute({ registration: '123456' })

    expect(result).toEqual({
      document: '123456789',
      name: 'John Doe',
      sex: 'M',
      socialName: 'Johnny',
      genderId: 1,
      status: 'Active',
      birth: new Date('2000-01-01'),
      mail: 'john.doe@example.com',
      race: 1,
      phone: '1234567890',
      country: '1',
      UF: 'CA',
      city: '1',
      RG: '987654321',
      UFRG: 'CA',
      issuingAgency: '1',
      addresses: [
        {
          type: 'Home',
          CEP: '90001',
          street: 'Main St',
          number: '123',
          complement: 'Apt 4',
          neighborhood: 'Downtown',
          city: '1',
          UF: 'CA',
          country: '1',
        },
      ],
      parents: [
        {
          name: 'Jane Doe',
          CPF: '12345678901',
          relation: 'Mother',
          status: 'Ativo',
        },
      ],
    })
  })

  it('Deve retornar erro quando não encontrar estudante para matrícula informada(get-student-spec.ts)', async () => {
    registrationRepository.getStudentProfile.mockResolvedValue(null)

    await expect(
      sut.execute({ registration: '123456' })
    ).rejects.toBeInstanceOf(StudentNotFoundError)
  })
})
