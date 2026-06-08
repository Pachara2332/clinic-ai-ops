import { describe, expect, it } from 'vitest'
import { buildDashboardPayload, recommendRoster } from './clinic-data.js'
import type { Appointment, Branch, ClinicTask, Sale } from '../types/clinic.js'

const branches: Branch[] = [
  { id: 'branch-a', name: 'Branch A', city: 'Mahasarakham', targetRevenue: 180000 },
]

const appointments: Appointment[] = [
  { id: 'apt-01', branchId: 'branch-a', patientName: 'Patient 1', service: 'Botox', startsAt: '2026-06-06T09:15:00.000Z', status: 'confirmed' },
  { id: 'apt-02', branchId: 'branch-a', patientName: 'Patient 2', service: 'Laser', startsAt: '2026-06-06T10:00:00.000Z', status: 'waiting' },
  { id: 'apt-03', branchId: 'branch-a', patientName: 'Patient 3', service: 'Filler', startsAt: '2026-06-06T11:30:00.000Z', status: 'confirmed' },
  { id: 'apt-04', branchId: 'branch-a', patientName: 'Patient 4', service: 'Acne', startsAt: '2026-06-06T13:00:00.000Z', status: 'confirmed' },
]

const sales: Sale[] = [
  { id: 'sale-01', branchId: 'branch-a', amount: 42000, service: 'Botox', soldAt: '2026-06-06T09:55:00.000Z' },
]

const tasks: ClinicTask[] = [
  { id: 'task-01', branchId: 'branch-a', staffId: 'staff-01', title: 'Confirm appointments', queueCount: 2, status: 'completed' },
  { id: 'task-02', branchId: 'branch-a', staffId: 'staff-02', title: 'Prepare room', queueCount: 1, status: 'todo' },
]

describe('clinic data rules', () => {
  it('recommends more staff on Saturday peak days', () => {
    const roster = recommendRoster('branch-a', 'Saturday', appointments, sales)
    expect(roster.doctors).toBe(3)
    expect(roster.nurses).toBe(4)
    expect(roster.reception).toBe(2)
  })

  it('builds dashboard KPI payload from tasks', () => {
    const payload = buildDashboardPayload({ branches, appointments, sales, tasks })
    expect(payload.branches).toHaveLength(1)
    expect(payload.tasks).toHaveLength(2)
    expect(payload.branchKpis[0]?.completionRate).toBeGreaterThan(0)
  })
})
