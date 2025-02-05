import { fastify } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { authenticateWithToken } from './routes/auth/authenticate-with-token.js'
import { errorHandler } from './error-handler.js'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password.js'
import { getProfile } from './routes/get-profile.js'
import { env } from '@/env/index.js'
import { changePassword } from './routes/auth/change-password.js'
import fastifyCookie from '@fastify/cookie'
import { generateRefreshToken } from './routes/auth/generate-refresh-token.js'
import { changePasswordWithToken } from './routes/auth/change-password-with-token.js'
import { getGenres } from './routes/get-genres.js'
import { updateProfile } from './routes/update-profile.js'
import { StudentCompletedSemesterHours } from './routes/student-completed-semester-hours.js'
import { StudentCompletedCourseHours } from './routes/student-completed-course-hours.js'
import { getStudentFrequency } from './routes/student-frequency.js'
import { GetStudentRequirements } from './routes/get-student-requirements.js'
import { GetStudentAssessments } from './routes/get-student-assessments.js'
import { GetStudentMessages } from './routes/get-student-messages.js'
import { saveStudentAvatar } from './routes/save-student-avatar.js'
import fastifyMultipart from '@fastify/multipart'
import { transformSwaggerSchema } from './transform-swagger-schema.js'
import { getStudentAvatar } from './routes/get-student-avatar.js'
import { getStudentCard } from './routes/get-student-card.js'

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
  transform: transformSwaggerSchema,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyCookie)

app.register(fastifyJwt, {
  secret: 'my-jwt-secret',
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
})

app.register(fastifyCors, {
  origin: (origin, callback) => {
    // Permite qualquer origem
    callback(null, true)
  },
  credentials: true, // Permite envio de cookies e cabeçalhos credenciais
})

app.register(fastifyMultipart)

app.register(authenticateWithPassword)
app.register(getProfile)
app.register(authenticateWithToken)
app.register(changePassword)
app.register(generateRefreshToken)
app.register(changePasswordWithToken)
app.register(getGenres)
app.register(updateProfile)
app.register(StudentCompletedSemesterHours)
app.register(StudentCompletedCourseHours)
app.register(getStudentFrequency)
app.register(GetStudentRequirements)
app.register(GetStudentAssessments)
app.register(GetStudentMessages)
app.register(saveStudentAvatar)
app.register(getStudentAvatar)
app.register(getStudentCard)

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running!')
})
