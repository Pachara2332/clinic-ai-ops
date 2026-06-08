import type {
  AISummary,
  Appointment,
  Branch,
  BranchKPI,
  ClinicTask,
  DashboardPayload,
  KPIRecord,
  RosterRecommendation,
  Sale,
  Staff,
} from '../types/clinic.js'

export function recommendRoster(
  branchId: string,
  dayName = 'Saturday',
  currentAppointments: Appointment[] = [],
  currentSales: Sale[] = [],
): RosterRecommendation {
  const patientCount = currentAppointments.filter((appointment) => appointment.branchId === branchId).length
  const revenue = currentSales.filter((sale) => sale.branchId === branchId).reduce((sum, sale) => sum + sale.amount, 0)
  const isPeak = dayName === 'Saturday' || patientCount >= 4 || revenue >= 120000

  return {
    branchId,
    dayName,
    doctors: isPeak ? 3 : 2,
    nurses: isPeak ? 4 : 2,
    reception: isPeak ? 2 : 1,
    reason: isPeak
      ? 'Peak demand from current appointments or revenue. Add more front desk and nursing coverage.'
      : 'Current workload is within the normal range. Standard staffing should be enough.',
  }
}

export function buildBranchKpis(
  branches: Branch[] = [],
  currentTasks: ClinicTask[] = [],
  currentStaff: Staff[] = [],
  currentAppointments: Appointment[] = [],
  currentSales: Sale[] = [],
): BranchKPI[] {
  return branches.map((branch) => {
    const branchTasks = currentTasks.filter((task) => task.branchId === branch.id)
    const completed = branchTasks.filter((task) => task.status === 'completed').length
    const revenue = currentSales.filter((sale) => sale.branchId === branch.id).reduce((sum, sale) => sum + sale.amount, 0)

    return {
      branchId: branch.id,
      branchName: branch.name,
      revenue,
      patientCount: currentAppointments.filter((appointment) => appointment.branchId === branch.id).length,
      completionRate: branchTasks.length ? Math.round((completed / branchTasks.length) * 100) : 0,
      staffWorking: currentStaff.filter((member) => member.branchId === branch.id && member.isWorking).length,
      targetRevenue: branch.targetRevenue,
    }
  })
}

export function buildDashboardPayload(input: {
  branches?: Branch[]
  staff?: Staff[]
  appointments?: Appointment[]
  sales?: Sale[]
  tasks?: ClinicTask[]
  kpiRecords?: KPIRecord[]
  recommendations?: RosterRecommendation[]
  aiSummaries?: AISummary[]
} = {}): DashboardPayload {
  const branches = input.branches ?? []
  const staff = input.staff ?? []
  const appointments = input.appointments ?? []
  const sales = input.sales ?? []
  const tasks = input.tasks ?? []

  return {
    branches,
    staff,
    appointments,
    sales,
    tasks,
    kpiRecords: input.kpiRecords ?? [],
    recommendations: input.recommendations ?? [],
    aiSummaries: input.aiSummaries ?? [],
    branchKpis: buildBranchKpis(branches, tasks, staff, appointments, sales),
  }
}
