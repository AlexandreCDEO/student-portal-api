interface getStudentAssessmentsData {
  discipline: string | null
  assessment: string | null
  note: number | null
  weight: number | null
}

export interface DisciplineRegistrationsAssessmentRepository {
  getStudentAssessments(
    registration: string
  ): Promise<getStudentAssessmentsData[]>
}
