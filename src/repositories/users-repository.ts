import type { OperationType } from '@/enums/operation-type.js'
import type { SecUser } from '@prisma/client'

export interface UsersRepository {
  create(user: SecUser): Promise<SecUser | null>
  update(userId: number, user: SecUser): Promise<SecUser | null>
  findByUsername(username: string): Promise<SecUser | null>
  findById(userId: number): Promise<SecUser | null>
  findByEmail(email: string): Promise<SecUser | null>
  changeUserPasswords(
    companyId: number,
    registration: string,
    newPassword: string
  ): Promise<boolean>

  cryptography(
    password: string,
    registrationDate: Date,
    operationType: OperationType
  ): Promise<string | null>
}
