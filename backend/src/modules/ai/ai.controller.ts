import type { Request, Response } from 'express'
import { AppError } from '../../utils/appError.js'
import { generateDailySummary, getDailySummaries, getRosterRecommendation } from './ai.service.js'

export async function rosterController(req: Request, res: Response) {
  const { branchId, dayName = 'Saturday' } = req.body as { branchId?: string; dayName?: string }
  const normalizedBranchId = branchId?.trim()
  if (!normalizedBranchId) {
    throw new AppError('Branch is required', 400)
  }

  res.json(await getRosterRecommendation(normalizedBranchId, dayName))
}

export async function summaryController(req: Request, res: Response) {
  const { branchId } = req.body as { branchId?: string }
  const normalizedBranchId = branchId?.trim()

  if (!normalizedBranchId) {
    res.json(await getDailySummaries())
    return
  }

  try {
    res.json(await generateDailySummary(normalizedBranchId))
  } catch (error) {
    if (error instanceof Error && error.message === 'Branch not found') {
      throw new AppError('Branch not found', 404)
    }
    throw error
  }
}
