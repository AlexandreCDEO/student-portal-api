import { makeChangePasswordUseCase } from '@/use-cases/factories/make-change-password-use-case.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function changePassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/change',
    {
      schema: {
        tags: ['auth'],
        summary: 'change password',
        body: z.object({
          userId: z.number(),
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
      const { userId, password, newPassword, confirmPassword } = request.body

      const changePasswordUseCase = makeChangePasswordUseCase()
      await changePasswordUseCase.execute({
        userId,
        password,
        newPassword,
        confirmPassword,
      })

      return reply.status(200).send({ message: 'Senha alterada com sucesso.' })
    }
  )
}
