import { prisma } from '@/lib/prisma.js'
import type { UsersRepository } from '../users-repository.js'
import { OperationType } from '@/enums/operation-type.js'
import { TypeOccurrency } from '@/enums/type-occurrency.js'
import type { SecUser } from '@prisma/client'

export class PrismaUsersRepository implements UsersRepository {
  async changeUserPasswords(
    companyId: number,
    registration: string,
    newPassword: string
  ): Promise<boolean> {
    const participant = await prisma.matricula.findFirst({
      where: {
        empresaId: companyId,
        matriculaCodigo: registration.trim(),
      },
      select: {
        alunoParticipanteCod: true,
        alunoParticipanteFilialCod: true,
      },
    })
    const registrationsData = await prisma.matricula.findMany({
      where: {
        alunoParticipanteCod: participant?.alunoParticipanteCod,
        alunoParticipanteFilialCod: participant?.alunoParticipanteFilialCod,
      },
      select: {
        matriculaCodigo: true,
      },
    })

    const registrations = registrationsData.map(registrationData =>
      registrationData.matriculaCodigo.trim()
    )

    const users = await prisma.secUser.findMany({
      where: {
        secUserName: {
          in: registrations,
        },
      },
      select: {
        secUserId: true,
        secUserName: true,
        secUserDataCadastro: true,
      },
    })

    console.log('USERS => ', users)
    if (users && users.length > 0) {
      const updatedUsers = await Promise.all(
        users.map(async user => {
          if (!user.secUserDataCadastro)
            throw new Error('Dados inválidos no cadastro do aluno.')

          const encryptedPassword = await this.cryptography(
            newPassword,
            user.secUserDataCadastro,
            OperationType.CRIPTOGRAFAR
          )

          if (!encryptedPassword) {
            throw new Error(
              'Erro ao realizar a criptografia de senha. Tente novamente mais tarde!'
            )
          }

          return {
            secUserId: user.secUserId,
            secUserName: user.secUserName,
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
