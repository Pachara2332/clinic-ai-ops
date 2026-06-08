export type StaffRole = 'doctor' | 'nurse' | 'reception' | 'manager'
export type TaskStatus = 'todo' | 'in-progress' | 'completed'

export type Branch = { id: string; name: string; city: string; targetRevenue: number }
export type Staff = { id: string; branchId: string; name: string; role: StaffRole; isWorking: boolean; taskLoad: number }
export type Appointment = { id: string; branchId: string; patientName: string; service: string; startsAt: string; status: 'confirmed' | 'waiting' | 'done' }
export type Sale = { id: string; branchId: string; amount: number; service: string; soldAt: string }
export type ClinicTask = { id: string; branchId: string; staffId: string; title: string; queueCount: number; status: TaskStatus; startedAt?: string; completedAt?: string }
export type KPIRecord = { id: string; branchId: string; staffId: string; taskId: string; durationMinutes: number; score: number; recordedAt: string }
export type RosterRecommendation = { branchId: string; dayName: string; doctors: number; nurses: number; reception: number; reason: string }
export type AISummary = { branchId: string; summary: string; generatedAt: string }
export type BranchKPI = { branchId: string; branchName: string; revenue: number; patientCount: number; completionRate: number; staffWorking: number; targetRevenue: number }

export type DashboardPayload = {
  branches: Branch[]
  staff: Staff[]
  appointments: Appointment[]
  sales: Sale[]
  tasks: ClinicTask[]
  kpiRecords: KPIRecord[]
  recommendations: RosterRecommendation[]
  aiSummaries: AISummary[]
  branchKpis: BranchKPI[]
}
