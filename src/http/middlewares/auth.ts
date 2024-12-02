import { UnauthorizedError } from '@/use-cases/_errors/unauthorized-error.js'
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async request => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: number }>()

        return sub
      } catch (err) {
        throw new UnauthorizedError('Invalid auth token')
      }
    }
  })
})
