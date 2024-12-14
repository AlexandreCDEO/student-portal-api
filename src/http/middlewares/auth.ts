import { UnauthorizedError } from '@/use-cases/_errors/unauthorized-error.js'
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async request => {
    request.getCurrentUserId = async () => {
      try {
        const { sub, registration } = await request.jwtVerify<{
          sub: number
          registration: string
        }>()

        return { sub, registration }
      } catch (err) {
        throw new UnauthorizedError()
      }
    }
  })
})
