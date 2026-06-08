import { Router } from 'express'
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createStaffController,
  deleteStaffController,
  listStaffController,
  updateStaffController,
} from './staff.controller.js'

export const staffRoute = Router()

staffRoute.use(requireAuth, requireRoles('admin', 'manager'))
staffRoute.get('/', asyncHandler(listStaffController))
staffRoute.post('/', asyncHandler(createStaffController))
staffRoute.put('/:staffId', asyncHandler(updateStaffController))
staffRoute.delete('/:staffId', asyncHandler(deleteStaffController))
