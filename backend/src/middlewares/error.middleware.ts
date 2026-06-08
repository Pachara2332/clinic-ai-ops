import type { ErrorRequestHandler } from 'express'

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error.status === 'number' ? error.status : 500
  res.status(status).json({
    message: error.message ?? 'Internal server error',
  })
}
