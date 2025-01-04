import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { z } from 'zod'
import { makeGetStudentCompletedSemesterHoursUseCase } from '@/use-cases/factories/make-get-student-completed-semester-hours-use-case.js'

export async function StudentCompletedSemesterHours(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student-semester-hours',
      {
        schema: {
          tags: ['student'],
          summary: 'get student completed semester hours',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              totalCourseHours: z.number(),
              completionPercentage: z.number(),
              totalHoursCompleted: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()
        const service = makeGetStudentCompletedSemesterHoursUseCase()
        const result = await service.execute({
          register: registration,
        })

        return reply.status(200).send(result)
      }
    )
}
