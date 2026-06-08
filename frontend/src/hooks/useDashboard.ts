import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createAppointment,
  fetchAppointments,
  generateRoster,
  updateAppointmentStatus,
  type AppointmentCreatePayload,
  type AppointmentStatus,
  type GenerateRosterPayload,
} from '../api/appointmentsApi'
import { generateDailySummary } from '../api/aiApi'
import { fetchDashboard, loginDemo, updateTaskStatus } from '../api/dashboardApi'
import { createStaff, deleteStaff, updateStaff } from '../api/staffApi'
import type { AISummary, Appointment, DashboardPayload, RosterRecommendation, Staff } from '../types/clinic'

const emptyDashboard: DashboardPayload = {
  branches: [],
  staff: [],
  appointments: [],
  sales: [],
  tasks: [],
  kpiRecords: [],
  recommendations: [],
  aiSummaries: [],
  branchKpis: [],
}

function withStaff(dashboard: DashboardPayload, staff: Staff[]): DashboardPayload {
  return {
    ...dashboard,
    staff,
    branchKpis: dashboard.branchKpis.map((kpi) => ({
      ...kpi,
      staffWorking: staff.filter((member) => member.branchId === kpi.branchId && member.isWorking).length,
    })),
  }
}

function withAppointments(dashboard: DashboardPayload, appointments: Appointment[]): DashboardPayload {
  return {
    ...dashboard,
    appointments,
    branchKpis: dashboard.branchKpis.map((kpi) => ({
      ...kpi,
      patientCount: appointments.filter((appointment) => appointment.branchId === kpi.branchId).length,
    })),
  }
}

function withRoster(dashboard: DashboardPayload, roster: RosterRecommendation): DashboardPayload {
  return {
    ...dashboard,
    recommendations: [
      ...dashboard.recommendations.filter((item) => !(item.branchId === roster.branchId && item.dayName === roster.dayName)),
      roster,
    ],
  }
}

function withAiSummary(dashboard: DashboardPayload, summary: AISummary): DashboardPayload {
  return {
    ...dashboard,
    aiSummaries: [
      ...dashboard.aiSummaries.filter((item) => item.branchId !== summary.branchId),
      summary,
    ],
  }
}

function isDashboardPayload(data: unknown): data is DashboardPayload {
  return Boolean(data && typeof data === 'object' && 'branches' in data && 'staff' in data)
}

