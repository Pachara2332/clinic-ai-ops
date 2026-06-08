import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { authConfig } from '../../configs/auth.js'
import prisma from '../../configs/prisma.js'
import { AppError } from '../../utils/appError.js'

type AuthUser = {
  id: string
  name: string
  email: string
  role: string
}

type RegisterInput = {
  name?: string
  email?: string
  password?: string
  role?: string
}

function signAuthResponse(user: AuthUser) {
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    authConfig.jwtSecret,
    { expiresIn: authConfig.tokenTtl },
  )

  return { token, user }
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase()
}

function assertEmail(email?: string): asserts email is string {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('Valid email is required', 400)
  }
}

function assertPassword(password?: string): asserts password is string {
  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400)
  }
}

export async function login(email?: string, password?: string) {
  const normalizedEmail = normalizeEmail(email)

  assertEmail(normalizedEmail)
  assertPassword(password)

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401)
  }

  return signAuthResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
}

export async function register(input: RegisterInput) {
  const email = normalizeEmail(input.email)
  const name = input.name?.trim()
  const password = input.password
  const role = input.role?.trim() || 'manager'

  if (!name) {
    throw new AppError('Name is required', 400)
  }
  assertEmail(email)
  assertPassword(password)

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new AppError('Email is already registered', 409)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  })

  return signAuthResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
}
