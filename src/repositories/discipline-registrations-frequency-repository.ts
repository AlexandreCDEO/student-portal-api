interface getStudentFrequencyResponse {
  totalAbsences: number
  frequencyPercentage: number
}

export interface DisciplineRegistrationsfrequencyRepository {
  getStudentFrequency(
    registration: string
  ): Promise<{ totalAbsences: number; frequencyPercentage: number }>
}
