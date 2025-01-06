import type { BulletinBoardRepository } from '@/repositories/bulletin-board-repositoty.js'
import type { CompanyCompanyGroupsRepository } from '@/repositories/company-company-groups-repository.js'
import type { CompanyGroupsRepository } from '@/repositories/company-groups-repository.js'
import { CompanyDefinedAsMainNotExistsError } from './_errors/company-defined-as-main-not-exists.js'
import type { CourseBulletinBoardRepository } from '@/repositories/course-bulletin-board-repository.js'
import type { RegistrationsRepository } from '@/repositories/registrations-repository.js'
import { StudentNotFoundError } from './_errors/student-not-found.js'
import { InvalidDataInRegisteringError } from './_errors/invalid-data-in-regitering-error.js'
import type { ClassBulletinBoardRepository } from '@/repositories/class-bulletin-board-repository.js'
import { BulletinBoardType } from '@/enums/bulletin-board-type.js'
import type { PeriodBulletinBoardRepository } from '@/repositories/period-bulletin-board-repository.js'
import { BulletinBoardDestiny } from '@/enums/bulletin-board-destiny.js'
import { AcademicRegistrationStatus } from '@/enums/academic-registration-status.js'
import type { HistoryBulletinBoardRepository } from '@/repositories/history-bulletin-board-repository.js'
import { BulletinBoardHistoryError } from './_errors/bulletin-board-history-error.js'
import type { UsersRepository } from '@/repositories/users-repository.js'

interface GetStudentMessagesUseCaseRequest {
  registration: string
}

interface StudentMessageData {
  id: number
  title: string
  date: Date
  message: string
}

interface GetStudentMessagesUseCaseResponse {
  studentMessages: StudentMessageData[]
}

