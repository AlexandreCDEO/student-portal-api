import type { Matricula } from '@prisma/client'

export type RegistrationWithCourse = Matricula & {
  cursoNome?: string | null
}

export type StudentProfileData = {
  document: string | null
  name: string | null
  sex: string | null
  socialName: string | null
  genderId: number | null
  status: string | null
  birth: Date | null
  mail: string | null
  race: number | null
  phone: string | null
  country: string | null
  UF: string | null
  city: string | null
  RG: string | null
  UFRG: string | null
  issuingAgency: number | null
  addresses:
    | {
        type: string | null
        CEP: string | null
        street: string | null
        number: string | null
        complement: string | null
        neighborhood: string | null
        city: string | null
        UF: string | null
        country: string | null
        phone: string | null
      }[]
    | null
  parents:
    | {
        name: string | null
        CPF: string | null
        relation: string | null
        status: boolean | null
      }[]
    | null
}

export interface RegistrationsRepository {
  findByDocument(
    companyId: number,
    document: string
  ): Promise<RegistrationWithCourse[]>

  getStudentProfile(registration: string): Promise<StudentProfileData | null>
}
