import type { Request, Response } from 'express'
import { getDashboard } from './dashboard.service.js'

export async function dashboardController(_req: Request, res: Response) {
  res.json(await getDashboard())
}
