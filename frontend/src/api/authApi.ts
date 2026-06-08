import { environment } from '../constants/environment'
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth'

type AuthResult = {
  token: string
  user: AuthResponse['user']
}

async function postAuth(path: string, body?: unknown) {
  const response = await fetch(`${environment.apiUrl}${path}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'ไม่สามารถเชื่อมต่อ backend ได้'
    throw new Error(message)
  }

  return data
}

function normalizeAuthResponse(data: AuthResponse): AuthResult {
  const token = data.token ?? data.accessToken
  if (!token || !data.user) {
    throw new Error('backend ส่งข้อมูล auth กลับมาไม่ครบ')
  }

  return { token, user: data.user }
}

export async function loginWithBackend(payload: LoginPayload) {
  return normalizeAuthResponse(await postAuth('/api/auth/login', payload) as AuthResponse)
}

export async function registerWithBackend(payload: RegisterPayload) {
  return normalizeAuthResponse(await postAuth('/api/auth/register', payload) as AuthResponse)
}

export async function logoutWithBackend() {
  await postAuth('/api/auth/logout').catch(() => undefined)
}
