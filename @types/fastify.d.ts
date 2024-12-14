import 'fastify'

export interface JwtPayload {
  sub: number
  registration: string
}

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<JwtPayload>
  }
}
