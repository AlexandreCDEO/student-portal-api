export interface CompanyGroupsRepository {
  searchMainGroupOfCompanies(): Promise<number | null>
}
