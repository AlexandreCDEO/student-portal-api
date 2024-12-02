export enum UserStatus {
  ACTIVE = 'S',
  INACTIVE = 'N',
}

export function convertToUserStatus(value: string): UserStatus {
  if (Object.values(UserStatus).includes(value as UserStatus)) {
    return value as UserStatus
  }

  throw new Error(`Valor inválido para o status de usuário`)
}
