import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { auth } from '../middlewares/auth.js'
import { makeUpdateProfileUseCase } from '@/use-cases/factories/make-update-profile-use-case.js'

export async function updateProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/profile',
      {
        schema: {
          tags: ['student'],
          summary: 'Update user authenticate profile',
          security: [{ bearerAuth: [] }],
          body: z.object({
            gender: z.number().optional(),
            mail: z.string().email(),
            phone: z.object({
              ddd: z.number(),
              number: z.number(),
            }),
            race: z.number(),
          }),
          response: {
            200: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()

        const { mail, phone, race, gender } = request.body
        const service = makeUpdateProfileUseCase()

        await service.execute({
          registration,
          mail,
          phone,
          race,
          genderId: gender,
        })

        return reply
          .status(200)
          .send({ message: 'Dados do estudante atualizados com sucesso!' })
      }
    )
}