function getAppointment(data: Appointment | { appointment: Appointment }) {
  return 'appointment' in data ? data.appointment : data
}

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardPayload>(emptyDashboard)
  const [activeBranchId, setActiveBranchId] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [email, setEmail] = useState('admin@clinic.ai')
  const [password, setPassword] = useState('clinic1234')
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState('Ready to load database data')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchDashboard()
      setDashboard(data)
      setActiveBranchId((current) => (
        current && data.branches.some((branch) => branch.id === current)
          ? current
          : data.branches[0]?.id ?? ''
      ))
      setNotice('Loaded database data')
    } catch {
      setNotice('Unable to load dashboard from database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async () => {
    setIsLoading(true)
    try {
      await loginDemo(email, password)
      setIsAuthed(true)
      setNotice('Logged in')
      await loadDashboard()
    } catch {
      setNotice('Login failed')
    } finally {
      setIsLoading(false)
    }
  }, [email, loadDashboard, password])

  const updateTask = useCallback(async (taskId: string, action: 'start' | 'complete') => {
    setIsLoading(true)
    try {
      setDashboard(await updateTaskStatus(taskId, action))
      setNotice(action === 'start' ? 'Task started' : 'Task completed')
    } catch {
      setNotice('Unable to update task in database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadAppointments = useCallback(async () => {
    setIsLoading(true)
    try {
      const appointments = await fetchAppointments()
      setDashboard((current) => withAppointments(current, appointments))
      setNotice('Loaded appointments from database')
    } catch {
      setNotice('Unable to load appointments from database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addAppointment = useCallback(async (payload: AppointmentCreatePayload) => {
    setIsLoading(true)
    try {
      const created = getAppointment(await createAppointment(payload))
      setDashboard((current) => withAppointments(current, [...current.appointments, created]))
      setNotice('Created appointment')
    } catch {
      setNotice('Unable to create appointment in database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setAppointmentStatus = useCallback(async (appointmentId: string, status: AppointmentStatus) => {
    setIsLoading(true)
    try {
      const updated = getAppointment(await updateAppointmentStatus(appointmentId, status))
      setDashboard((current) => withAppointments(
        current,
        current.appointments.map((appointment) => appointment.id === appointmentId ? { ...appointment, ...updated } : appointment),
      ))
      setNotice('Updated appointment status')
    } catch {
      setNotice('Unable to update appointment status in database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const runRosterRecommendation = useCallback(async (payload: GenerateRosterPayload) => {
    setIsLoading(true)
    try {
      const roster = await generateRoster(payload)
      setDashboard((current) => withRoster(current, roster))
      setNotice('Generated roster recommendation')
      return roster
    } catch {
      setNotice('Unable to generate roster from database appointments')
      throw new Error('Unable to generate roster from database appointments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const runDailySummary = useCallback(async (branchId: string) => {
    setIsLoading(true)
    try {
      const summary = await generateDailySummary(branchId)
      setDashboard((current) => withAiSummary(current, summary))
      setNotice('Generated AI daily summary')
      return summary
    } catch {
      setNotice('Unable to generate AI daily summary')
      throw new Error('Unable to generate AI daily summary')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addStaff = useCallback(async (payload: Omit<Staff, 'id'>) => {
    setIsLoading(true)
    try {
      const data = await createStaff(payload)
      if (isDashboardPayload(data)) {
        setDashboard(data)
      } else {
        const created = ('staff' in data ? data.staff : data) as Staff
        setDashboard((current) => withStaff(current, [...current.staff, created]))
      }
      setNotice('Created staff')
    } catch {
      setNotice('Unable to create staff in database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editStaff = useCallback(async (staffId: string, payload: Partial<Omit<Staff, 'id'>>) => {
    setIsLoading(true)
    try {
      const data = await updateStaff(staffId, payload)
      if (isDashboardPayload(data)) {
        setDashboard(data)
      } else {
        const updated = ('staff' in data ? data.staff : data) as Staff
        setDashboard((current) => withStaff(
          current,
          current.staff.map((member) => member.id === staffId ? { ...member, ...updated } : member),
        ))
      }
      setNotice('Updated staff')
    } catch {
      setNotice('Unable to update staff in database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeStaff = useCallback(async (staffId: string) => {
    setIsLoading(true)
    try {
      const data = await deleteStaff(staffId)
      if (isDashboardPayload(data)) {
        setDashboard(data)
      } else {
        setDashboard((current) => withStaff(current, current.staff.filter((member) => member.id !== staffId)))
      }
      setNotice('Deleted staff')
    } catch {
      setNotice('Unable to delete staff from database')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0)
    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  const activeData = useMemo(() => {
    const branchTasks = dashboard.tasks.filter((task) => task.branchId === activeBranchId)
    return {
      activeBranch: dashboard.branches.find((branch) => branch.id === activeBranchId),
      activeKpi: dashboard.branchKpis.find((kpi) => kpi.branchId === activeBranchId),
      branchTasks,
      branchAppointments: dashboard.appointments
        .filter((appointment) => appointment.branchId === activeBranchId)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
      branchStaff: dashboard.staff.filter((member) => member.branchId === activeBranchId),
      roster: dashboard.recommendations.find((item) => item.branchId === activeBranchId),
      aiSummary: dashboard.aiSummaries.find((item) => item.branchId === activeBranchId),
    }
  }, [activeBranchId, dashboard])

  const totals = useMemo(() => ({
    revenue: dashboard.sales.reduce((sum, sale) => sum + sale.amount, 0),
    patients: dashboard.appointments.length,
    workingStaff: dashboard.staff.filter((member) => member.isWorking).length,
    completionRate: Math.round((dashboard.tasks.filter((task) => task.status === 'completed').length / Math.max(dashboard.tasks.length, 1)) * 100),
  }), [dashboard])

  return {
    dashboard,
    activeBranchId,
    setActiveBranchId,
    isAuthed,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    notice,
    loadDashboard,
    login,
    updateTask,
    loadAppointments,
    addAppointment,
    setAppointmentStatus,
    runRosterRecommendation,
    runDailySummary,
    addStaff,
    editStaff,
    removeStaff,
    activeData,
    totals,
  }
}
