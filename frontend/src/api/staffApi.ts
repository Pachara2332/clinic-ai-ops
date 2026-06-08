import { environment } from '../constants/environment'
import { getAccessToken } from '../hooks/useAuth'
import type { Staff } from '../types/clinic'

export type StaffCreatePayload = Omit<Staff, 'id'>
export type StaffUpdatePayload = Partial<Omit<Staff, 'id'>>

async function staffRequest(path: string, init: RequestInit) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  }

  const response = await fetch(`${environment.apiUrl}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = typeof data?.message === 'string' ? data.message : 'Staff API unavailable'
    throw new Error(message)
  }

  return response.json().catch(() => ({}))
}

export async function createStaff(payload: StaffCreatePayload) {
  return staffRequest('/api/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateStaff(staffId: string, payload: StaffUpdatePayload) {
  return staffRequest(`/api/staff/${staffId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteStaff(staffId: string) {
  return staffRequest(`/api/staff/${staffId}`, {
    method: 'DELETE',
  })
}
