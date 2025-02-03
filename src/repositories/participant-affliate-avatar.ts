import type { ParticipanteFilialAvatar } from '@prisma/client'

export interface ParticipantAffliateAvatarRepository {
  getStudentAvatar(
    companyId: number,
    participant: number,
    participanteAffiliate: number
  ): Promise<ParticipanteFilialAvatar | null>

  saveStudentAvatar(
    companyId: number,
    participant: number,
    participanteAffiliate: number,
    avatar: Buffer,
    name: string,
    type: string
  ): Promise<boolean>
}
