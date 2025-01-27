import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { auth } from '../middlewares/auth.js'
import { z } from 'zod'
import { makeGetStudentMessageUseCase } from '@/use-cases/factories/make-get-student-message-use-case.js'

export async function GetStudentMessage(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student-message',
      {
        schema: {
          tags: ['student'],
          summary: 'get student messages',
          security: [{ bearerAuth: [] }],
          body: z.object({
            id: z.number(),
          }),
          response: {
            200: z.object({
              id: z.number(),
              title: z.string(),
              date: z.date(),
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()

        const service = makeGetStudentMessageUseCase()

        const result = await service.execute({
          MessageId: request.body.id,
        })

        return reply.status(200).send(result)
      }
    )
}
