import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { z } from 'zod'
import { makeGetStudentFrequencyUseCase } from '@/use-cases/factories/make-get-student-frequency-use-case.js'

export async function getStudentFrequency(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student-frequency',
      {
        schema: {
          tags: ['student'],
          summary: 'Get student frequency',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              totalAbsences: z.number(),
              frequencyPercentage: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()

        const service = makeGetStudentFrequencyUseCase()

        const result = await service.execute({ registration })

        return reply.status(200).send({
          totalAbsences: result.totalAbsences,
          frequencyPercentage: result.frequencyPercentage,
        })
      }
    )
}
