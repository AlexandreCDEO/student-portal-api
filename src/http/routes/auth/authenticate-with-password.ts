import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { makeAuthenticateWithPasswordUseCase } from '@/use-cases/factories/make-authenticate-with-password-use-case.js'
import z from 'zod'

const RegistrationDataSchema = z.object({
  code: z.string(),
  course: z.string().nullable().optional(),
})

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with registration or document',
        body: z.object({
          username: z.string().min(1, 'O username é obrigatório.'),
          password: z.string().min(1, 'O password é obrigatório.'),
        }),
        response: {
          201: z.object({
            access_token: z.string().nullable(),
            refresh_token: z.string().nullable(),
            registrations: z.array(RegistrationDataSchema),
            userIdToChangePassword: z.number().nullish(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body

      const authenticateWithPasswordUseCase =
        makeAuthenticateWithPasswordUseCase()

      const data = await authenticateWithPasswordUseCase.execute({
        username,
        password,
      })

      let token: string | null = null
      let refreshToken: string | null = null

      if (data.registrations && data.registrations.length >= 1) {
        token = await reply.jwtSign({}, { sign: { expiresIn: '5m' } })
        refreshToken = await reply.jwtSign({}, { sign: { expiresIn: '5m' } })
      }

      if (data.student && !data.shouldChangePassword) {
        token = await reply.jwtSign({
          sub: data.student.secUserId,
          registration: data.student.secUserName,
        })

        refreshToken = await reply.jwtSign(
          {
            sub: data.student.secUserId,
            registration: data.student.secUserName,
          },
          { sign: { expiresIn: '7d' } }
        )
      }

      return reply.status(201).send({
        access_token: token ?? null,
        refresh_token: refreshToken ?? null,
        registrations: data.registrations ?? [],
        userIdToChangePassword: data.shouldChangePassword
          ? data.student?.secUserId
          : null,
      })
    }
  )
}
