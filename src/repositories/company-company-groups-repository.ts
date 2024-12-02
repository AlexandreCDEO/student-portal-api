export interface CompanyCompanyGroupsRepository {
  searchCompanyDefinedAsMain(grupoempresaid: number): Promise<number | null>
}
