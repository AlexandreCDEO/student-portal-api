import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { makeGetStudentCardDataUseCase } from '@/use-cases/factories/make-get-student-card.js'

export async function getStudentCard(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student/card',
      {
        schema: {
          tags: ['student'],
          summary: 'get student card',
          security: [{ bearerAuth: [] }],
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()
        const service = makeGetStudentCardDataUseCase()
        const result = await service.execute({ registration })
        return reply.status(200).send(result)
      }
    )
}
