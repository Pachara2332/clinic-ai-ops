import { buildDashboardPayload } from '../../data/clinic-data.js'
import { listDashboardData, updateTaskStatus as updateTaskStatusRecord } from '../dashboard/dashboard.repository.js'

export async function updateTaskStatus(taskId: string, action: 'start' | 'complete') {
  await updateTaskStatusRecord(taskId, action)
  return buildDashboardPayload(await listDashboardData())
}
