export interface RequirementsRepository {
  getStudentRequirements(
    registration: string
  ): Promise<
    {
      id: number
      numberOfUnreadMessages: number
      date: Date | null
      status: string | null
    }[]
  >
}
