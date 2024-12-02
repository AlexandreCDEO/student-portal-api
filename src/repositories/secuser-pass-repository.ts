export interface SecUserPassRepository {
  searchByUserId(userId: number): Promise<Date | null>
}
