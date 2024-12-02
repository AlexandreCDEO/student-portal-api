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
            token: z.string().nullable(),
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

      if (data.registrations && data.registrations.length >= 1) {
        token = await reply.jwtSign({}, { sign: { expiresIn: '5m' } })
      }

      if (data.student && !data.shouldChangePassword) {
        token = await reply.jwtSign(
          { sub: data.student.secUserId },
          { sign: { expiresIn: '1d' } }
        )
      }

      return reply.status(201).send({
        token: token ?? null,
        registrations: data.registrations ?? [],
        userIdToChangePassword: data.shouldChangePassword
          ? data.student?.secUserId
          : null,
      })
    }
  )
}
