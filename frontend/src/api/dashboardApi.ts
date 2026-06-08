import { environment } from '../constants/environment'
import type { DashboardPayload } from '../types/clinic'

export async function fetchDashboard() {
  const response = await fetch(`${environment.apiUrl}/api/dashboard`)
  if (!response.ok) throw new Error('API unavailable')
  return (await response.json()) as DashboardPayload
}

export async function loginDemo(email: string, password: string) {
  const response = await fetch(`${environment.apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error('Login failed')
  return response.json()
}

export async function updateTaskStatus(taskId: string, action: 'start' | 'complete') {
  const response = await fetch(`${environment.apiUrl}/api/tasks/${taskId}/${action}`, { method: 'POST' })
  if (!response.ok) throw new Error('Task update failed')
  return (await response.json()) as DashboardPayload
}
