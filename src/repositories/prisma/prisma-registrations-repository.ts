import { prisma } from '@/lib/prisma.js'
import type {
  RegistrationsRepository,
  RegistrationWithCourse,
  StudentCardData,
  StudentProfileData,
} from '../registrations-repository.js'
import type { Matricula } from '@prisma/client'

export class PrismaRegistrationsRepository implements RegistrationsRepository {
  async getStudentCardData(
    companyId: number,
    registration: string
  ): Promise<StudentCardData> {
    const studentData = await prisma.matricula.findFirst({
      include: {
        periodoEscolarAtual: {
          select: {
            periodoEscolarDataFinal: true,
          },
        },
        participanteFilial: {
          select: {
            participanteNomeCompleto: true,
            avatares: {
              select: {
                participanteFilialAvatar: true,
                participanteFilialAvatarName: true,
                participanteFilialAvatarExt: true,
              },
            },
          },
        },
        curso: {
          select: {
            cursoNome: true,
          },
        },
      },
      where: {
        empresaId: companyId,
        matriculaCodigo: registration,
      },
    })

    return {
      name:
        studentData?.participanteFilial?.participanteNomeCompleto ??
        'Nome não Informado',
      course: studentData?.curso?.cursoNome ?? 'Curso não Informado',
      registration: studentData?.matriculaCodigo ?? 'Matrícula não Informada',
      FinalDatePeriod:
        studentData?.periodoEscolarAtual?.periodoEscolarDataFinal ?? new Date(),
      avatar: {
        file: studentData?.participanteFilial?.avatares[0]
          ?.participanteFilialAvatar
          ? Buffer.from(
              studentData?.participanteFilial?.avatares[0]
                ?.participanteFilialAvatar
            )
          : null,
        type:
          studentData?.participanteFilial?.avatares[0]
            ?.participanteFilialAvatarExt ?? null,
        name:
          studentData?.participanteFilial?.avatares[0]
            ?.participanteFilialAvatarName ?? null,
      },
    }
  }

  async getStudentData(
    companyId: number,
    registration: string
  ): Promise<Matricula | null> {
    const data = await prisma.matricula.findFirst({
      where: {
        empresaId: companyId,
        matriculaCodigo: registration,
      },
    })

    return data
  }

  async existsByRegistration(registration: string): Promise<boolean> {
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

    if (!companyId?.empresaId) return false

    const result = await prisma.matricula.findFirst({
      where: {
        empresaId: companyId?.empresaId,
        matriculaCodigo: registration,
      },
    })

    if (!result) return false

    return true
  }

