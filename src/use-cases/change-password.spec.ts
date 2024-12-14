import type { UsersRepository } from '@/repositories/users-repository.js'
import type { SecuryPoliciesRepository } from '@/repositories/secury-policies-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import { ChangePasswordUseCase } from './change-password.js'
import { WrongCredentialsError } from './_errors/wrong-credentials-errors.js'
import { PasswordMissmatchError } from './_errors/password-missmatch-error.js'
import { PasswordEncryptionError } from './_errors/password-encryption-error.js'
import { NewPasswordEqualError } from './_errors/new-password-equal-error.js'
import { InvalidCurrentPasswordError } from './_errors/invalid-current-password-error.js'
import { MinumunNumberDigitsForPasswordError } from './_errors/minimun-number-digits-password-error.js'
import { PasswordOnlyNumbersError } from './_errors/password-only-numbers-error.js'
import { PasswordNoSpecialCharactersError } from './_errors/password-no-special-characters-error.js'
import { PasswordComplexityError } from './_errors/password-complexity-error.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { UserUpdateError } from './_errors/user-update-error.js'
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest'
import { UserStatus } from '@/enums/user-status.js'
import type { SecUser } from '@prisma/client'

describe('Alterar senha (change-password)', () => {
  let repository: Mocked<UsersRepository>
  let securyPoliciesRepository: Mocked<SecuryPoliciesRepository>
  let companyGroupRepository: Mocked<CompanyGroupsRepository>
  let companyCompanyGroupsRepository: Mocked<CompanyCompanyGroupsRepository>

  let sut: ChangePasswordUseCase

  beforeEach(() => {
    repository = {
      searchUsers: vi.fn(),
      countUsers: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findByUsername: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      changeUserPasswords: vi.fn(),
      cryptography: vi.fn(),
    } as unknown as Mocked<UsersRepository>

    securyPoliciesRepository = {
      searchSecuryPolicyByType: vi.fn(),
    } as unknown as Mocked<SecuryPoliciesRepository>

    companyGroupRepository = {
      searchMainGroupOfCompanies: vi.fn(),
    } as unknown as Mocked<CompanyGroupsRepository>

    companyCompanyGroupsRepository = {
      searchCompanyDefinedAsMain: vi.fn(),
    } as unknown as Mocked<CompanyCompanyGroupsRepository>

    sut = new ChangePasswordUseCase(
      repository,
      securyPoliciesRepository,
      companyGroupRepository,
      companyCompanyGroupsRepository
    )
  })

  it('Deve retornar erro quando não encontrar o usuário informado (change-password)', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(() =>
      sut.execute({
        userId: 1,
        password: 'currentPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      })
    ).rejects.toBeInstanceOf(WrongCredentialsError)
  })

  it('Deve retornar erro quando a senha atual estiver incorreta (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('incorrectHashedPassword')

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'password',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword',
      })
    ).rejects.toBeInstanceOf(InvalidCurrentPasswordError)
  })

  it('Deve retornar erro quando a nova e confirmação forem diferentes (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('password')

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'password',
        newPassword: 'newPassword',
        confirmPassword: 'IncorrectNewPassword',
      })
    ).rejects.toBeInstanceOf(PasswordMissmatchError)
  })

  it('Deve retornar erro caso seja enviada nova senha igual à senha atual (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('password')

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'password',
        newPassword: 'password',
        confirmPassword: 'password',
      })
    ).rejects.toBeInstanceOf(NewPasswordEqualError)
  })

  it('Deve retornar erro quando falhar a criptografia de senha (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue(null)

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'password',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword',
      })
    ).rejects.toBeInstanceOf(PasswordEncryptionError)
  })

  it('Deve retornar erro quando o grupo principal da empresa não existe (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('teste@123')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(null)

    await expect(() =>
      sut.execute({
        userId: 1,
        password: 'teste@123',
        newPassword: 'teste@1234',
        confirmPassword: 'teste@1234',
      })
    ).rejects.toBeInstanceOf(MainGroupOfCompaniesNotExistsError)
  })

  it('Deve retornar erro quando a empresa principal não existe (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('teste@123')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      null
    )

    await expect(() =>
      sut.execute({
        userId: 1,
        password: 'teste@123',
        newPassword: 'teste@1234',
        confirmPassword: 'teste@1234',
      })
    ).rejects.toBeInstanceOf(CompanyDefinedAsMainNotExistsError)
  })

  it('Deve retornar erro quando a nova senha não atende ao tamanho mínimo (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )
    securyPoliciesRepository.searchSecuryPolicyByType.mockResolvedValueOnce(8) // Tamanho mínimo da senha

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'decryptedPassword',
        newPassword: 'short',
        confirmPassword: 'short',
      })
    ).rejects.toBeInstanceOf(MinumunNumberDigitsForPasswordError)
  })

  it('Deve retornar erro quando a nova senha contém caracteres não permitidos (apenas números) (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(1) // Critério: Apenas números

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'decryptedPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      })
    ).rejects.toBeInstanceOf(PasswordOnlyNumbersError)
  })

  it('Deve retornar erro quando a nova senha contém caracteres especiais não permitidos (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2) // Critério: Apenas números e letras

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'decryptedPassword',
        newPassword: 'password@123',
        confirmPassword: 'password@123',
      })
    ).rejects.toBeInstanceOf(PasswordNoSpecialCharactersError)
  })

  it('Deve retornar erro quando a nova senha não contém a complexidade exigida (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3) // Critério: Complexidade

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'decryptedPassword',
        newPassword: 'simplepassword',
        confirmPassword: 'simplepassword',
      })
    ).rejects.toBeInstanceOf(PasswordComplexityError)
  })

  it('Deve retornar erro quando falha a atualização dos dados do usuário (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3) // Critério: Complexidade
    repository.changeUserPasswords.mockResolvedValue(false)

    await expect(() =>
      sut.execute({
        userId: user.secUserId,
        password: 'decryptedPassword',
        newPassword: 'simple@password123',
        confirmPassword: 'simple@password123',
      })
    ).rejects.toBeInstanceOf(UserUpdateError)
  })

  it('Deve alterar a senha corretamente quando tudo estiver correto (change-password)', async () => {
    const user: SecUser = {
      secUserId: 1,
      secUserActive: true,
      secUserBloqueado: false,
      secUserDataCadastro: new Date(),
      secUserEmail: 'mail@mail.com',
      secUserName: 'student',
      secUserPassword: 'passwordHash',
      secUserSenhaProvisoria: false,
      secUserStatus: UserStatus.ACTIVE,
      secUserNameComp: 'jhon Doe',
    }

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3) // Critério: Complexidade
    repository.changeUserPasswords.mockResolvedValue(true)

    await expect(
      sut.execute({
        userId: user.secUserId,
        password: 'decryptedPassword',
        newPassword: 'simple@password123',
        confirmPassword: 'simple@password123',
      })
    ).resolves.toHaveProperty('isSuccess', true)
  })
})