export class GetStudentMessagesUseCase {
  constructor(
    private bulletinBoardRepository: BulletinBoardRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private companyGroupsRepository: CompanyGroupsRepository,
    private courseBulletinBoardRepository: CourseBulletinBoardRepository,
    private registrationsRepository: RegistrationsRepository,
    private classBulletinBoardRepository: ClassBulletinBoardRepository,
    private periodBulletinBoardRepository: PeriodBulletinBoardRepository,
    private historyBulletinBoardRepository: HistoryBulletinBoardRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({
    registration,
  }: GetStudentMessagesUseCaseRequest): Promise<GetStudentMessagesUseCaseResponse> {
    /** Grava Histórico de visualização */
    const saveBulletinBoardAsViewed = async (
      companyId: number,
      bulletinBoardCode: number,
      userId: number
    ) => {
      const historyisGerated = await this.historyBulletinBoardRepository.create(
        companyId,
        bulletinBoardCode,
        userId
      )

      if (!historyisGerated) throw new BulletinBoardHistoryError()
    }

    /** Recupera dados da empresa */
    const companyGroup =
      await this.companyGroupsRepository.searchMainGroupOfCompanies()

    if (!companyGroup) throw new CompanyDefinedAsMainNotExistsError()

    const companyId =
      await this.companyCompanyGroupsRepository.searchCompanyDefinedAsMain(
        companyGroup
      )
    if (!companyId) throw new CompanyDefinedAsMainNotExistsError()

    /** Valida se os dados necessários estão gravados corretamente */
    const studentData =
      await this.registrationsRepository.getStudentData(registration)

    if (!studentData) throw new StudentNotFoundError()

    if (
      !studentData.cursoCodigo ||
      !studentData.turmaCodigo ||
      !studentData.periodoEscolarAtualId
    )
      throw new InvalidDataInRegisteringError()

    const isGraduatingStudent =
      studentData.matriculaSituacaoAcademica ===
        AcademicRegistrationStatus.COMPLETED ||
      studentData.matriculaSituacaoAcademica ===
        AcademicRegistrationStatus.TRAINED

    const studentUser = await this.usersRepository.findByUsername(registration)
    if (!studentUser) throw new InvalidDataInRegisteringError()

    /** Recupera todos recados do mural do período */
    const bulletinsBoardData =
      await this.bulletinBoardRepository.getStudentMessages(
        companyId,
        registration
      )

    /** Valida se o estudante deve ver o recado */
    const result = await Promise.all(
      bulletinsBoardData.map(async bulletinBoardData => {
        /** Verifica se o recado é para o curso do estudante */
        const bulletinBoadIstheStudentCourse =
          await this.courseBulletinBoardRepository.bulletinBoardIfFromThisCourse(
            bulletinBoardData.empresaId,
            Number(bulletinBoardData.muralRecadoCodigo),
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            studentData.cursoCodigo!
          )

        /** Verifica se o recado é para a turma do estudante */
        const bulletinBoadIstheStudentClass =
          await this.classBulletinBoardRepository.bulletinBoardIfFromThisClass(
            companyId,
            Number(bulletinBoardData.muralRecadoCodigo),
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            studentData.cursoCodigo!,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            studentData.turmaCodigo!
          )

        if (!bulletinBoadIstheStudentCourse && !bulletinBoadIstheStudentClass)
          return

        if (bulletinBoadIstheStudentClass) {
          await saveBulletinBoardAsViewed(
            companyId,
            Number(bulletinBoardData.muralRecadoCodigo),
            studentUser?.secUserId
          )
          return bulletinBoardData
        }

        /** Verifica se o recado é para todos do período atual */
        if (
          bulletinBoardData.muralRecadoCursoTurma === BulletinBoardType.PERIOD
        ) {
          const bulletinBoadIstheStudentPeriod =
            await this.periodBulletinBoardRepository.bulletinBoardIfFromThisPeriod(
              companyId,
              Number(bulletinBoardData.muralRecadoCodigo),
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              studentData.periodoEscolarAtualId!
            )

          if (bulletinBoadIstheStudentPeriod) {
            await saveBulletinBoardAsViewed(
              companyId,
              Number(bulletinBoardData.muralRecadoCodigo),
              studentUser?.secUserId
            )
            return bulletinBoardData
          }
        }

        /** Verifica se o recado é para todas turmas e para todos destinos */
        if (
          bulletinBoardData.muralRecadoCursoTurma === BulletinBoardType.ALL &&
          bulletinBoardData.muralRecadoDestino === BulletinBoardDestiny.BOTH
        ) {
          await saveBulletinBoardAsViewed(
            companyId,
            Number(bulletinBoardData.muralRecadoCodigo),
            studentUser?.secUserId
          )
          return bulletinBoardData
        }

        /** Verifica se o recado é para alunos graduados */
        if (
          bulletinBoardData.muralRecadoDestino ===
            BulletinBoardDestiny.GRADUATES &&
          isGraduatingStudent
        ) {
          await saveBulletinBoardAsViewed(
            companyId,
            Number(bulletinBoardData.muralRecadoCodigo),
            studentUser?.secUserId
          )
          return bulletinBoardData
        }

        /** Verifica se o recado é para alunos e todos destinos */
        if (
          bulletinBoardData.muralRecadoDestino ===
            BulletinBoardDestiny.STUDENTS &&
          bulletinBoardData.muralRecadoCursoTurma === BulletinBoardType.ALL
        ) {
          await saveBulletinBoardAsViewed(
            companyId,
            Number(bulletinBoardData.muralRecadoCodigo),
            studentUser?.secUserId
          )
          return bulletinBoardData
        }
      })
    )

    /** Gera array de mensagens validar para não listar repetidamente */
    const processedIds = new Set<number>()

    const studentMessages = result
      .map(item => {
        if (
          item?.muralRecadoCodigo &&
          item?.muralRecadoTitulo &&
          item?.muralRecadoDtaLog &&
          item?.muralRecadoMensagem &&
          !processedIds.has(Number(item.muralRecadoCodigo))
        ) {
          processedIds.add(Number(item.muralRecadoCodigo))
          return {
            id: Number(item.muralRecadoCodigo),
            title: item.muralRecadoTitulo,
            date: item.muralRecadoDtaLog,
            message: item.muralRecadoMensagem,
          }
        }
        return null
      })
      .filter(item => item !== null)
    return { studentMessages }
  }
}
