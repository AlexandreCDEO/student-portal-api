import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function generateRefreshToken(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/token/refresh',
    {
      schema: {
        tags: ['auth'],
        summary: 'Generate Refresh Token',
        body: z.object({
          refresh_token: z.string().min(1, 'Refresh Token é obrigatório.'),
        }),
        response: {
          201: z.object({
            access_token: z.string(),
            refresh_token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { refresh_token } = request.body

      const { sub, registration } = await app.jwt.verify<{
        sub: number
        registration: string
      }>(refresh_token)

      const token = await reply.jwtSign({ sub, registration })

      const refreshToken = await reply.jwtSign(
        { sub, registration },
        { sign: { expiresIn: '7d' } }
      )

      return reply.status(201).send({
        access_token: token,
        refresh_token: refreshToken,
      })
    }
  )
}
