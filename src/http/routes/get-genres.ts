import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../middlewares/auth.js'
import { z } from 'zod'
import { prisma } from '@/lib/prisma.js'

export async function getGenres(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/genres',
      {
        schema: {
          tags: ['general'],
          summary: 'Get all genres',
          response: {
            200: z.array(
              z.object({
                id: z.number(),
                name: z.string().nullable(),
              })
            ),
          },
        },
      },
      async () => {
        const genres = await prisma.genero.findMany({
          select: {
            generoId: true,
            generoNome: true,
          },
          where: {
            generoFlgAtivo: true,
          },
        })

        return genres.map(genre => ({
          id: genre.generoId,
          name: genre.generoNome,
        }))
      }
    )
}
