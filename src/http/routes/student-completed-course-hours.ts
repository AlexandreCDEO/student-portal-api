import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { z } from 'zod'
import { makeGetStudentCompletedCourseHoursUseCase } from '@/use-cases/factories/make-get-student-completed-course-hours-use-case.js'

export async function StudentCompletedCourseHours(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student-course-hours',
      {
        schema: {
          tags: ['student'],
          summary: 'get student completed Course hours',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              totalMatrixHours: z.number(),
              completionPercentage: z.number(),
              totalHoursCompleted: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()
        const service = makeGetStudentCompletedCourseHoursUseCase()
        const result = await service.execute({
          register: registration,
        })

        return reply.status(200).send({
          totalMatrixHours: result.totalCourseHours,
          completionPercentage: result.completionPercentage,
          totalHoursCompleted: result.totalHoursCompleted,
        })
      }
    )
}
