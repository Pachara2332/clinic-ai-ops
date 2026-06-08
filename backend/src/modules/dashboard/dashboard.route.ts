import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { dashboardController } from './dashboard.controller.js'

export const dashboardRoute = Router()

dashboardRoute.get('/', asyncHandler(dashboardController))
