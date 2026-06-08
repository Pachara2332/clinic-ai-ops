import { Router } from 'express'
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createAppointmentController,
  listAppointmentsController,
  updateAppointmentStatusController,
} from './appointments.controller.js'

export const appointmentsRoute = Router()

appointmentsRoute.use(requireAuth)
appointmentsRoute.get('/', asyncHandler(listAppointmentsController))
appointmentsRoute.post('/', requireRoles('admin', 'manager', 'reception'), asyncHandler(createAppointmentController))
appointmentsRoute.put('/:appointmentId/status', requireRoles('admin', 'manager', 'reception'), asyncHandler(updateAppointmentStatusController))
