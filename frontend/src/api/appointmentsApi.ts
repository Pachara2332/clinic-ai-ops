import { environment } from '../constants/environment'
import { getAccessToken } from '../hooks/useAuth'
import type { Appointment, RosterRecommendation } from '../types/clinic'

export type AppointmentCreatePayload = Omit<Appointment, 'id'>
export type AppointmentStatus = Appointment['status']
export type GenerateRosterPayload = {
  branchId: string
  dayName: string
}

function authHeaders(headers?: HeadersInit) {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${environment.apiUrl}${path}`, {
    ...init,
    headers: authHeaders(init.headers),
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'Appointments API unavailable'
    throw new Error(message)
  }

  return data as T
}

export async function fetchAppointments() {
  const data = await apiRequest<Appointment[] | { appointments: Appointment[] }>('/api/appointments')
  return Array.isArray(data) ? data : data.appointments
}

export async function createAppointment(payload: AppointmentCreatePayload) {
  return apiRequest<Appointment | { appointment: Appointment }>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  return apiRequest<Appointment | { appointment: Appointment }>(`/api/appointments/${appointmentId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export async function generateRoster(payload: GenerateRosterPayload) {
  const data = await apiRequest<RosterRecommendation | { roster: RosterRecommendation } | { recommendation: RosterRecommendation }>('/api/ai/roster', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if ('roster' in data) return data.roster
  if ('recommendation' in data) return data.recommendation
  return data
}
