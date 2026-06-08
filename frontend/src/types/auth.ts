import type { StaffRole } from './clinic'

export type AuthRole = StaffRole | 'admin'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: AuthRole
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  role: AuthRole
  clinicName?: string
}

export type AuthResponse = {
  token?: string
  accessToken?: string
  user: AuthUser
}
