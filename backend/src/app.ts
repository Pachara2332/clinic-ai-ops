import cors from 'cors'
import express from 'express'
import { aiRoute } from './modules/ai/ai.route.js'
import { appointmentsRoute } from './modules/appointments/appointments.route.js'
import { authRoute } from './modules/auth/auth.route.js'
import { dashboardRoute } from './modules/dashboard/dashboard.route.js'
import { staffRoute } from './modules/staff/staff.route.js'
import { tasksRoute } from './modules/tasks/tasks.route.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { env } from './configs/env.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'clinic-ai-ops-api' })
  })

  app.use('/api/auth', authRoute)
  app.use('/api/dashboard', dashboardRoute)
  app.use('/api/appointments', appointmentsRoute)
  app.use('/api/staff', staffRoute)
  app.use('/api/tasks', tasksRoute)
  app.use('/api/ai', aiRoute)
  app.use(errorMiddleware)

  return app
}
