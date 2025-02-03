import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { makeGetStudentAvatarUseCase } from '@/use-cases/factories/make-get-student-avatar .js'

export async function getStudentAvatar(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student/avatar',
      {
        schema: {
          tags: ['student'],
          summary: 'get user avatar',
          security: [{ bearerAuth: [] }],
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()

        const service = makeGetStudentAvatarUseCase()

        const avatar = await service.execute({
          registration,
        })

        if (!avatar || !avatar.participanteFilialAvatar) {
          return reply.status(200).send({ avatar: null })
        }

        const studentAvatar = Buffer.from(avatar.participanteFilialAvatar)
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        reply.type(avatar?.participanteFilialAvatarExt!)

        return reply.status(200).send(studentAvatar)
      }
    )
}