  async updateStudentProfile(
    registration: string,
    genderId: number,
    mail: string,
    phone: {
      ddd: number
      number: number
    },
    race: number
  ): Promise<boolean> {
    await prisma.$transaction(async prisma => {
      const companyData = await prisma.grupoEmpresaEmpresa.findFirst({
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

      const participanteData = await prisma.matricula.findFirst({
        select: {
          alunoParticipanteCod: true,
          alunoParticipanteFilialCod: true,
        },
        where: {
          empresaId: companyData?.empresaId,
          matriculaCodigo: registration,
        },
      })

      if (!participanteData) {
        return false
      }

      await prisma.participanteFilial.update({
        where: {
          empresaId_participanteCodigo_participanteFilialCodigo: {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            empresaId: companyData?.empresaId!,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            participanteCodigo: participanteData.alunoParticipanteCod!,
            participanteFilialCodigo:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              participanteData.alunoParticipanteFilialCod!,
          },
        },
        data: {
          generoId: genderId,
          participanteFilialCorRaca: race,
        },
      })

      const residentialAddressData =
        await prisma.participanteFilialEndereco.findMany({
          select: {
            participanteFilialEnderecoSequencia: true,
          },
          where: {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            empresaId: companyData?.empresaId!,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            participanteCodigo: participanteData.alunoParticipanteCod!,
            participanteFilialCodigo:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              participanteData.alunoParticipanteFilialCod!,
            participanteFilialEnderecoTipo: 'Residencial',
            relacionamentoCodigo: 'Aluno',
            participanteFilialEnderecoStatus: true,
          },
        })

      const residentialAddressSequence =
        residentialAddressData[0].participanteFilialEnderecoSequencia

      const studentMainEmailData =
        await prisma.participanteFilialEnderecoContatoEletronico.findMany({
          select: {
            empresaId: true,
            participanteCodigo: true,
            participanteFilialCodigo: true,
            relacionamentoCodigo: true,
            participanteFilialEnderecoSequencia: true,
            participanteFilialEnderecoContatoSequencia: true,
            participanteFilialEnderecoContatoEletronicoCodigo: true,
          },
          where: {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            empresaId: companyData?.empresaId!,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            participanteCodigo: participanteData.alunoParticipanteCod!,
            participanteFilialCodigo:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              participanteData.alunoParticipanteFilialCod!,
            relacionamentoCodigo: 'Aluno',
            participanteFilialEnderecoSequencia: residentialAddressSequence,
            participanteFilialEnderecoContatoEletronicoTipo: 'E-mail',
            participanteFilialEnderecoContatoEletronicoMain: true,
            participanteFilialEnderecoContatoEletronicoStatus: true,
          },
        })

      if (studentMainEmailData.length > 0) {
        await prisma.participanteFilialEnderecoContatoEletronico.update({
          where: {
            empresaId_participanteCodigo_participanteFilialCodigo_relacionamentoCodigo_participanteFilialEnderecoSequencia_participanteFilialEnderecoContatoSequencia_participanteFilialEnderecoContatoEletronicoCodigo:
              {
                empresaId: studentMainEmailData[0].empresaId,
                participanteCodigo: studentMainEmailData[0].participanteCodigo,
                participanteFilialCodigo:
                  studentMainEmailData[0].participanteFilialCodigo,
                relacionamentoCodigo:
                  studentMainEmailData[0].relacionamentoCodigo,
                participanteFilialEnderecoSequencia:
                  studentMainEmailData[0].participanteFilialEnderecoSequencia,
                participanteFilialEnderecoContatoSequencia:
                  studentMainEmailData[0]
                    .participanteFilialEnderecoContatoSequencia,
                participanteFilialEnderecoContatoEletronicoCodigo:
                  studentMainEmailData[0]
                    .participanteFilialEnderecoContatoEletronicoCodigo,
              },
          },
          data: {
            participanteFilialEnderecoContatoEletronicoDescric: mail, // Substitua pelo novo valor do email
          },
        })
      } else {
        await prisma.participanteFilialEnderecoContatoEletronico.create({
          data: {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            empresaId: companyData?.empresaId!,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            participanteCodigo: participanteData.alunoParticipanteCod!,
            participanteFilialCodigo:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              participanteData.alunoParticipanteFilialCod!,
            relacionamentoCodigo: 'Aluno',
            participanteFilialEnderecoSequencia: residentialAddressSequence,
            participanteFilialEnderecoContatoSequencia: 1,
            participanteFilialEnderecoContatoEletronicoCodigo: 3,
            participanteFilialEnderecoContatoEletronicoTipo: 'E-mail',
            participanteFilialEnderecoContatoEletronicoDescric: mail,
            participanteFilialEnderecoContatoEletronicoStatus: true,
            participanteFilialEnderecoContatoEletronicoUsuLog: 'api',
            participanteFilialEnderecoContatoEletronicoPgmLog: 'api',
            participanteFilialEnderecoContatoEletronicoDtaLog: new Date(),
            participanteFilialEnderecoContatoEletronicoMain: true,
          },
        })
      }

      const studentMainPhoneData =
        await prisma.participanteFilialEnderecoContatoTelefone.findMany({
          select: {
            empresaId: true,
            participanteCodigo: true,
            participanteFilialCodigo: true,
            relacionamentoCodigo: true,
            participanteFilialEnderecoSequencia: true,
            participanteFilialEnderecoContatoTelefoneSequencia: true,
            participanteFilialEnderecoContatoTelefoneCodigo: true,
          },
          where: {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            empresaId: companyData?.empresaId!,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            participanteCodigo: participanteData.alunoParticipanteCod!,
            participanteFilialCodigo:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              participanteData.alunoParticipanteFilialCod!,
            relacionamentoCodigo: 'Aluno',
            participanteFilialEnderecoSequencia: residentialAddressSequence,
            participanteFilialEnderecoContatoTelefoneTipo: 'Celular',
            participanteFilialEnderecoContatoTelefoneStatus: true,
            participanteFilialEnderecoContatoTelefoneMain: true,
          },
        })

      if (studentMainPhoneData.length > 0) {
        await prisma.participanteFilialEnderecoContatoTelefone.update({
          where: {
            empresaId_participanteCodigo_participanteFilialCodigo_relacionamentoCodigo_participanteFilialEnderecoSequencia_participanteFilialEnderecoContatoTelefoneSequencia_participanteFilialEnderecoContatoTelefoneCodigo:
              {
                empresaId: studentMainPhoneData[0].empresaId,
                participanteCodigo: studentMainPhoneData[0].participanteCodigo,
                participanteFilialCodigo:
                  studentMainPhoneData[0].participanteFilialCodigo,
                relacionamentoCodigo:
                  studentMainPhoneData[0].relacionamentoCodigo,
                participanteFilialEnderecoSequencia:
                  studentMainPhoneData[0].participanteFilialEnderecoSequencia,
                participanteFilialEnderecoContatoTelefoneSequencia:
                  studentMainPhoneData[0]
                    .participanteFilialEnderecoContatoTelefoneSequencia,
                participanteFilialEnderecoContatoTelefoneCodigo:
                  studentMainPhoneData[0]
                    .participanteFilialEnderecoContatoTelefoneCodigo,
              },
          },
          data: {
            participanteFilialEnderecoContatoTelefoneDdd: phone.ddd,
            participanteFilialEnderecoContatoTelefoneNumero: phone.number,
          },
        })
      } else {
        await prisma.participanteFilialEnderecoContatoTelefone.create({
          data: {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            empresaId: companyData?.empresaId!,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            participanteCodigo: participanteData.alunoParticipanteCod!,
            participanteFilialCodigo:
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              participanteData.alunoParticipanteFilialCod!,
            relacionamentoCodigo: 'Aluno',
            participanteFilialEnderecoSequencia: residentialAddressSequence,
            participanteFilialEnderecoContatoTelefoneSequencia: 1,
            participanteFilialEnderecoContatoTelefoneCodigo: 4,
            participanteFilialEnderecoContatoTelefoneTipo: 'Celular',
            participanteFilialEnderecoContatoTelefoneDdi: 55,
            participanteFilialEnderecoContatoTelefoneDdd: phone.ddd,
            participanteFilialEnderecoContatoTelefoneNumero: BigInt(
              phone.number
            ),
            participanteFilialEnderecoContatoTelefoneRamal: 0,
            participanteFilialEnderecoContatoTelefoneStatus: true,
            participanteFilialEnderecoContatoTelefoneMain: true,
            participanteFilialEnderecoContatoTelefoneDataLog: new Date(),
            participanteFilialEnderecoContatoTelefonePgmLog:
              'student-portal-api',
            participanteFilialEnderecoContatoTelefoneUsuLog:
              'student-portal-api',
          },
        })
      }
    })

    return true
  }

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
            orgaoExpedidor: {
              select: {
                orgaoExpedidorNome: true,
              },
            },
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

    const studentStatus = existsParticipantRelation ? 'ATIVO' : 'INATIVO'

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
          where: {
            participanteFilialEnderecoContatoEletronicoTipo: 'E-mail',
            participanteFilialEnderecoContatoEletronicoStatus: true,
            participanteFilialEnderecoContatoEletronicoMain: true,
          },
        },
        participantesFiliasEnderecosContatosTelefones: {
          select: {
            participanteFilialEnderecoContatoTelefoneDdi: true,
            participanteFilialEnderecoContatoTelefoneDdd: true,
            participanteFilialEnderecoContatoTelefoneNumero: true,
          },
          where: {
            participanteFilialEnderecoContatoTelefoneStatus: true,
            participanteFilialEnderecoContatoTelefoneMain: true,
          },
        },
      },

