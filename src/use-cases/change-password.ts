import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { SecuryPoliciesRepository } from '@/repositories/secury-policies-repository.js'
import type { UsersRepository } from '@/repositories/users-repository.js'
import type { SecUser } from '@prisma/client'
import { WrongCredentialsError } from './_errors/wrong-credentials-errors.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { PasswordMissmatchError } from './_errors/password-missmatch-error.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { SecuryPolicyType } from '@/enums/security-policy-type.js'
import { MinumunNumberDigitsForPasswordError } from './_errors/minimun-number-digits-password-error.js'
import { PasswordOnlyNumbersError } from './_errors/password-only-numbers-error.js'
import { PasswordNoSpecialCharactersError } from './_errors/password-no-special-characters-error.js'
import { PasswordComplexityError } from './_errors/password-complexity-error.js'
import { OperationType } from '@/enums/operation-type.js'
import { PasswordEncryptionError } from './_errors/password-encryption-error.js'
import { UserUpdateError } from './_errors/user-update-error.js'
import { InvalidCurrentPasswordError } from './_errors/invalid-current-password-error.js'
import { NewPasswordEqualError } from './_errors/new-password-equal-error.js'
import { PasswordIsEmptyError } from './_errors/password-is-empty-error.js'

interface ChangePasswordUseCaseRequest {
  userId: number
  registration: string | null
  password: string
  newPassword: string
  confirmPassword: string
}

interface ChangePasswordUseCaseResponse {
  isSuccess: boolean
}

export class ChangePasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private securyPoliciesRepository: SecuryPoliciesRepository,
    private companyGroupRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository
  ) {}

  async execute({
    userId,
    registration,
    password,
    newPassword,
    confirmPassword,
  }: ChangePasswordUseCaseRequest): Promise<ChangePasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) throw new WrongCredentialsError()

    const passwordMatchesError = await this.passwordMatchesValidate(
      user,
      password,
      newPassword
    )

    if (passwordMatchesError) throw passwordMatchesError
    if (newPassword !== confirmPassword) throw new PasswordMissmatchError()
    const companyGroup = await this.findCompanyGroup()
    if (!companyGroup) throw new MainGroupOfCompaniesNotExistsError()

    const companyId = await this.findCompanyDefinedAsMain(companyGroup)
    if (!companyId) throw new CompanyDefinedAsMainNotExistsError()

    const MinimunNumberOfDigitsForPassword =
      await this.securyPoliciesRepository.searchSecuryPolicyByType(
        companyId,
        SecuryPolicyType.TAMANHO
      )

    if (
      MinimunNumberOfDigitsForPassword &&
      newPassword.length < MinimunNumberOfDigitsForPassword
    )
      throw new MinumunNumberDigitsForPasswordError(
        MinimunNumberOfDigitsForPassword
      )

    const passwordCompositionCriteria =
      await this.securyPoliciesRepository.searchSecuryPolicyByType(
        companyId,
        SecuryPolicyType.COMPOSICAO
      )

    if (passwordCompositionCriteria) {
      switch (passwordCompositionCriteria) {
        case 1: // Apenas Números
          if (!/^\d+$/.test(newPassword)) {
            throw new PasswordOnlyNumbersError()
          }
          break

        case 2: // Apenas Números e caracteres alfanuméricos
          if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
            throw new PasswordNoSpecialCharactersError()
          }
          break

        case 3: // Números, alfanuméricos e caracteres especiais
          if (
            !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/.test(
              newPassword
            )
          ) {
            throw new PasswordComplexityError()
          }
          break
      }
    }

    if (!user.secUserDataCadastro) {
      throw new PasswordIsEmptyError()
    }

    const hashedPassword = await this.usersRepository.cryptography(
      newPassword,
      user.secUserDataCadastro,
      OperationType.CRIPTOGRAFAR
    )
    if (!hashedPassword) throw new PasswordEncryptionError()

    const isSuccessfullyChanged =
      await this.usersRepository.changeUserPasswords(
        companyId,
        registration ? registration : user.secUserName,
        newPassword
      )

    if (!isSuccessfullyChanged) throw new UserUpdateError()

    return {
      isSuccess: isSuccessfullyChanged,
    }
  }

  private async passwordMatchesValidate(
    student: SecUser,
    password: string,
    newPassword: string
  ): Promise<Error | null> {
    if (!student.secUserPassword || !student.secUserDataCadastro) {
      throw new PasswordIsEmptyError()
    }

    const decryptedPassword = await this.usersRepository.cryptography(
      student.secUserPassword,
      student.secUserDataCadastro,
      OperationType.DESCRIPTOGRAFAR
    )

    if (!decryptedPassword) throw new PasswordEncryptionError()

    if (decryptedPassword !== password) throw new InvalidCurrentPasswordError()

    if (newPassword === decryptedPassword) throw new NewPasswordEqualError()
    return null
  }

  private async findCompanyGroup(): Promise<number | null> {
    return this.companyGroupRepository.searchMainGroupOfCompanies()
  }

  private async findCompanyDefinedAsMain(
    companyGroup: number
  ): Promise<number | null> {
    return this.companyCompanyGroupsRepository.searchCompanyDefinedAsMain(
      companyGroup
    )
  }
}
