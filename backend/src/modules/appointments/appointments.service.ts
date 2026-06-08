import { Prisma } from '@prisma/client'
import prisma from '../../configs/prisma.js'
import type { Appointment, AppointmentStatus } from '../../types/clinic.js'
import { AppError } from '../../utils/appError.js'

const allowedStatuses: AppointmentStatus[] = ['confirmed', 'waiting', 'done']

type AppointmentInput = {
  branchId?: string
  patientName?: string
  service?: string
  startsAt?: string
  status?: string
}

type PrismaAppointment = {
  id: string
  branchId: string
  patientName: string
  service: string
  startsAt: Date
  status: string
}

function serializeAppointment(appointment: PrismaAppointment): Appointment {
  return {
    id: appointment.id,
    branchId: appointment.branchId,
    patientName: appointment.patientName,
    service: appointment.service,
    startsAt: appointment.startsAt.toISOString(),
    status: appointment.status as AppointmentStatus,
  }
}

function parseStatus(status?: string) {
  const normalizedStatus = status?.trim().toLowerCase() as AppointmentStatus | undefined
  if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
    throw new AppError('Valid appointment status is required', 400)
  }

  return normalizedStatus
}

async function ensureBranch(branchId: string) {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } })
  if (!branch) throw new AppError('Branch not found', 400)
}

export async function listAppointments() {
  const persistedAppointments = await prisma.patientAppointment.findMany({
    orderBy: [{ startsAt: 'asc' }],
  })

  return persistedAppointments.map(serializeAppointment)
}

export async function createAppointment(input: AppointmentInput) {
  const branchId = input.branchId?.trim()
  const patientName = input.patientName?.trim()
  const service = input.service?.trim()
  const status = input.status ? parseStatus(input.status) : 'confirmed'
  const startsAt = input.startsAt ? new Date(input.startsAt) : undefined

  if (!branchId) throw new AppError('Branch is required', 400)
  if (!patientName) throw new AppError('Patient name is required', 400)
  if (!service) throw new AppError('Service is required', 400)
  if (!startsAt || Number.isNaN(startsAt.getTime())) throw new AppError('Valid appointment time is required', 400)

  await ensureBranch(branchId)

  const appointment = await prisma.patientAppointment.create({
    data: {
      branchId,
      patientName,
      service,
      startsAt,
      status,
    },
  })

  return serializeAppointment(appointment)
}

export async function updateAppointmentStatus(appointmentId: string, status?: string) {
  try {
    const appointment = await prisma.patientAppointment.update({
      where: { id: appointmentId },
      data: { status: parseStatus(status) },
    })
    return serializeAppointment(appointment)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError('Appointment not found', 404)
    }
    throw error
  }
}
