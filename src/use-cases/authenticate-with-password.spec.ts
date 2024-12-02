import type { UsersRepository } from '@/repositories/users-repository.js'
import type {
  RegistrationsRepository,
  RegistrationWithCourse,
} from '@/repositories/registrations-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { SecuryPoliciesRepository } from '@/repositories/secury-policies-repository.js'
import type { SecUserPassRepository } from '@/repositories/secuser-pass-repository.js'
import type { UserOccurrenciesRepository } from '@/repositories/user-occurrencies-repository.js'
import type { SecUser, UsuOco } from '@prisma/client'
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest'
import {
  AuthenticateWithPassword,
  type RegistrationData,
} from './authenticate-with-password.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { StudentBlockedError } from './_errors/student-blocked-error.js'
import { PasswordIsEmptyError } from './_errors/password-is-empty-error.js'
import { TypeOccurrency } from '@/enums/type-occurrency.js'
import { subDays } from 'date-fns'
import { WrongCredentialsError } from './_errors/wrong-credentials-errors.js'
import { UserOccurrencyError } from './_errors/user-occurrenct-error.js'

describe('Autenticar com senha (authenticate-with-password.ts)', () => {
  let usersRepository: Mocked<UsersRepository>
  let registrationsRepository: Mocked<RegistrationsRepository>
  let companyGroupRepository: Mocked<CompanyGroupsRepository>
  let companyCompanyGroupsRepository: Mocked<CompanyCompanyGroupsRepository>
  let securyPoliciesRepository: Mocked<SecuryPoliciesRepository>
  let secUserPassRepository: Mocked<SecUserPassRepository>
  let userOccurrenciesRepository: Mocked<UserOccurrenciesRepository>

  let sut: AuthenticateWithPassword

  beforeEach(() => {
    usersRepository = {
      create: vi.fn(),
      findByUsername: vi.fn(),
      cryptography: vi.fn(),
    } as unknown as Mocked<UsersRepository>

    registrationsRepository = {
      findByDocument: vi.fn(),
    } as unknown as Mocked<RegistrationsRepository>

    companyGroupRepository = {
      searchMainGroupOfCompanies: vi.fn(),
    } as unknown as Mocked<CompanyGroupsRepository>

    companyCompanyGroupsRepository = {
      searchCompanyDefinedAsMain: vi.fn(),
    } as unknown as Mocked<CompanyCompanyGroupsRepository>

    securyPoliciesRepository = {
      searchSecuryPolicyByType: vi.fn(),
    } as unknown as Mocked<SecuryPoliciesRepository>

    secUserPassRepository = {
      searchByUserId: vi.fn(),
    } as unknown as Mocked<SecUserPassRepository>

    userOccurrenciesRepository = {
      create: vi.fn(),
    } as unknown as Mocked<UserOccurrenciesRepository>

    sut = new AuthenticateWithPassword(
      usersRepository,
      registrationsRepository,
      companyGroupRepository,
      companyCompanyGroupsRepository,
      securyPoliciesRepository,
      secUserPassRepository,
      userOccurrenciesRepository
    )
  })

  it('Deve retornar erro quando não encontrar o grupo de empresas (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(null)

    await expect(() =>
      sut.execute({
        username: 'username',
        password: 'password',
      })
    ).rejects.toBeInstanceOf(MainGroupOfCompaniesNotExistsError)
  })

  it('Deve retornar erro quando não encontrar empresa definida como principal (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      null
    )

    await expect(() =>
      sut.execute({
        username: 'username',
        password: 'password',
      })
    ).rejects.toBeInstanceOf(CompanyDefinedAsMainNotExistsError)
  })

  it('Deve retornar erro quando estudante estiver bloqueado (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const user: SecUser = {
      secUserId: 1,
      secUserName: 'student',
      secUserActive: true,
      secUserBloqueado: true,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserNameComp: 'Jhon Doe',
      secUserPassword: 'hashedPassword',
      secUserSenhaProvisoria: false,
      secUserStatus: 'S',
    }

    usersRepository.create.mockResolvedValue(user)

    usersRepository.findByUsername.mockResolvedValue(user)

    await expect(() =>
      sut.execute({
        username: 'student',
        password: 'password',
      })
    ).rejects.toBeInstanceOf(StudentBlockedError)
  })

  it('Deve retornar erro quando a senha do estudante estiver vazia (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const user: SecUser = {
      secUserId: 1,
      secUserName: 'student',
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserNameComp: 'Jhon Doe',
      secUserPassword: '',
      secUserSenhaProvisoria: false,
      secUserStatus: 'S',
    }

    usersRepository.create.mockResolvedValueOnce(user)

    usersRepository.findByUsername.mockResolvedValue(user)

    await expect(() =>
      sut.execute({
        username: 'student',
        password: 'password',
      })
    ).rejects.toBeInstanceOf(PasswordIsEmptyError)
  })

  it('Deve retornar sucesso quando as credenciais forem válidas (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const user: SecUser = {
      secUserId: 1,
      secUserName: 'student',
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserNameComp: 'Jhon Doe',
      secUserPassword: 'hashedPassword',
      secUserSenhaProvisoria: false,
      secUserStatus: 'S',
    }

    const userOccurrencie: UsuOco = {
      usuCod: 'student',
      usuDtaOco: new Date(),
      usuTipoOco: TypeOccurrency.LOGIN,
      usuCodDes: '',
      usuMenOco: 'SIS',
      usuOcoTst: '',
    }

    usersRepository.create.mockResolvedValueOnce(user)

    userOccurrenciesRepository.create.mockResolvedValue(userOccurrencie)

    usersRepository.findByUsername.mockResolvedValue(user)

    usersRepository.cryptography.mockResolvedValue('123456')

    await expect(
      sut.execute({
        username: 'student',
        password: '123456',
      })
    ).resolves.toHaveProperty('student', user)
  })

  it('Deve solicitar a troca de senha quando a senha for temporária (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const user: SecUser = {
      secUserId: 1,
      secUserName: 'student',
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserNameComp: 'Jhon Doe',
      secUserPassword: 'hashedPassword',
      secUserSenhaProvisoria: true,
      secUserStatus: 'S',
    }

    usersRepository.findByUsername.mockResolvedValue(user)
    usersRepository.cryptography.mockResolvedValue('123456')

    await expect(
      sut.execute({
        username: 'student',
        password: '123456',
      })
    ).resolves.toHaveProperty('shouldChangePassword', true)
  })

  it('Deve solicitar a troca de senha quando a senha estiver expirada (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const user: SecUser = {
      secUserId: 1,
      secUserName: 'student',
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserNameComp: 'Jhon Doe',
      secUserPassword: 'hashedPassword',
      secUserSenhaProvisoria: true,
      secUserStatus: 'S',
    }

    const fiveDaysAgo = subDays(new Date(), 5)

    usersRepository.findByUsername.mockResolvedValue(user)
    usersRepository.cryptography.mockResolvedValue('123456')
    securyPoliciesRepository.searchSecuryPolicyByType.mockResolvedValue(1)
    secUserPassRepository.searchByUserId.mockResolvedValue(fiveDaysAgo)

    const result = await sut.execute({
      username: 'student',
      password: '123456',
    })

    expect(result).toHaveProperty('shouldChangePassword', true)
  })

  it('Deve retornar erro quando o usuário não for encontrado (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    usersRepository.findByUsername.mockResolvedValue(null)

    await expect(() =>
      sut.execute({
        username: 'username',
        password: 'password',
      })
    ).rejects.toBeInstanceOf(WrongCredentialsError)
  })

  it('Deve retornar erro se a senha estiver incorreta (authenticate-with-password.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const user: SecUser = {
      secUserId: 1,
      secUserName: 'student',
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserNameComp: 'Jhon Doe',
      secUserPassword: 'hashedPassword',
      secUserSenhaProvisoria: true,
      secUserStatus: 'S',
    }

    usersRepository.findByUsername.mockResolvedValue(user)
    usersRepository.cryptography.mockResolvedValue('123456')

    await expect(() =>
      sut.execute({
        username: 'student',
        password: '123',
      })
    ).rejects.toBeInstanceOf(WrongCredentialsError)
  })

  it('Deve retornar array de matrículas quando o username ou documento corresponder a várias matrículas (authenticate-student)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const registrations: RegistrationWithCourse[] = [
      {
        matriculaCodigo: 'MAT20230001',
        matriculaSituacaoAcademica: 'A',
        matriculaIdPf: '123.456.789-00',
        matriculaIdMoodle: 'moodle_001',
        matriculaSituacaoAluno: true,
        matriculaDataCadastro: new Date('2023-01-01'),
        periodoEscolarId: 1,
        periodoEscolarAtualId: 1,
        empresaId: 1,
        cursoCodigo: BigInt(101),
        cursoNome: 'ADS',
        turmaCodigo: 1001,
        alunoParticipanteCod: BigInt(2001),
        alunoParticipanteFilialCod: 10,
      },
      {
        matriculaCodigo: 'MAT20230002',
        matriculaSituacaoAcademica: 'I',
        matriculaIdPf: '987.654.321-00',
        matriculaIdMoodle: 'moodle_002',
        matriculaSituacaoAluno: false,
        matriculaDataCadastro: new Date('2023-02-15'),
        periodoEscolarId: 2,
        periodoEscolarAtualId: 2,
        empresaId: 1,
        cursoCodigo: BigInt(102),
        cursoNome: 'Engenharia da Computação',
        turmaCodigo: 1002,
        alunoParticipanteCod: BigInt(2002),
        alunoParticipanteFilialCod: 12,
      },
      {
        matriculaCodigo: 'MAT20230003',
        matriculaSituacaoAcademica: 'A',
        matriculaIdPf: '111.222.333-44',
        matriculaIdMoodle: 'moodle_003',
        matriculaSituacaoAluno: true,
        matriculaDataCadastro: new Date('2023-03-20'),
        periodoEscolarId: 3,
        periodoEscolarAtualId: 3,
        empresaId: 1,
        cursoCodigo: BigInt(103),
        cursoNome: 'Sistemas da Informação',
        turmaCodigo: 1003,
        alunoParticipanteCod: BigInt(2003),
        alunoParticipanteFilialCod: 15,
      },
    ]

    const registrationCodes: RegistrationData[] = [
      { code: 'MAT20230001', course: 'ADS' },
      { code: 'MAT20230002', course: 'Engenharia da Computação' },
      { code: 'MAT20230003', course: 'Sistemas da Informação' },
    ]

    registrationsRepository.findByDocument.mockResolvedValue(registrations)

    const result = await sut.execute({
      username: 'username',
      password: 'password',
    })

    expect(result).toHaveProperty('registrations', registrationCodes)
  })

  it('Deve retornar erro se ocorrer erro ao gerar ocorrência de login (authenticate-student)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    const user: SecUser = {
      secUserId: 1,
      secUserName: 'student',
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserNameComp: 'Jhon Doe',
      secUserPassword: 'hashedPassword',
      secUserSenhaProvisoria: false,
      secUserStatus: 'S',
    }

    usersRepository.findByUsername.mockResolvedValue(user)
    usersRepository.cryptography.mockResolvedValue('123456')
    userOccurrenciesRepository.create.mockResolvedValue(null)

    await expect(() =>
      sut.execute({
        username: 'student',
        password: '123456',
      })
    ).rejects.toBeInstanceOf(UserOccurrencyError)
  })
})
