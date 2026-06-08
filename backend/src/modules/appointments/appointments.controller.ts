import type { Request, Response } from 'express'
import { createAppointment, listAppointments, updateAppointmentStatus } from './appointments.service.js'

export async function listAppointmentsController(_req: Request, res: Response) {
  res.json(await listAppointments())
}

export async function createAppointmentController(req: Request, res: Response) {
  res.status(201).json(await createAppointment(req.body))
}

export async function updateAppointmentStatusController(req: Request, res: Response) {
  const { status } = req.body as { status?: string }
  res.json(await updateAppointmentStatus(String(req.params.appointmentId), status))
}
