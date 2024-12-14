import { auth } from '@/http/middlewares/auth.js'
import { makeChangePasswordUseCase } from '@/use-cases/factories/make-change-password-use-case.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function changePasswordWithToken(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/password/change/token',
      {
        schema: {
          tags: ['auth'],
          summary: 'change password',
          body: z.object({
            password: z.string().min(1, 'A senha atual é obrigatória.'),
            newPassword: z.string().min(1, 'A nova senha é obrigatória'),
            confirmPassword: z
              .string()
              .min(1, 'A confirmação da senha é obrigatória'),
          }),
          response: {
            200: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { password, newPassword, confirmPassword } = request.body
        const { sub, registration } = await request.getCurrentUserId()
        const changePasswordUseCase = makeChangePasswordUseCase()

        const userId = sub
        await changePasswordUseCase.execute({
          userId,
          registration,
          password,
          newPassword,
          confirmPassword,
        })

        return reply
          .status(200)
          .send({ message: 'Senha alterada com sucesso.' })
      }
    )
}
