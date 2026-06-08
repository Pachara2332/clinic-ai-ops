import { Prisma, StaffRole as PrismaStaffRole } from '@prisma/client'
import prisma from '../../configs/prisma.js'
import type { Staff, StaffRole } from '../../types/clinic.js'
import { AppError } from '../../utils/appError.js'

const allowedRoles: StaffRole[] = ['doctor', 'nurse', 'reception', 'manager']

type StaffInput = {
  branchId?: string
  name?: string
  role?: string
  isWorking?: boolean
  taskLoad?: number
}

type PrismaStaff = {
  id: string
  branchId: string
  name: string
  role: string
  isWorking: boolean
  taskLoad: number
}

export function serializeStaff(member: PrismaStaff): Staff {
  return {
    id: member.id,
    branchId: member.branchId,
    name: member.name,
    role: member.role.toLowerCase() as StaffRole,
    isWorking: member.isWorking,
    taskLoad: member.taskLoad,
  }
}

function parseStaffRole(role?: string) {
  const normalizedRole = role?.trim().toLowerCase() as StaffRole | undefined
  if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
    throw new AppError('Valid staff role is required', 400)
  }

  return normalizedRole.toUpperCase() as PrismaStaffRole
}

function parseTaskLoad(taskLoad?: number) {
  if (taskLoad === undefined) return 0
  if (!Number.isInteger(taskLoad) || taskLoad < 0) {
    throw new AppError('Task load must be a non-negative integer', 400)
  }

  return taskLoad
}

async function ensureBranch(branchId: string) {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } })
  if (!branch) {
    throw new AppError('Branch not found', 400)
  }
}

export async function listStaff() {
  const staff = await prisma.staff.findMany({
    orderBy: [{ branchId: 'asc' }, { name: 'asc' }],
  })

  return staff.map(serializeStaff)
}

export async function createStaff(input: StaffInput) {
  const branchId = input.branchId?.trim()
  const name = input.name?.trim()
  const role = parseStaffRole(input.role)
  const taskLoad = parseTaskLoad(input.taskLoad)

  if (!branchId) {
    throw new AppError('Branch is required', 400)
  }
  if (!name) {
    throw new AppError('Name is required', 400)
  }

  await ensureBranch(branchId)

  const staff = await prisma.staff.create({
    data: {
      branchId,
      name,
      role,
      isWorking: input.isWorking ?? true,
      taskLoad,
    },
  })

  return serializeStaff(staff)
}

export async function updateStaff(staffId: string, input: StaffInput) {
  const data: Prisma.StaffUpdateInput = {}
  const branchId = input.branchId?.trim()
  const name = input.name?.trim()

  if (branchId !== undefined) {
    if (!branchId) throw new AppError('Branch is required', 400)
    await ensureBranch(branchId)
    data.branch = { connect: { id: branchId } }
  }
  if (input.name !== undefined) {
    if (!name) throw new AppError('Name is required', 400)
    data.name = name
  }
  if (input.role !== undefined) {
    data.role = parseStaffRole(input.role)
  }
  if (input.isWorking !== undefined) {
    data.isWorking = input.isWorking
  }
  if (input.taskLoad !== undefined) {
    data.taskLoad = parseTaskLoad(input.taskLoad)
  }

  try {
    const staff = await prisma.staff.update({
      where: { id: staffId },
      data,
    })
    return serializeStaff(staff)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError('Staff not found', 404)
    }
    throw error
  }
}

export async function deleteStaff(staffId: string) {
  try {
    await prisma.staff.delete({ where: { id: staffId } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new AppError('Staff not found', 404)
      if (error.code === 'P2003') throw new AppError('Staff is linked to existing records', 409)
    }
    throw error
  }
}
