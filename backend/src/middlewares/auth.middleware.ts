import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { authConfig } from '../configs/auth.js'
import { AppError } from '../utils/appError.js'

type AuthenticatedUser = {
  id: string
  email: string
  role: string
}

type AuthenticatedRequest = Request & {
  authUser?: AuthenticatedUser
}

function readBearerToken(req: Request) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return undefined
  return header.slice('Bearer '.length).trim()
}

function readCookieToken(req: Request) {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) return undefined

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
  const accessCookie = cookies.find((cookie) => cookie.startsWith('clinic_access_token='))
  if (!accessCookie) return undefined

  return decodeURIComponent(accessCookie.slice('clinic_access_token='.length))
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = readBearerToken(req) ?? readCookieToken(req)
  if (!token) {
    next(new AppError('Authentication required', 401))
    return
  }

  try {
    const payload = jwt.verify(token, authConfig.jwtSecret)
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw new Error('Invalid token payload')
    }

    req.authUser = {
      id: payload.sub,
      email: String(payload.email ?? ''),
      role: String(payload.role ?? ''),
    }
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}

export function requireRoles(...roles: string[]) {
  const allowedRoles = new Set(roles)

  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.authUser || !allowedRoles.has(req.authUser.role)) {
      next(new AppError('Forbidden', 403))
      return
    }

    next()
  }
}
