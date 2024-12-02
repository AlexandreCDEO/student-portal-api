import { auth } from '@/http/middlewares/auth.js'
import { prisma } from '@/lib/prisma.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['auth'],
          summary: 'Get user authenticate profile',
          response: {
            200: z.object({
              user: z.object({
                secUserId: z.number(),
                secUserName: z.string(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.secUser.findFirst({
          select: {
            secUserId: true,
            secUserName: true,
          },
          where: {
            secUserId: userId,
          },
        })

        if (!user) throw new Error('User not found')

        return reply.status(200).send({ user })
      }
    )
}
