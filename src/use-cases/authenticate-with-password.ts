import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type {
  RegistrationsRepository,
  RegistrationWithCourse,
} from '@/repositories/registrations-repository.js'
import type { SecuryPoliciesRepository } from '@/repositories/secury-policies-repository.js'
import type { SecUserPassRepository } from '@/repositories/secuser-pass-repository.js'
import type { UserOccurrenciesRepository } from '@/repositories/user-occurrencies-repository.js'
import type { UsersRepository } from '@/repositories/users-repository.js'
import type { Matricula as Registration, SecUser as User } from '@prisma/client'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { WrongCredentialsError } from './_errors/wrong-credentials-errors.js'
import { UserOccurrencyError } from './_errors/user-occurrenct-error.js'
import { TypeOccurrency } from '@/enums/type-occurrency.js'
import { SecuryPolicyType } from '@/enums/security-policy-type.js'
import { addDays } from 'date-fns'
import { StudentBlockedError } from './_errors/student-blocked-error.js'
import { PasswordIsEmptyError } from './_errors/password-is-empty-error.js'
import { OperationType } from '@/enums/operation-type.js'
import { PasswordEncryptionError } from './_errors/password-encryption-error.js'

interface AuthenticateWithPasswordRequest {
  username: string
  password: string
}

export interface RegistrationData {
  code: string
  course?: string | null
}

interface AuthenticateWithPasswordResponse {
  student?: User
  registrations?: RegistrationData[]
  shouldChangePassword: boolean
}

export class AuthenticateWithPassword {
  constructor(
    private usersRepository: UsersRepository,
    private registrationsRepository: RegistrationsRepository,
    private companyGroupRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private securyPoliciesRepository: SecuryPoliciesRepository,
    private secUserPassRepository: SecUserPassRepository,
    private userOccurrenciesRepository: UserOccurrenciesRepository
  ) {}

  async execute({
    username,
    password,
  }: AuthenticateWithPasswordRequest): Promise<AuthenticateWithPasswordResponse> {
    const companyGroup = await this.findCompanyGroup()
    if (!companyGroup) throw new MainGroupOfCompaniesNotExistsError()

    const companyId = await this.findCompanyDefinedAsMain(companyGroup)
    if (!companyId) throw new CompanyDefinedAsMainNotExistsError()

    const result = await this.findStudentByUsernameOrDocument(
      companyId,
      username
    )

    if (!result) throw new WrongCredentialsError()

    if (Array.isArray(result)) {
      const registrations: RegistrationData[] = result.map(registration => ({
        code: registration.matriculaCodigo,
        course: registration.cursoNome,
      }))

      return {
        student: undefined,
        shouldChangePassword: false,
        registrations,
      }
    }

    const studentFromRegistration = result

    const studentValidationError = this.validateStudent(studentFromRegistration)
    if (studentValidationError) throw studentValidationError

    const passwordMatchesError = await this.passwordMatchesValidate(
      studentFromRegistration,
      password
    )

    if (passwordMatchesError) throw passwordMatchesError

    const passwordExpired = await this.isPasswordExpired(
      studentFromRegistration.secUserId,
      companyId
    )

    if (passwordExpired || studentFromRegistration.secUserSenhaProvisoria)
      return {
        student: studentFromRegistration,
        shouldChangePassword: true,
        registrations: [],
      }

    const userOccurrencyCreated = await this.createUserOccurrency(username)
    if (!userOccurrencyCreated) throw new UserOccurrencyError()
    return {
      student: studentFromRegistration,
      shouldChangePassword: false,
      registrations: [],
    }
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

  private async createUserOccurrency(username: string): Promise<boolean> {
    const occurrency = await this.userOccurrenciesRepository.create(
      username,
      new Date(),
      TypeOccurrency.LOGIN,
      'ACESSO SIS',
      ''
    )

    return !!occurrency
  }

  private async isPasswordExpired(
    studentId: number,
    companyId: number
  ): Promise<boolean> {
    const expirationDays =
      await this.securyPoliciesRepository.searchSecuryPolicyByType(
        companyId,
        SecuryPolicyType.EXPIRACAO
      )

    const lastPasswordChange =
      await this.secUserPassRepository.searchByUserId(studentId)

    if (!expirationDays || expirationDays === 999 || !lastPasswordChange)
      return false

    return addDays(lastPasswordChange, expirationDays) < new Date()
  }

  private validateStudent(student: User): Error | null {
    if (student.secUserBloqueado) throw new StudentBlockedError()
    if (!student.secUserPassword) throw new PasswordIsEmptyError()
    return null
  }

  private async findStudentByUsernameOrDocument(
    companyId: number,
    username: string
  ): Promise<User | null | RegistrationWithCourse[]> {
    const student = await this.usersRepository.findByUsername(username)
    if (student) return student

    const registrations = await this.registrationsRepository.findByDocument(
      companyId,
      username
    )

    if (registrations) {
      if (registrations.length > 1) {
        return registrations
      }

      if (registrations.length === 1) {
        return this.usersRepository.findByUsername(
          registrations[0].matriculaCodigo
        )
      }
    }

    return null
  }

  private async passwordMatchesValidate(
    student: User,
    password: string
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

    if (decryptedPassword.trim() !== password.trim())
      return new WrongCredentialsError()

    return null
  }
}
