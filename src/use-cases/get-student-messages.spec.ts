import type { BulletinBoardRepository } from '@/repositories/bulletin-board-repositoty.js'
import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import type { CourseBulletinBoardRepository } from '@/repositories/course-bulletin-board-repository.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import type { ClassBulletinBoardRepository } from '@/repositories/class-bulletin-board-repository.js'
import type { PeriodBulletinBoardRepository } from '@/repositories/period-bulletin-board-repository.js'
import type { HistoryBulletinBoardRepository } from '@/repositories/history-bulletin-board-repository.js'
import type { UsersRepository } from '@/repositories/users-repository.js'
import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest'
import { GetStudentMessagesUseCase } from './get-student-messages.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import { InvalidDataInRegisteringError } from './_errors/invalid-data-in-regitering-error.js'
import { BulletinBoardHistoryError } from './_errors/bulletin-board-history-error.js'
import { MainGroupOfCompaniesNotExistsError } from './_errors/main-group-of-companies-not-exists-error.js'
import { BulletinBoardDestiny } from '@/enums/bulletin-board-destiny.js'
import { BulletinBoardType } from '@/enums/bulletin-board-type.js'
import { AcademicRegistrationStatus } from '@/enums/academic-registration-status.js'

describe('GetStudentMessagesUseCase', () => {
  let bulletinBoardRepository: Mocked<BulletinBoardRepository>
  let companyCompanyGroupsRepository: Mocked<CompanyCompanyGroupsRepository>
  let companyGroupsRepository: Mocked<CompanyGroupsRepository>
  let courseBulletinBoardRepository: Mocked<CourseBulletinBoardRepository>
  let registrationsRepository: Mocked<RegistrationsRepository>
  let classBulletinBoardRepository: Mocked<ClassBulletinBoardRepository>
  let periodBulletinBoardRepository: Mocked<PeriodBulletinBoardRepository>
  let historyBulletinBoardRepository: Mocked<HistoryBulletinBoardRepository>
  let usersRepository: Mocked<UsersRepository>
  let sut: GetStudentMessagesUseCase

  beforeEach(() => {
    bulletinBoardRepository = {
      getStudentMessages: vi.fn(),
    } as unknown as Mocked<BulletinBoardRepository>

    companyCompanyGroupsRepository = {
      searchCompanyDefinedAsMain: vi.fn(),
    } as unknown as Mocked<CompanyCompanyGroupsRepository>

    companyGroupsRepository = {
      searchMainGroupOfCompanies: vi.fn(),
    } as unknown as Mocked<CompanyGroupsRepository>

    courseBulletinBoardRepository = {
      bulletinBoardIfFromThisCourse: vi.fn(),
    } as unknown as Mocked<CourseBulletinBoardRepository>

    registrationsRepository = {
      getStudentData: vi.fn(),
    } as unknown as Mocked<RegistrationsRepository>

    classBulletinBoardRepository = {
      bulletinBoardIfFromThisClass: vi.fn(),
    } as unknown as Mocked<ClassBulletinBoardRepository>

    periodBulletinBoardRepository = {
      bulletinBoardIfFromThisPeriod: vi.fn(),
    } as unknown as Mocked<PeriodBulletinBoardRepository>

    historyBulletinBoardRepository = {
      create: vi.fn(),
    } as unknown as Mocked<HistoryBulletinBoardRepository>

    usersRepository = {
      findByUsername: vi.fn(),
    } as unknown as Mocked<UsersRepository>

    sut = new GetStudentMessagesUseCase(
      bulletinBoardRepository,
      companyCompanyGroupsRepository,
      companyGroupsRepository,
      courseBulletinBoardRepository,
      registrationsRepository,
      classBulletinBoardRepository,
      periodBulletinBoardRepository,
      historyBulletinBoardRepository,
      usersRepository
    )
  })

  it('Deve retornar erro caso não encontre Grupo principal de empresas(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(
      null
    )
    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(MainGroupOfCompaniesNotExistsError)
  })

  it('Deve retornar erro caso não encontre Empresa definida como principal (get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      null
    )

    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(CompanyDefinedAsMainNotExistsError)
  })

  it('Deve retornar erro quando o Estudante não for encontrado(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )
    registrationsRepository.getStudentData.mockResolvedValue(null)

    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(StudentNotFoundError)
  })

  it('Deve retornar erro quando o Estudante não possuir curso(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: null,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(InvalidDataInRegisteringError)
  })

  it('Deve retornar erro quando o Estudante não possuir turma(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: null,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(InvalidDataInRegisteringError)
  })

  it('Deve retornar erro quando o Estudante não possuir período escolar atual(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: null,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(InvalidDataInRegisteringError)
  })

  it('Deve retornar erro quando o Estudante não possuir usuário cadastrado(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: null,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue(null)

    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(InvalidDataInRegisteringError)
  })

  it('Deve retornar erro quando não for possível gerar histórico de recados do mural(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue({
      secUserId: 1,
      secUserName: 'usuario123',
      secUserPassword: 'senha123',
      secUserActive: true,
      secUserDataCadastro: new Date(),
      secUserSenhaProvisoria: false,
      secUserBloqueado: false,
      secUserNameComp: 'Usuario Completo',
      secUserEmail: 'usuario@example.com',
      secUserStatus: 'Ativo',
    })

    bulletinBoardRepository.getStudentMessages.mockResolvedValue([
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(1),
        muralRecadoDataInicio: new Date('2023-01-01'),
        muralRecadoDataFinal: new Date('2023-01-31'),
        muralRecadoTitulo: 'Título 1',
        muralRecadoMensagem: 'Mensagem 1',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(2),
        muralRecadoDataInicio: new Date('2023-02-01'),
        muralRecadoDataFinal: new Date('2023-02-28'),
        muralRecadoTitulo: 'Título 2',
        muralRecadoMensagem: 'Mensagem 2',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
    ])

    courseBulletinBoardRepository.bulletinBoardIfFromThisCourse.mockResolvedValue(
      true
    )
    classBulletinBoardRepository.bulletinBoardIfFromThisClass.mockResolvedValue(
      true
    )
    historyBulletinBoardRepository.create.mockResolvedValue(false)

    await expect(
      sut.execute({
        registration: '123456',
      })
    ).rejects.toThrowError(BulletinBoardHistoryError)
  })

  it('Deve recuperar recados do mural corretamente(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue({
      secUserId: 1,
      secUserName: 'usuario123',
      secUserPassword: 'senha123',
      secUserActive: true,
      secUserDataCadastro: new Date(),
      secUserSenhaProvisoria: false,
      secUserBloqueado: false,
      secUserNameComp: 'Usuario Completo',
      secUserEmail: 'usuario@example.com',
      secUserStatus: 'Ativo',
    })

    bulletinBoardRepository.getStudentMessages.mockResolvedValue([
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(1),
        muralRecadoDataInicio: new Date('2023-01-01'),
        muralRecadoDataFinal: new Date('2023-01-31'),
        muralRecadoTitulo: 'Título 1',
        muralRecadoMensagem: 'Mensagem 1',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(2),
        muralRecadoDataInicio: new Date('2023-02-01'),
        muralRecadoDataFinal: new Date('2023-02-28'),
        muralRecadoTitulo: 'Título 2',
        muralRecadoMensagem: 'Mensagem 2',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
    ])

    courseBulletinBoardRepository.bulletinBoardIfFromThisCourse.mockResolvedValue(
      true
    )
    classBulletinBoardRepository.bulletinBoardIfFromThisClass.mockResolvedValue(
      true
    )
    historyBulletinBoardRepository.create.mockResolvedValue(true)

    const result = await sut.execute({ registration: '123456' })

    expect(result.studentMessages).toHaveLength(2)
    expect(result.studentMessages).toEqual([
      {
        id: 1,
        title: 'Título 1',
        date: expect.any(Date),
        message: 'Mensagem 1',
      },
      {
        id: 2,
        title: 'Título 2',
        date: expect.any(Date),
        message: 'Mensagem 2',
      },
    ])
  })

  it('Deve retornar um array vazio caso não existam recados do mural para o estudante(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue({
      secUserId: 1,
      secUserName: 'usuario123',
      secUserPassword: 'senha123',
      secUserActive: true,
      secUserDataCadastro: new Date(),
      secUserSenhaProvisoria: false,
      secUserBloqueado: false,
      secUserNameComp: 'Usuario Completo',
      secUserEmail: 'usuario@example.com',
      secUserStatus: 'Ativo',
    })

    bulletinBoardRepository.getStudentMessages.mockResolvedValue([
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(1),
        muralRecadoDataInicio: new Date('2023-01-01'),
        muralRecadoDataFinal: new Date('2023-01-31'),
        muralRecadoTitulo: 'Título 1',
        muralRecadoMensagem: 'Mensagem 1',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(2),
        muralRecadoDataInicio: new Date('2023-02-01'),
        muralRecadoDataFinal: new Date('2023-02-28'),
        muralRecadoTitulo: 'Título 2',
        muralRecadoMensagem: 'Mensagem 2',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
    ])

    courseBulletinBoardRepository.bulletinBoardIfFromThisCourse.mockResolvedValue(
      false
    )
    classBulletinBoardRepository.bulletinBoardIfFromThisClass.mockResolvedValue(
      false
    )

    const result = await sut.execute({ registration: '123456' })

    expect(result.studentMessages).toHaveLength(0)
    expect(result.studentMessages).toEqual([])
  })

  it('Deve retornar corretamente quando o recado for para todos do período(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue({
      secUserId: 1,
      secUserName: 'usuario123',
      secUserPassword: 'senha123',
      secUserActive: true,
      secUserDataCadastro: new Date(),
      secUserSenhaProvisoria: false,
      secUserBloqueado: false,
      secUserNameComp: 'Usuario Completo',
      secUserEmail: 'usuario@example.com',
      secUserStatus: 'Ativo',
    })

    bulletinBoardRepository.getStudentMessages.mockResolvedValue([
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(1),
        muralRecadoDataInicio: new Date('2023-01-01'),
        muralRecadoDataFinal: new Date('2023-01-31'),
        muralRecadoTitulo: 'Título 1',
        muralRecadoMensagem: 'Mensagem 1',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.PERIOD,
      },
    ])

    courseBulletinBoardRepository.bulletinBoardIfFromThisCourse.mockResolvedValue(
      true
    )
    classBulletinBoardRepository.bulletinBoardIfFromThisClass.mockResolvedValue(
      false
    )

    periodBulletinBoardRepository.bulletinBoardIfFromThisPeriod.mockResolvedValue(
      true
    )

    historyBulletinBoardRepository.create.mockResolvedValue(true)

    const result = await sut.execute({ registration: '123456' })

    expect(result.studentMessages).toHaveLength(1)
    expect(result.studentMessages).toEqual([
      {
        id: 1,
        title: 'Título 1',
        date: expect.any(Date),
        message: 'Mensagem 1',
      },
    ])
  })

  it('Deve retornar corretamente quando o recado for para todas turmas e todos destinos(get-student-messages.spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: 'A',
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue({
      secUserId: 1,
      secUserName: 'usuario123',
      secUserPassword: 'senha123',
      secUserActive: true,
      secUserDataCadastro: new Date(),
      secUserSenhaProvisoria: false,
      secUserBloqueado: false,
      secUserNameComp: 'Usuario Completo',
      secUserEmail: 'usuario@example.com',
      secUserStatus: 'Ativo',
    })

    bulletinBoardRepository.getStudentMessages.mockResolvedValue([
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(1),
        muralRecadoDataInicio: new Date('2023-01-01'),
        muralRecadoDataFinal: new Date('2023-01-31'),
        muralRecadoTitulo: 'Título 1',
        muralRecadoMensagem: 'Mensagem 1',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.BOTH,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
    ])

    courseBulletinBoardRepository.bulletinBoardIfFromThisCourse.mockResolvedValue(
      true
    )
    classBulletinBoardRepository.bulletinBoardIfFromThisClass.mockResolvedValue(
      false
    )

    historyBulletinBoardRepository.create.mockResolvedValue(true)

    const result = await sut.execute({ registration: '123456' })

    expect(result.studentMessages).toHaveLength(1)
    expect(result.studentMessages).toEqual([
      {
        id: 1,
        title: 'Título 1',
        date: expect.any(Date),
        message: 'Mensagem 1',
      },
    ])
  })

  it('Deve retornar corretamente quando o recado for para alunos graduados e o Aluno for um aluno graduado(get-student-messages-spec.ts)', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: AcademicRegistrationStatus.COMPLETED,
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue({
      secUserId: 1,
      secUserName: 'usuario123',
      secUserPassword: 'senha123',
      secUserActive: true,
      secUserDataCadastro: new Date(),
      secUserSenhaProvisoria: false,
      secUserBloqueado: false,
      secUserNameComp: 'Usuario Completo',
      secUserEmail: 'usuario@example.com',
      secUserStatus: 'Ativo',
    })

    bulletinBoardRepository.getStudentMessages.mockResolvedValue([
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(1),
        muralRecadoDataInicio: new Date('2023-01-01'),
        muralRecadoDataFinal: new Date('2023-01-31'),
        muralRecadoTitulo: 'Título 1',
        muralRecadoMensagem: 'Mensagem 1',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.GRADUATES,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
    ])

    courseBulletinBoardRepository.bulletinBoardIfFromThisCourse.mockResolvedValue(
      true
    )
    classBulletinBoardRepository.bulletinBoardIfFromThisClass.mockResolvedValue(
      false
    )

    historyBulletinBoardRepository.create.mockResolvedValue(true)

    const result = await sut.execute({ registration: '123456' })

    expect(result.studentMessages).toHaveLength(1)
    expect(result.studentMessages).toEqual([
      {
        id: 1,
        title: 'Título 1',
        date: expect.any(Date),
        message: 'Mensagem 1',
      },
    ])
  })

  it('Deve retornar corretamente quando o recado for para estudantes e todos destinos', async () => {
    companyGroupsRepository.searchMainGroupOfCompanies.mockResolvedValueOnce(1)

    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1
    )

    registrationsRepository.getStudentData.mockResolvedValue({
      matriculaCodigo: '123456',
      matriculaSituacaoAcademica: AcademicRegistrationStatus.ACTIVE,
      matriculaIdPf: '987654321',
      matriculaIdMoodle: 'moodle123',
      matriculaSituacaoAluno: true,
      matriculaDataCadastro: new Date(),
      periodoEscolarId: 1,
      periodoEscolarAtualId: 1,
      empresaId: 1,
      cursoCodigo: 1,
      turmaCodigo: 1,
      alunoParticipanteCod: 400,
      alunoParticipanteFilialCod: 500,
    })

    usersRepository.findByUsername.mockResolvedValue({
      secUserId: 1,
      secUserName: 'usuario123',
      secUserPassword: 'senha123',
      secUserActive: true,
      secUserDataCadastro: new Date(),
      secUserSenhaProvisoria: false,
      secUserBloqueado: false,
      secUserNameComp: 'Usuario Completo',
      secUserEmail: 'usuario@example.com',
      secUserStatus: 'Ativo',
    })

    bulletinBoardRepository.getStudentMessages.mockResolvedValue([
      {
        empresaId: 1,
        muralRecadoCodigo: BigInt(1),
        muralRecadoDataInicio: new Date('2023-01-01'),
        muralRecadoDataFinal: new Date('2023-01-31'),
        muralRecadoTitulo: 'Título 1',
        muralRecadoMensagem: 'Mensagem 1',
        muralRecadoDtaLog: new Date(),
        muralRecadoDestino: BulletinBoardDestiny.STUDENTS,
        muralRecadoCursoTurma: BulletinBoardType.ALL,
      },
    ])

    courseBulletinBoardRepository.bulletinBoardIfFromThisCourse.mockResolvedValue(
      true
    )
    classBulletinBoardRepository.bulletinBoardIfFromThisClass.mockResolvedValue(
      false
    )

    historyBulletinBoardRepository.create.mockResolvedValue(true)

    const result = await sut.execute({ registration: '123456' })

    expect(result.studentMessages).toHaveLength(1)
    expect(result.studentMessages).toEqual([
      {
        id: 1,
        title: 'Título 1',
        date: expect.any(Date),
        message: 'Mensagem 1',
      },
    ])
  })
})
