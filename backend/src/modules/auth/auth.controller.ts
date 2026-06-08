import type { Request, Response } from 'express'
import { login, register } from './auth.service.js'

const accessCookie = {
  name: 'clinic_access_token',
  options: {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: false,
    maxAge: 8 * 60 * 60 * 1000,
  },
}

function sendAuthResponse(res: Response, status: number, auth: Awaited<ReturnType<typeof login>>) {
  res.cookie(accessCookie.name, auth.token, accessCookie.options)
  res.status(status).json(auth)
}

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string }
  sendAuthResponse(res, 200, await login(email, password))
}

export async function registerController(req: Request, res: Response) {
  const { name, email, password, role } = req.body as {
    name?: string
    email?: string
    password?: string
    role?: string
  }
  sendAuthResponse(res, 201, await register({ name, email, password, role }))
}

export function logoutController(_req: Request, res: Response) {
  res.clearCookie(accessCookie.name, accessCookie.options)
  res.status(204).send()
}
