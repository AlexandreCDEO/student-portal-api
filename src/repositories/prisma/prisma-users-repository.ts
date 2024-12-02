import { prisma } from '@/lib/prisma.js'
import type { UsersRepository } from '../users-repository.js'
import { OperationType } from '@/enums/operation-type.js'
import { TypeOccurrency } from '@/enums/type-occurrency.js'
import type { SecUser } from '@prisma/client'

export class PrismaUsersRepository implements UsersRepository {
  async changeUserPasswords(
    companyId: number,
    userId: number,
    newPassword: string
  ): Promise<boolean> {
    const result = await prisma.$queryRaw<
      { secuserid: number; secusername: string; secuserdataCadastro: Date }[]
    >`
      SELECT "secuserid", "secusername", "secuserdatacadastro" FROM "secuser"
      WHERE "secusername" IN (
        SELECT b."matriculacodigo" FROM "secparticipante" a
        JOIN "participante" c ON a."empresaid" = c."empresaid" AND a."participantecodigo" = c."participantecodigo"
        JOIN "participantefilial" d ON c."empresaid" = d."empresaid" AND c."participantecodigo" = d."participantecodigo"
        JOIN "matricula" b ON b."empresaid" = d."empresaid" AND b."alunoparticipantecod" = d."participantecodigo" AND b."alunoparticipantefilialcod" = d."participantefilialcodigo"
        WHERE a."empresaid" = ${companyId} AND a."secuserid" = ${userId})`

    if (result && result.length > 0) {
      const updatedUsers = await Promise.all(
        result.map(async user => {
          const encryptedPassword = await this.cryptography(
            newPassword,
            user.secuserdataCadastro,
            OperationType.CRIPTOGRAFAR
          )
          if (!encryptedPassword) {
            throw new Error(
              'Erro ao realizar a criptografia de senha. Tente novamente mais tarde!'
            )
          }

          return {
            secUserId: user.secuserid,
            secUserName: user.secusername,
            encryptedPassword,
          }
        })
      )

      try {
        const transactionPromises = updatedUsers.flatMap(user => [
          prisma.secUser.update({
            where: { secUserId: user.secUserId },
            data: {
              secUserPassword: user.encryptedPassword,
              secUserSenhaProvisoria: false,
            },
          }),

          prisma.secUserPass.create({
            data: {
              secUserId: user.secUserId,
              secUserPassData: new Date(),
              secUserPassReg: user.encryptedPassword,
            },
          }),

          prisma.usuOco.create({
            data: {
              usuCod: user.secUserName,
              usuDtaOco: new Date(),
              usuTipoOco: TypeOccurrency.TROCA_SENHA,
              usuCodDes: '[...]',
              usuMenOco: 'TROCA_SENHA',
            },
          }),
        ])

        await prisma.$transaction(transactionPromises)
        return true
      } catch (error) {
        throw new Error('Erro ao alterar a senha')
      }
    } else {
      return false
    }
  }

  async update(userId: number, user: SecUser): Promise<SecUser | null> {
    const updatedUser = await prisma.secUser.update({
      where: { secUserId: userId },
      data: user,
    })

    if (!updatedUser) return null

    return updatedUser
  }

  async findById(userId: number): Promise<SecUser | null> {
    const user = await prisma.secUser.findUnique({
      where: {
        secUserId: userId,
      },
    })
    if (!user) {
      return null
    }

    return user
  }

  async create(user: SecUser): Promise<SecUser | null> {
    const userCreated = await prisma.secUser.create({
      data: user,
    })

    if (!userCreated) {
      return null
    }

    return userCreated
  }

  async findByUsername(username: string): Promise<SecUser | null> {
    const user = await prisma.secUser.findFirst({
      where: {
        secUserName: username.toUpperCase(),
      },
    })

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string): Promise<SecUser | null> {
    const user = await prisma.secUser.findFirst({
      where: {
        secUserEmail: email.toUpperCase(),
      },
    })

    if (!user) {
      return null
    }

    return user
  }

  async cryptography(
    password: string,
    registrationDate: Date,
    operationType: OperationType
  ): Promise<string | null> {
    try {
      const result = await prisma.$queryRaw<[{ [key: string]: string }]>`
        select u_snd_cripstr(${password}, ${registrationDate.toISOString().replace('T', ' ').replace('Z', '')}::timestamp without time zone, ${operationType}::char) as result
      `

      if (result && result.length > 0) return result[0]?.result

      return null
    } catch (error) {
      throw new Error(
        `Erro ao ${operationType === 'E' ? 'criptografar' : 'descriptografar'} a senha`
      )
    }
  }
}
