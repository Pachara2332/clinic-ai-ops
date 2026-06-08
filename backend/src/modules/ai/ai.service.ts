import { recommendRoster } from '../../data/clinic-data.js'
import { listDashboardData } from '../dashboard/dashboard.repository.js'

export async function getRosterRecommendation(branchId: string, dayName = 'Saturday') {
  const { appointments, sales } = await listDashboardData()
  return recommendRoster(branchId, dayName, appointments, sales)
}

export async function getDailySummaries() {
  const { aiSummaries } = await listDashboardData()
  return aiSummaries
}
