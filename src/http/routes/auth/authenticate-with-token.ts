import { auth } from '@/http/middlewares/auth.js'
import { prisma } from '@/lib/prisma.js'
import { WrongCredentialsError } from '@/use-cases/_errors/wrong-credentials-errors.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function authenticateWithToken(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/sessions/token',
      {
        schema: {
          tags: ['auth'],
          summary: 'Authenticate with token',
          security: [{ bearerAuth: [] }],
          body: z.object({
            registration: z.string(),
          }),
          response: {
            201: z.object({
              token: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = request.body
        await request.getCurrentUserId()
        const userId = await prisma.secUser.findFirst({
          select: {
            secUserId: true,
          },
          where: {
            secUserName: registration.toUpperCase(),
          },
        })

        if (!userId) throw new WrongCredentialsError()

        const token = await reply.jwtSign(
          { sub: userId },
          { sign: { expiresIn: '1d' } }
        )

        return reply.status(200).send({
          token,
        })
      }
    )
}
