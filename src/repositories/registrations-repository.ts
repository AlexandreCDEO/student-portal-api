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
  phone: {
    ddi: number | null
    ddd: number | null
    number: number | null
  } | null
  country: string | null
  UF: string | null
  city: string | null
  RG: string | null
  UFRG: string | null
  issuingAgency: string | null
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
        phone: {
          ddi: number | null
          ddd: number | null
          number: number | null
        } | null
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

  existsByRegistration(registration: string): Promise<boolean>

  getStudentProfile(registration: string): Promise<StudentProfileData | null>

  getStudentData(registration: string): Promise<Matricula | null>

  updateStudentProfile(
    registration: string,
    genderId: number | null | undefined,
    mail: string,
    phone: {
      ddd: number
      number: number
    },
    race: number
  ): Promise<boolean>
}
