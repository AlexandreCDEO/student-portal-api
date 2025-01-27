import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { auth } from '../middlewares/auth.js'
import { makeGetStudentMessagesUseCase } from '@/use-cases/factories/make-get-student-messages-use-case.js'
import { z } from 'zod'

export async function GetStudentMessages(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student-messages',
      {
        schema: {
          tags: ['student'],
          summary: 'get student messages',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              messages: z.array(
                z.object({
                  id: z.number(),
                  title: z.string(),
                  date: z.date(),
                  message: z.string(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()
        const service = makeGetStudentMessagesUseCase()
        const result = await service.execute({ registration })
        return reply.status(200).send({ messages: result.studentMessages })
      }
    )
}
