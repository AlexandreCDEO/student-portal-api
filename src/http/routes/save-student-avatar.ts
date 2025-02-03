import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { auth } from '../middlewares/auth.js'
import { makeSaveStudentAvatarUseCase } from '@/use-cases/factories/make-save-student-avatar.js'

export async function saveStudentAvatar(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/student/avatar',
      {
        schema: {
          tags: ['student'],
          summary: 'save user avatar',
          consumes: ['multipart/form-data'],
          security: [{ bearerAuth: [] }],
          response: {
            201: z.null().describe('Image uploaded'),
            400: z.object({ message: z.string() }).describe('File not found'),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()

        const uploadedFile = await request.file({
          limits: {
            fileSize: 1024 * 1024 * 3, // 3MB
          },
        })

        const avatar = await uploadedFile?.toBuffer()

        if (!uploadedFile || !avatar) {
          return reply.status(400).send({ message: 'File not found' })
        }

        const service = makeSaveStudentAvatarUseCase()

        await service.execute({
          registration,
          avatar,
          name: uploadedFile.filename,
          type: uploadedFile.mimetype,
        })

        return reply.status(201).send()
      }
    )
}
