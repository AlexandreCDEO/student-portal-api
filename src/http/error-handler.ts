import type { FastifyInstance } from 'fastify'
import { BadRequestError } from '@/use-cases/_errors/bad-request-error.js'
import { UnauthorizedError } from '@/use-cases/_errors/unauthorized-error.js'
import { PasswordEncryptionError } from '@/use-cases/_errors/password-encryption-error.js'
import { StudentBlockedError } from '@/use-cases/_errors/student-blocked-error.js'
import { MainGroupOfCompaniesNotExistsError } from '@/use-cases/_errors/main-group-of-companies-not-exists-error.js'
import { PasswordIsEmptyError } from '@/use-cases/_errors/password-is-empty-error.js'
import { ZodError } from 'zod'
import { WrongCredentialsError } from '@/use-cases/_errors/wrong-credentials-errors.js'
import { UserOccurrencyError } from '@/use-cases/_errors/user-occurrenct-error.js'
import { PasswordMissmatchError } from '@/use-cases/_errors/password-missmatch-error.js'
import { InvalidCurrentPasswordError } from '@/use-cases/_errors/invalid-current-password-error.js'
import { NewPasswordEqualError } from '@/use-cases/_errors/new-password-equal-error.js'
import { PasswordOnlyNumbersError } from '@/use-cases/_errors/password-only-numbers-error.js'
import { PasswordComplexityError } from '@/use-cases/_errors/password-complexity-error.js'
import { PasswordNoSpecialCharactersError } from '@/use-cases/_errors/password-no-special-characters-error.js'
import { CompanyDefinedAsMainNotExistsError } from '@/use-cases/_errors/company-defined-as-main-not-exists.js'
import { MinumunNumberDigitsForPasswordError } from '@/use-cases/_errors/minimun-number-digits-password-error.js'
import { UserUpdateError } from '@/use-cases/_errors/user-update-error.js'

type FastifyErrorhandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorhandler = (error, request, reply) => {
  console.log(error)
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE') {
    return reply.status(401).send({
      messages: ['Token de autenticação inválido ou ausente.'],
    })
  }

  if (error.code === 'FST_ERR_VALIDATION') {
    // Extrai as mensagens de erro
    const messages = error.validation
      ? error.validation.map(err => err.message)
      : []

    return reply.status(400).send({
      messages, // retorna apenas o array de mensagens
    })
  }

  if (error instanceof ZodError) {
    // Extrai as mensagens de erro do Zod
    const messages = error.errors.map(err => err.message)

    return reply.status(400).send({
      messages,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof CompanyDefinedAsMainNotExistsError) {
    return reply.status(404).send({
      messages: [error.message],
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      messages: [error.message],
    })
  }

  if (error instanceof WrongCredentialsError) {
    return reply.status(401).send({
      messages: [error.message],
    })
  }

  if (error instanceof PasswordEncryptionError) {
    return reply.status(500).send({
      messages: [error.message],
    })
  }

  if (error instanceof UserUpdateError) {
    return reply.status(500).send({
      messages: [error.message],
    })
  }

  if (error instanceof UserOccurrencyError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof StudentBlockedError) {
    return reply.status(403).send({
      messages: [error.message],
    })
  }

  if (error instanceof MainGroupOfCompaniesNotExistsError) {
    return reply.status(404).send({
      messages: [error.message],
    })
  }

  if (error instanceof PasswordIsEmptyError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof PasswordMissmatchError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof InvalidCurrentPasswordError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof NewPasswordEqualError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof PasswordOnlyNumbersError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof PasswordComplexityError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof MinumunNumberDigitsForPasswordError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  if (error instanceof PasswordNoSpecialCharactersError) {
    return reply.status(400).send({
      messages: [error.message],
    })
  }

  console.error(error)

  // Envia o erro para alguma plataforma de observabilidade

  return reply.status(500).send({
    messages: ['Erro interno do servidor.'],
  })
}
