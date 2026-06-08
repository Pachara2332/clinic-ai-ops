import { buildDashboardPayload } from '../../data/clinic-data.js'
import { listDashboardData } from './dashboard.repository.js'

export async function getDashboard() {
  return buildDashboardPayload(await listDashboardData())
}
