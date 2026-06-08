import { environment } from '../constants/environment'
import { getAccessToken } from '../hooks/useAuth'
import type { AISummary } from '../types/clinic'

function authHeaders(headers?: HeadersInit) {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }
}

async function aiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${environment.apiUrl}${path}`, {
    ...init,
    headers: authHeaders(init.headers),
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'AI API unavailable'
    throw new Error(message)
  }

  return data as T
}

export async function generateDailySummary(branchId: string) {
  return aiRequest<AISummary>('/api/ai/summary', {
    method: 'POST',
    body: JSON.stringify({ branchId }),
  })
}
