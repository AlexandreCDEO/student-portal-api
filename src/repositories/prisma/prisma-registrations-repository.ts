import { prisma } from '@/lib/prisma.js'
import type {
  RegistrationsRepository,
  RegistrationWithCourse,
  StudentProfileData,
} from '../registrations-repository.js'

export class PrismaRegistrationsRepository implements RegistrationsRepository {
  async getStudentProfile(
    registration: string
  ): Promise<StudentProfileData | null> {
    const companyId = await prisma.grupoEmpresaEmpresa.findFirst({
      select: {
        empresaId: true,
      },
      where: {
        empresaPrincipal: true,
        grupoEmpresa: {
          grupoEmpresaAtivo: true,
          grupoEmpresaPrincipal: true,
        },
      },
    })

    if (!companyId?.empresaId) return null

    const participantData = await prisma.matricula.findFirst({
      select: {
        alunoParticipanteCod: true,
        alunoParticipanteFilialCod: true,
        participanteFilial: {
          select: {
            participanteFilialCnpj: true,
            participanteNomeCompleto: true,
            participanteFilialSexo: true,
            participanteFilialNomeSocial: true,
            generoId: true,
            participanteFilialNascimento: true,
            participanteFilialCorRaca: true,
            participanteFilialNacionalidadePais: true,
            participanteFilialNacionalidadeUf: true,
            participanteFilialNacionalidadeCodMunicipio: true,
            participanteFilialRg: true,
            participanteFilialRgUf: true,
            participanteFilialRgOrgaoExpedidor: true,
          },
        },
      },
      where: {
        empresaId: companyId?.empresaId,
        matriculaCodigo: registration,
      },
    })

    if (
      !participantData?.alunoParticipanteCod ||
      !participantData?.alunoParticipanteFilialCod
    )
      return null

    const existsParticipantRelation = await prisma.relacionamento.findFirst({
      where: {
        empresaId: companyId?.empresaId,
        participanteCodigo: participantData?.alunoParticipanteCod,
        participanteFilialCodigo: participantData?.alunoParticipanteFilialCod,
      },
    })

    const studentStatus = existsParticipantRelation ? 'Ativo' : 'Inativo'

    const addressesData = await prisma.participanteFilialEndereco.findMany({
      select: {
        participanteFilialEnderecoTipo: true,
        participanteFilialEnderecoCep: true,
        participanteFilialEnderecoLogradouro: true,
        participanteFilialEnderecoNumero: true,
        participanteFilialEnderecoComplemento: true,
        participanteFilialEnderecoBairro: true,
        municipio: {
          select: {
            mufDsc: true,
          },
        },
        unidadeFederativaCodigo: true,
        pais: {
          select: {
            paiNom: true,
          },
        },
        contatosEletronicos: {
          select: {
            participanteFilialEnderecoContatoEletronicoDescric: true,
          },
        },
        participantesFiliasEnderecosContatosTelefones: {
          select: {
            participanteFilialEnderecoContatoTelefoneDdi: true,
            participanteFilialEnderecoContatoTelefoneDdd: true,
            participanteFilialEnderecoContatoTelefoneNumero: true,
          },
        },
      },

      where: {
        empresaId: companyId?.empresaId,
        participanteCodigo: participantData?.alunoParticipanteCod,
        participanteFilialCodigo: participantData?.alunoParticipanteFilialCod,
      },
    })

    const residentialAddress = addressesData.find(
      address =>
        address.participanteFilialEnderecoTipo?.trim() === 'Residencial'
    )

    const studentEmail =
      residentialAddress?.contatosEletronicos?.[0]
        ?.participanteFilialEnderecoContatoEletronicoDescric ?? null

    const studentParents = await prisma.participanteRelacao.findMany({
      select: {
        participanteRelacao: true,
        participanteResponsavelStatus: true,
        participanteFilialRelacao: {
          select: {
            participanteNomeCompleto: true,
            participanteFilialCnpj: true,
          },
        },
      },
      where: {
        empresaId: companyId?.empresaId,
        participanteCodigo: participantData?.alunoParticipanteCod,
        participanteFilialCodigo: participantData?.alunoParticipanteFilialCod,
      },
    })

    return {
      document: participantData.participanteFilial?.participanteFilialCnpj
        ? participantData.participanteFilial.participanteFilialCnpj.toString
            .length > 11
          ? participantData.participanteFilial.participanteFilialCnpj
              .toString()
              .padStart(14, '0')
              .trim()
          : participantData.participanteFilial.participanteFilialCnpj
              .toString()
              .padStart(11, '0')
              .trim()
        : null,
      name:
        participantData.participanteFilial?.participanteNomeCompleto?.trim() ??
        null,
      sex:
        participantData.participanteFilial?.participanteFilialSexo?.trim() ??
        null,
      socialName:
        participantData.participanteFilial?.participanteFilialNomeSocial?.trim() ??
        null,
      genderId: participantData.participanteFilial?.generoId ?? null,
      status: studentStatus,
      birth: participantData.participanteFilial?.participanteFilialNascimento
        ? new Date(
            participantData.participanteFilial.participanteFilialNascimento
          )
        : null,
      mail: studentEmail?.trim() ?? null,
      race:
        participantData.participanteFilial?.participanteFilialCorRaca ?? null,
      phone: residentialAddress
        ? `+${residentialAddress.participantesFiliasEnderecosContatosTelefones[0].participanteFilialEnderecoContatoTelefoneDdi} (${residentialAddress.participantesFiliasEnderecosContatosTelefones[0].participanteFilialEnderecoContatoTelefoneDdd}) ${residentialAddress.participantesFiliasEnderecosContatosTelefones[0].participanteFilialEnderecoContatoTelefoneNumero}`
        : null,
      country: residentialAddress?.pais?.paiNom?.trim() ?? null,
      UF: residentialAddress?.municipio?.mufDsc?.trim() ?? null,
      city: residentialAddress?.municipio?.mufDsc?.trim() ?? null,
      RG:
        participantData.participanteFilial?.participanteFilialRg?.trim() ??
        null,
      UFRG:
        participantData.participanteFilial?.participanteFilialRgUf?.trim() ??
        null,
      issuingAgency:
        participantData.participanteFilial
          ?.participanteFilialRgOrgaoExpedidor ?? null,
      addresses: addressesData.map(address => ({
        type: address.participanteFilialEnderecoTipo?.trim() ?? null,
        CEP: address.participanteFilialEnderecoCep?.trim() ?? null,
        street: address.participanteFilialEnderecoLogradouro?.trim() ?? null,
        number: address.participanteFilialEnderecoNumero?.trim() ?? null,
        complement:
          address.participanteFilialEnderecoComplemento?.trim() ?? null,
        neighborhood: address.participanteFilialEnderecoBairro?.trim() ?? null,
        city: address.municipio?.mufDsc?.trim() ?? null,
        UF: address.unidadeFederativaCodigo?.trim() ?? null,
        country: address.pais?.paiNom?.trim() ?? null,
        phone:
          address.participantesFiliasEnderecosContatosTelefones.length > 0
            ? `+${address.participantesFiliasEnderecosContatosTelefones[0].participanteFilialEnderecoContatoTelefoneDdi} (${address.participantesFiliasEnderecosContatosTelefones[0].participanteFilialEnderecoContatoTelefoneDdd}) ${address.participantesFiliasEnderecosContatosTelefones[0].participanteFilialEnderecoContatoTelefoneNumero}`
            : null,
      })),
      parents: studentParents.map(parent => ({
        name:
          parent.participanteFilialRelacao?.participanteNomeCompleto?.trim() ??
          null,
        CPF: parent.participanteFilialRelacao?.participanteFilialCnpj
          ? parent.participanteFilialRelacao.participanteFilialCnpj.toString
              .length > 11
            ? parent.participanteFilialRelacao.participanteFilialCnpj
                .toString()
                .padStart(14, '0')
                .trim()
            : parent.participanteFilialRelacao.participanteFilialCnpj
                .toString()
                .padStart(11, '0')
                .trim()
          : null,
        relation: parent.participanteRelacao?.trim() ?? null,
        status: parent.participanteResponsavelStatus ?? null,
      })),
    }
  }

