import type { Matricula } from '@prisma/client'

export type RegistrationWithCourse = Matricula & {
  cursoNome?: string | null
}

export interface RegistrationsRepository {
  findByDocument(
    companyId: number,
    document: string
  ): Promise<RegistrationWithCourse[]>
}
