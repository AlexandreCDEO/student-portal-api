import { fastify } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { authenticateWithToken } from './routes/auth/authenticate-with-token.js'
import { errorHandler } from './error-handler.js'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password.js'
import { getProfile } from './routes/auth/get-profile.js'
import { env } from '@/env/index.js'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Portal do Aluno',
      description: 'Portal do Aluno - Send Solutions',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: 'my-jwt-secret',
})

app.register(fastifyCors)

app.register(authenticateWithPassword)
app.register(getProfile)
app.register(authenticateWithToken)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running!')
  })
