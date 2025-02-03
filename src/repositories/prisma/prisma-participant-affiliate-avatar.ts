import { prisma } from '@/lib/prisma.js'
import type { ParticipantAffliateAvatarRepository } from '../participant-affliate-avatar.js'
import type { ParticipanteFilialAvatar } from '@prisma/client'

export class PrismaParticipantAffiliateAvatarRepository
  implements ParticipantAffliateAvatarRepository
{
  async getStudentAvatar(
    companyId: number,
    participant: number,
    participanteAffiliate: number
  ): Promise<ParticipanteFilialAvatar | null> {
    const studentAvatar = await prisma.participanteFilialAvatar.findFirst({
      where: {
        empresaId: companyId,
        participanteCodigo: participant,
        participanteFilialCodigo: participanteAffiliate,
        participanteFilialAvatarSeq: 1,
      },
    })

    return studentAvatar
  }

  async saveStudentAvatar(
    companyId: number,
    participant: number,
    participanteAffiliate: number,
    avatar: Buffer,
    name: string,
    type: string
  ): Promise<boolean> {
    const isRegisteredAvatar = await prisma.participanteFilialAvatar.findFirst({
      where: {
        empresaId: companyId,
        participanteCodigo: participant,
        participanteFilialCodigo: participanteAffiliate,
        participanteFilialAvatarSeq: 1,
      },
    })

    if (isRegisteredAvatar) {
      const updatedAvatar = await prisma.participanteFilialAvatar.updateMany({
        where: {
          empresaId: companyId,
          participanteCodigo: participant,
          participanteFilialCodigo: participanteAffiliate,
          participanteFilialAvatarSeq: 1,
        },
        data: {
          participanteFilialAvatar: avatar,
          participanteFilialAvatarName: name,
          participanteFilialAvatarExt: type,
        },
      })

      return !!updatedAvatar
    }

    const createdAvatar = await prisma.participanteFilialAvatar.create({
      data: {
        empresaId: companyId,
        participanteCodigo: participant,
        participanteFilialCodigo: participanteAffiliate,
        participanteFilialAvatarSeq: 1,
        participanteFilialAvatar: avatar,
        participanteFilialAvatarName: name,
        participanteFilialAvatarExt: type,
      },
    })

    return !!createdAvatar
  }
}