      where: {
        empresaId: companyId?.empresaId,
        participanteCodigo: participantData?.alunoParticipanteCod,
        participanteFilialCodigo: participantData?.alunoParticipanteFilialCod,
        participanteFilialEnderecoStatus: true,
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
        ? {
            ddi: residentialAddress
              .participantesFiliasEnderecosContatosTelefones[0]
              .participanteFilialEnderecoContatoTelefoneDdi,
            ddd: residentialAddress
              .participantesFiliasEnderecosContatosTelefones[0]
              .participanteFilialEnderecoContatoTelefoneDdd,
            number: Number(
              residentialAddress
                .participantesFiliasEnderecosContatosTelefones[0]
                .participanteFilialEnderecoContatoTelefoneNumero
            ),
          }
        : null,
      country: residentialAddress?.pais?.paiNom?.trim() ?? null,
      UF: residentialAddress?.unidadeFederativaCodigo ?? null,
      city: residentialAddress?.municipio?.mufDsc?.trim() ?? null,
      RG:
        participantData.participanteFilial?.participanteFilialRg?.trim() ??
        null,
      UFRG:
        participantData.participanteFilial?.participanteFilialRgUf?.trim() ??
        null,
      issuingAgency:
        participantData.participanteFilial?.orgaoExpedidor
          ?.orgaoExpedidorNome ?? null,
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
            ? {
                ddi: address.participantesFiliasEnderecosContatosTelefones[0]
                  .participanteFilialEnderecoContatoTelefoneDdi,
                ddd: address.participantesFiliasEnderecosContatosTelefones[0]
                  .participanteFilialEnderecoContatoTelefoneDdd,
                number: Number(
                  address.participantesFiliasEnderecosContatosTelefones[0]
                    .participanteFilialEnderecoContatoTelefoneNumero
                ),
              }
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
