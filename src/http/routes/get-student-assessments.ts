import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { z } from 'zod'
import { PrismaDisciplineRegistrationsAssessmentsRepository } from '@/repositories/prisma/prisma-discipline-registrations-assessments-repository.js'

export async function GetStudentAssessments(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student-assessments',
      {
        schema: {
          tags: ['student'],
          summary: 'get student assessments',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              assessments: z.array(
                z.object({
                  discipline: z.string().nullable(),
                  assessment: z.string().nullable(),
                  note: z.number().nullable(),
                  weight: z.number().nullable(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()
        const repository =
          new PrismaDisciplineRegistrationsAssessmentsRepository()
        const assessments = await repository.getStudentAssessments(registration)
        return reply.status(200).send({ assessments })
      }
    )
}
