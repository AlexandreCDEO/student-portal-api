import { auth } from '@/http/middlewares/auth.js'
import { makeGetStudentProfileUseCase } from '@/use-cases/factories/make-get-student-profile.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z, { string } from 'zod'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/me',
      {
        schema: {
          tags: ['student'],
          summary: 'Get user authenticate profile',
          response: {
            200: z.object({
              profile: z.object({
                document: z.string().nullable(),
                name: z.string().nullable(),
                sex: z.string().nullable(),
                socialName: z.string().nullable(),
                genderId: z.number().nullable(),
                status: z.string().nullable(),
                birth: z.date().nullable(),
                mail: z.string().nullable(),
                race: z.number().nullable(),
                phone: z
                  .object({
                    ddi: z.number().nullable(),
                    ddd: z.number().nullable(),
                    number: z.number().nullable(),
                  })
                  .nullable(),
                country: z.string().nullable(),
                UF: z.string().nullable(),
                city: z.string().nullable(),
                RG: z.string().nullable(),
                UFRG: z.string().nullable(),
                issuingAgency: z.string().nullable(),
                addresses: z
                  .array(
                    z.object({
                      type: z.string().nullable(),
                      CEP: z.string().nullable(),
                      street: z.string().nullable(),
                      number: z.string().nullable(),
                      complement: z.string().nullable(),
                      neighborhood: z.string().nullable(),
                      city: z.string().nullable(),
                      UF: z.string().nullable(),
                      country: z.string().nullable(),
                      phone: z
                        .object({
                          ddi: z.number().nullable(),
                          ddd: z.number().nullable(),
                          number: z.number().nullable(),
                        })
                        .nullable(),
                    })
                  )
                  .nullable(),
                parents: z
                  .array(
                    z.object({
                      name: z.string().nullable(),
                      CPF: z.string().nullable(),
                      relation: z.string().nullable(),
                      status: z.string().nullable(),
                    })
                  )
                  .nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { registration } = await request.getCurrentUserId()
        const service = makeGetStudentProfileUseCase()
        const studentProfile = await service.execute({ registration })
        reply.status(200).send({ profile: studentProfile })
      }
    )
}
