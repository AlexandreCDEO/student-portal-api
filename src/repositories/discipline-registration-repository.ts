export interface DisciplineRegistrationRepository {
  getStudentCompletedSemesterHour(register: string): Promise<{
    totalCourseHours: number
    completionPercentage: number
    totalHoursCompleted: number
  }>
  getStudentCompletedCourseHour(register: string): Promise<{
    totalCourseHours: number
    completionPercentage: number
    totalHoursCompleted: number
  }>
}
