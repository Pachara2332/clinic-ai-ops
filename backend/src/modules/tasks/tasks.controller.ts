import type { Request, Response } from 'express'
import { updateTaskStatus } from './tasks.service.js'

export async function startTaskController(req: Request, res: Response) {
  res.json(await updateTaskStatus(String(req.params.taskId), 'start'))
}

export async function completeTaskController(req: Request, res: Response) {
  res.json(await updateTaskStatus(String(req.params.taskId), 'complete'))
}
