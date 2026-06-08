import { Prisma, TaskStatus as PrismaTaskStatus } from '@prisma/client'
import prisma from '../../configs/prisma.js'
import type {
  AISummary,
  Appointment,
  Branch,
  ClinicTask,
  KPIRecord,
  RosterRecommendation,
  Sale,
  Staff,
  StaffRole,
  TaskStatus,
} from '../../types/clinic.js'
import { AppError } from '../../utils/appError.js'

const taskStatusByPrisma: Record<PrismaTaskStatus, TaskStatus> = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
}

function serializeDate(date?: Date | null) {
  return date?.toISOString()
}

export function serializeBranch(branch: { id: string; name: string; city: string; targetRevenue: number }): Branch {
  return {
    id: branch.id,
    name: branch.name,
    city: branch.city,
    targetRevenue: branch.targetRevenue,
  }
}

export function serializeStaff(member: {
  id: string
  branchId: string
  name: string
  role: string
  isWorking: boolean
  taskLoad: number
}): Staff {
  return {
    id: member.id,
    branchId: member.branchId,
    name: member.name,
    role: member.role.toLowerCase() as StaffRole,
    isWorking: member.isWorking,
    taskLoad: member.taskLoad,
  }
}

export function serializeTask(task: {
  id: string
  branchId: string
  staffId: string
  title: string
  queueCount: number
  status: PrismaTaskStatus
  startedAt: Date | null
  completedAt: Date | null
}): ClinicTask {
  return {
    id: task.id,
    branchId: task.branchId,
    staffId: task.staffId,
    title: task.title,
    queueCount: task.queueCount,
    status: taskStatusByPrisma[task.status],
    startedAt: serializeDate(task.startedAt),
    completedAt: serializeDate(task.completedAt),
  }
}

export function serializeAppointment(appointment: {
  id: string
  branchId: string
  patientName: string
  service: string
  startsAt: Date
  status: string
}): Appointment {
  return {
    id: appointment.id,
    branchId: appointment.branchId,
    patientName: appointment.patientName,
    service: appointment.service,
    startsAt: appointment.startsAt.toISOString(),
    status: appointment.status as Appointment['status'],
  }
}

function serializeSale(sale: { id: string; branchId: string; amount: number; service: string; soldAt: Date }): Sale {
  return {
    id: sale.id,
    branchId: sale.branchId,
    amount: sale.amount,
    service: sale.service,
    soldAt: sale.soldAt.toISOString(),
  }
}

function serializeKpiRecord(record: {
  id: string
  branchId: string
  staffId: string
  taskId: string
  durationMinutes: number
  score: number
  recordedAt: Date
}): KPIRecord {
  return {
    id: record.id,
    branchId: record.branchId,
    staffId: record.staffId,
    taskId: record.taskId,
    durationMinutes: record.durationMinutes,
    score: record.score,
    recordedAt: record.recordedAt.toISOString(),
  }
}

function serializeRecommendation(recommendation: {
  branchId: string
  dayName: string
  doctors: number
  nurses: number
  reception: number
  reason: string
}): RosterRecommendation {
  return {
    branchId: recommendation.branchId,
    dayName: recommendation.dayName,
    doctors: recommendation.doctors,
    nurses: recommendation.nurses,
    reception: recommendation.reception,
    reason: recommendation.reason,
  }
}

function serializeAiSummary(summary: { branchId: string; summary: string; generatedAt: Date }): AISummary {
  return {
    branchId: summary.branchId,
    summary: summary.summary,
    generatedAt: summary.generatedAt.toISOString(),
  }
}

export async function listDashboardData() {
  const [branches, staff, appointments, sales, tasks, kpiRecords, recommendations, aiSummaries] = await Promise.all([
    prisma.branch.findMany({ orderBy: [{ name: 'asc' }] }),
    prisma.staff.findMany({ orderBy: [{ branchId: 'asc' }, { name: 'asc' }] }),
    prisma.patientAppointment.findMany({ orderBy: [{ startsAt: 'asc' }] }),
    prisma.sale.findMany({ orderBy: [{ soldAt: 'desc' }] }),
    prisma.task.findMany({ orderBy: [{ createdAt: 'asc' }] }),
    prisma.kPIRecord.findMany({ orderBy: [{ recordedAt: 'desc' }] }),
    prisma.rosterRecommendation.findMany({ orderBy: [{ generatedAt: 'desc' }] }),
    prisma.aISummary.findMany({ orderBy: [{ generatedAt: 'desc' }] }),
  ])

  return {
    branches: branches.map(serializeBranch),
    staff: staff.map(serializeStaff),
    appointments: appointments.map(serializeAppointment),
    sales: sales.map(serializeSale),
    tasks: tasks.map(serializeTask),
    kpiRecords: kpiRecords.map(serializeKpiRecord),
    recommendations: recommendations.map(serializeRecommendation),
    aiSummaries: aiSummaries.map(serializeAiSummary),
  }
}

export async function updateTaskStatus(taskId: string, action: 'start' | 'complete') {
  const now = new Date()

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data:
        action === 'start'
          ? { status: 'IN_PROGRESS', startedAt: now, completedAt: null }
          : { status: 'COMPLETED', startedAt: now, completedAt: now },
    })

    return serializeTask(task)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError('Task not found', 404)
    }
    throw error
  }
}
