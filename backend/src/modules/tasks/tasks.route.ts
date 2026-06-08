import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { completeTaskController, startTaskController } from './tasks.controller.js'

export const tasksRoute = Router()

tasksRoute.post('/:taskId/start', asyncHandler(startTaskController))
tasksRoute.post('/:taskId/complete', asyncHandler(completeTaskController))
