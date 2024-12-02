import { prisma } from '@/lib/prisma.js'
import type { UserOccurrenciesRepository } from '../user-occurrencies-repository.js'
import type { TypeOccurrency } from '@/enums/type-occurrency.js'
import type { UsuOco } from '@prisma/client'

export class PrismaUserOccurrenciesRepository
  implements UserOccurrenciesRepository
{
  async create(
    usuCod: string,
    usuDtaOco: Date,
    usuTipOco: TypeOccurrency,
    usuMenOco: string,
    usuCodDes?: string,
    usuOcoTst?: string
  ): Promise<UsuOco | null> {
    const userOccurrency = await prisma.usuOco.create({
      data: {
        usuCod: usuCod,
        usuDtaOco: usuDtaOco,
        usuTipoOco: usuTipOco,
        usuCodDes: usuCodDes,
        usuMenOco: usuMenOco,
        usuOcoTst: usuOcoTst,
      },
    })

    if (!userOccurrency) return null

    return userOccurrency
  }
}
