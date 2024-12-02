export enum TypeOccurrency {
  LOGIN = 'LG',
  ERRO_SENHA = 'ES',
  SAIDA_DO_SISTEMA = 'SA',
  TROCA_SENHA = 'TS',
  DESBLOQUEIO_SENHA = 'DE',
  BLOQUEIO_SENHA = 'BL',
}

// Função para converter uma string para o enum `TypeOccurrency`
export function convertToTypeOccurrency(value: string): TypeOccurrency {
  if (Object.values(TypeOccurrency).includes(value as TypeOccurrency)) {
    return value as TypeOccurrency
  }

  throw new Error(`Valor inválido para tipo de ocorrência de usuário`)
}