  async findByDocument(
    companyId: number,
    document: string
  ): Promise<RegistrationWithCourse[]> {
    const result = await prisma.matricula.findMany({
      include: {
        participanteFilial: true,
        curso: true,
      },
      where: {
        empresaId: companyId,
        matriculaSituacaoAluno: true,
        participanteFilial: {
          participanteFilialCnpj: Number(document),
        },
      },
    })

    const registrations: RegistrationWithCourse[] = result.map(
      registration => ({
        empresaId: registration.empresaId,
        alunoParticipanteCod: registration.alunoParticipanteCod,
        alunoParticipanteFilialCod: registration.alunoParticipanteFilialCod,
        cursoCodigo: registration.cursoCodigo,
        matriculaCodigo: registration.matriculaCodigo,
        matriculaDataCadastro: registration.matriculaDataCadastro,
        matriculaIdMoodle: registration.matriculaIdMoodle,
        matriculaIdPf: registration.matriculaIdPf,
        matriculaSituacaoAcademica: registration.matriculaSituacaoAcademica,
        matriculaSituacaoAluno: registration.matriculaSituacaoAluno,
        periodoEscolarAtualId: registration.periodoEscolarAtualId,
        periodoEscolarId: registration.periodoEscolarId,
        turmaCodigo: registration.turmaCodigo,
        cursoNome: registration.curso?.cursoNome,
      })
    )

    return registrations
  }
}
