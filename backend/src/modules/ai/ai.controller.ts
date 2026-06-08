import type { Request, Response } from 'express'
import { AppError } from '../../utils/appError.js'
import { getDailySummaries, getRosterRecommendation } from './ai.service.js'

export async function rosterController(req: Request, res: Response) {
  const { branchId, dayName = 'Saturday' } = req.body as { branchId?: string; dayName?: string }
  const normalizedBranchId = branchId?.trim()
  if (!normalizedBranchId) {
    throw new AppError('Branch is required', 400)
  }

  res.json(await getRosterRecommendation(normalizedBranchId, dayName))
}

export async function summaryController(_req: Request, res: Response) {
  res.json(await getDailySummaries())
}
