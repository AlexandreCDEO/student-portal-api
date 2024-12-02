export class MainGroupOfCompaniesNotExistsError extends Error {
  constructor() {
    super('Não existe grupo de empresas definido como principal. Verifique!')
  }
}
