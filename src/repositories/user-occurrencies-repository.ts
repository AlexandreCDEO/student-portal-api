import type { TypeOccurrency } from '@/enums/type-occurrency.js'
import type { UsuOco } from '@prisma/client'

export interface UserOccurrenciesRepository {
  create(
    usuCod: string,
    usuDtaOco: Date,
    UsuTipOco: TypeOccurrency,
    UsuMenOco: string,
    UsuCodDes?: string
  ): Promise<UsuOco | null>
}
