import { env } from './env.js'

export const authConfig = {
  jwtSecret: env.jwtSecret,
  tokenTtl: '8h' as const,
}
