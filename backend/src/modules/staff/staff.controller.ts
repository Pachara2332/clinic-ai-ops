import type { Request, Response } from 'express'
import { createStaff, deleteStaff, listStaff, updateStaff } from './staff.service.js'

export async function listStaffController(_req: Request, res: Response) {
  res.json(await listStaff())
}

export async function createStaffController(req: Request, res: Response) {
  res.status(201).json(await createStaff(req.body))
}

export async function updateStaffController(req: Request, res: Response) {
  res.json(await updateStaff(String(req.params.staffId), req.body))
}

export async function deleteStaffController(req: Request, res: Response) {
  await deleteStaff(String(req.params.staffId))
  res.status(204).send()
}
