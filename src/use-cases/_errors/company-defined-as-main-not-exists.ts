export class CompanyDefinedAsMainNotExistsError extends Error {
  constructor() {
    super('Não existe empresa definida como principal. Verifique!')
  }
}
