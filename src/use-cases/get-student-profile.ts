import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'

interface GetStudentProfileUseCaseRequest {
  registration: string
}

type StudentProfileResponse = {
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
        phone: string | null
      }[]
    | null
  parents:
    | {
        name: string | null
        CPF: string | null
        relation: string | null
        status: string | null
      }[]
    | null
}

export class GetStudentProfileUseCase {
  constructor(private registrationRepository: RegistrationsRepository) {}

  async execute({
    registration,
  }: GetStudentProfileUseCaseRequest): Promise<StudentProfileResponse> {
    const data =
      await this.registrationRepository.getStudentProfile(registration)

    if (!data) {
      throw new StudentNotFoundError()
    }

    return {
      document: data.document,
      name: data.name,
      sex: data.sex,
      socialName: data.socialName,
      genderId: data.genderId,
      status: data.status,
      birth: data.birth,
      mail: data.mail,
      race: data.race,
      phone: data.phone,
      country: data.country,
      UF: data.UF,
      city: data.city,
      RG: data.RG,
      UFRG: data.UFRG,
      issuingAgency: data.issuingAgency?.toString() || null,
      addresses: data.addresses
        ? data.addresses?.map(address => ({
            type: address.type,
            CEP: address.CEP,
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            UF: address.UF,
            country: address.country,
            phone: address.phone,
          }))
        : null,
      parents: data.parents
        ? data.parents?.map(parent => ({
            name: parent.name,
            CPF: parent.CPF,
            relation: parent.relation,
            status: parent.status ? 'Ativo' : 'Inativo',
          }))
        : null,
    }
  }
}
