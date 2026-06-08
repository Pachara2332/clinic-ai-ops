import { useCallback, useMemo, useState } from 'react'
import { loginWithBackend, logoutWithBackend, registerWithBackend } from '../api/authApi'
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth'

const SESSION_KEY = 'clinic_session'

let accessToken: string | null = null

export function getAccessToken() {
  return accessToken
}

function setAccessToken(token: string | null) {
  accessToken = token
}

function readStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    if (!stored) return null

    const user = JSON.parse(stored) as AuthUser
    return user?.id && user?.email ? user : null
  } catch {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

function saveStoredUser(user: AuthUser, remember: boolean) {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(user))
}

function clearStoredUser() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAuthed = Boolean(user)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const login = useCallback(async (payload: LoginPayload, remember = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const auth = await loginWithBackend({
        email: payload.email.trim(),
        password: payload.password,
      })

      setAccessToken(auth.token)
      setUser(auth.user)
      saveStoredUser(auth.user, remember)
      return auth
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload, remember = true) => {
    setIsLoading(true)
    setError(null)

    try {
      const auth = await registerWithBackend({
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim(),
        clinicName: payload.clinicName?.trim() || undefined,
      })

      setAccessToken(auth.token)
      setUser(auth.user)
      saveStoredUser(auth.user, remember)
      return auth
    } catch (err) {
      const message = err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setError(null)
    clearStoredUser()
    void logoutWithBackend()
  }, [])

  return useMemo(() => ({
    user,
    isAuthed,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    getAccessToken,
  }), [clearError, error, isAuthed, isLoading, login, logout, register, user])
}

export type UseAuthReturn = ReturnType<typeof useAuth>
