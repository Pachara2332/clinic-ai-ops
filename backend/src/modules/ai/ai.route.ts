import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { rosterController, summaryController } from './ai.controller.js'

export const aiRoute = Router()

aiRoute.post('/roster', asyncHandler(rosterController))
aiRoute.post('/summary', asyncHandler(summaryController))
