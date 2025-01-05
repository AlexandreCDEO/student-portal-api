import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { z } from 'zod'
import { PrismaRequirementsRepository } from '@/repositories/prisma/prisma-requirements.repository.js'

export async function GetStudentRequirements(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/student-requirements',
      {
        schema: {
          tags: ['student'],
          summary: 'get student requirements',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              requirements: z.array(
                z.object({
                  id: z.number(),
                  numberOfUnreadMessages: z.number(),
                  date: z.date().nullable(),
                  status: z.string().nullable(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()
        const repository = new PrismaRequirementsRepository()

        const result = await repository.getStudentRequirements(registration)

        return reply.status(200).send({ requirements: result })
      }
    )
}
