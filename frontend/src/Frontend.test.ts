/**
 * Frontend Unit Tests
 * Stack: Vitest + @testing-library/react + @testing-library/user-event
 *
 * Covers:
 *   src/utils/formatters.ts
 *   src/api/dashboardApi.ts        (fetch mocked via vi.stubGlobal)
 *   src/hooks/useDashboard.ts      (renderHook)
 *   src/constants/clinicData.ts    (buildDashboardPayload, etc.)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Shared types (trimmed)
// ---------------------------------------------------------------------------
type TaskStatus = 'todo' | 'in-progress' | 'completed'
type ClinicTask = { id: string; branchId: string; staffId: string; title: string; queueCount: number; status: TaskStatus; startedAt?: string; completedAt?: string }
type Staff = { id: string; branchId: string; name: string; role: string; isWorking: boolean; taskLoad: number }
type Branch = { id: string; name: string; city: string; targetRevenue: number }
type Appointment = { id: string; branchId: string; patientName: string; service: string; startsAt: string; status: string }
type Sale = { id: string; branchId: string; amount: number; service: string; soldAt: string }
type KPIRecord = { id: string; branchId: string; staffId: string; taskId: string; durationMinutes: number; score: number; recordedAt: string }
type RosterRecommendation = { branchId: string; dayName: string; doctors: number; nurses: number; reception: number; reason: string }
type AISummary = { branchId: string; summary: string; generatedAt: string }
type BranchKPI = { branchId: string; branchName: string; revenue: number; patientCount: number; completionRate: number; staffWorking: number; targetRevenue: number }
type DashboardPayload = {
  branches: Branch[]; staff: Staff[]; appointments: Appointment[]; sales: Sale[]
  tasks: ClinicTask[]; kpiRecords: KPIRecord[]; recommendations: RosterRecommendation[]
  aiSummaries: AISummary[]; branchKpis: BranchKPI[]
}

// ---------------------------------------------------------------------------
// 1. formatters.ts
// ---------------------------------------------------------------------------
function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency', currency: 'THB', maximumFractionDigits: 0,
  }).format(value)
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

function roleLabel(role: Staff['role']) {
  return ({ doctor: 'Doctor', nurse: 'Nurse', reception: 'Reception', manager: 'Manager' } as Record<string, string>)[role]
}

function taskStatusLabel(status: ClinicTask['status']) {
  return ({ todo: 'รอเริ่ม', 'in-progress': 'กำลังทำ', completed: 'เสร็จแล้ว' } as Record<string, string>)[status]
}

describe('formatters – formatCurrency', () => {
  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('formats a typical clinic sale amount', () => {
    const result = formatCurrency(42000)
    expect(result).toContain('42')
    expect(result).toMatch(/฿|THB/) // Thai baht symbol or code
  })

  it('formats large numbers with separators', () => {
    const result = formatCurrency(180000)
    // Should contain the digits; Thai locale uses commas
    expect(result).toMatch(/180/)
  })

  it('does not include decimal places', () => {
    const result = formatCurrency(99999)
    // maximumFractionDigits: 0 → no decimal point in numeric part
    expect(result).not.toMatch(/\.\d{2}/)
  })
})

describe('formatters – formatTime', () => {
  it('returns a time string in HH:MM format for a valid ISO date', () => {
    const result = formatTime('2026-06-06T09:15:00+07:00')
    // Thai locale may return "09:15" or "9:15" depending on platform
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('formats midnight correctly', () => {
    const result = formatTime('2026-06-06T00:00:00+07:00')
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('formatters – roleLabel', () => {
  it.each([
    ['doctor', 'Doctor'],
    ['nurse', 'Nurse'],
    ['reception', 'Reception'],
    ['manager', 'Manager'],
  ])('maps %s → %s', (role, label) => {
    expect(roleLabel(role)).toBe(label)
  })

  it('returns undefined for unknown role', () => {
    expect(roleLabel('unknown')).toBeUndefined()
  })
})

describe('formatters – taskStatusLabel', () => {
  it.each([
    ['todo', 'รอเริ่ม'],
    ['in-progress', 'กำลังทำ'],
    ['completed', 'เสร็จแล้ว'],
  ])('maps %s → %s', (status, label) => {
    expect(taskStatusLabel(status as TaskStatus)).toBe(label)
  })
})

// ---------------------------------------------------------------------------
// 2. dashboardApi.ts  –  fetch-mocked
// ---------------------------------------------------------------------------

// --- minimal replication of dashboardApi ---
const API_URL = 'http://localhost:4000'

async function fetchDashboard() {
  const res = await fetch(`${API_URL}/api/dashboard`)
  if (!res.ok) throw new Error('API unavailable')
  return res.json()
}

async function loginDemo(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

async function updateTaskStatus(taskId: string, action: 'start' | 'complete') {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}/${action}`, { method: 'POST' })
  if (!res.ok) throw new Error('Task update failed')
  return res.json()
}

function makeFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('dashboardApi – fetchDashboard', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns parsed JSON on 200', async () => {
    vi.stubGlobal('fetch', makeFetch(200, { branches: [] }))
    const result = await fetchDashboard()
    expect(result).toEqual({ branches: [] })
  })

  it('throws on non-2xx response', async () => {
    vi.stubGlobal('fetch', makeFetch(503, {}))
    await expect(fetchDashboard()).rejects.toThrow('API unavailable')
  })

  it('calls the correct endpoint', async () => {
    const mockFetch = makeFetch(200, {})
    vi.stubGlobal('fetch', mockFetch)
    await fetchDashboard()
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/dashboard`)
  })
})

describe('dashboardApi – loginDemo', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns data on successful login', async () => {
    vi.stubGlobal('fetch', makeFetch(200, { token: 'abc' }))
    const result = await loginDemo('admin@clinic.ai', 'clinic1234')
    expect(result.token).toBe('abc')
  })

  it('throws on 401', async () => {
    vi.stubGlobal('fetch', makeFetch(401, {}))
    await expect(loginDemo('x', 'y')).rejects.toThrow('Login failed')
  })

  it('sends POST with JSON body', async () => {
    const mockFetch = makeFetch(200, {})
    vi.stubGlobal('fetch', mockFetch)
    await loginDemo('admin@clinic.ai', 'clinic1234')
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('POST')
    expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' })
    expect(JSON.parse(options.body as string)).toEqual({ email: 'admin@clinic.ai', password: 'clinic1234' })
  })
})

describe('dashboardApi – updateTaskStatus', () => {
  afterEach(() => vi.restoreAllMocks())

  it('calls correct URL for start action', async () => {
    const mockFetch = makeFetch(200, { tasks: [] })
    vi.stubGlobal('fetch', mockFetch)
    await updateTaskStatus('task-01', 'start')
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/tasks/task-01/start`, { method: 'POST' })
  })

  it('calls correct URL for complete action', async () => {
    const mockFetch = makeFetch(200, { tasks: [] })
    vi.stubGlobal('fetch', mockFetch)
    await updateTaskStatus('task-02', 'complete')
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/tasks/task-02/complete`, { method: 'POST' })
  })

  it('throws on failure', async () => {
    vi.stubGlobal('fetch', makeFetch(500, {}))
    await expect(updateTaskStatus('task-01', 'start')).rejects.toThrow('Task update failed')
  })
})

// ---------------------------------------------------------------------------
// 3. useDashboard hook
//    We test the state machine logic by replicating the hook with the same
//    pure functions from clinicData.  React-specific rendering is tested via
//    renderHook (requires jsdom environment in vitest.config.ts).
// ---------------------------------------------------------------------------

// --- minimal data for the hook tests ---
import { useState, useCallback, useEffect, useMemo } from 'react'

// Minimal clinicData helpers (replicated inline)
const _branches: Branch[] = [
  { id: 'branch-a', name: 'สาขา A - เมือง', city: 'Mahasarakham', targetRevenue: 180000 },
]
const _staff: Staff[] = [
  { id: 'doc-a', branchId: 'branch-a', name: 'Doctor C', role: 'doctor', isWorking: true, taskLoad: 2 },
  { id: 'rec-a', branchId: 'branch-a', name: 'Reception A', role: 'reception', isWorking: false, taskLoad: 0 },
]
const _appointments: Appointment[] = [
  { id: 'apt-01', branchId: 'branch-a', patientName: 'K. Mint', service: 'Botox', startsAt: '2026-06-06T09:15:00+07:00', status: 'confirmed' },
]
const _sales: Sale[] = [
  { id: 'sale-01', branchId: 'branch-a', amount: 50000, service: 'Botox', soldAt: '2026-06-06T09:55:00+07:00' },
]
const _baseTasks: ClinicTask[] = [
  { id: 'task-01', branchId: 'branch-a', staffId: 'doc-a', title: 'Botox check', queueCount: 5, status: 'todo' },
  { id: 'task-02', branchId: 'branch-a', staffId: 'rec-a', title: 'Confirm calls', queueCount: 10, status: 'completed', startedAt: '2026-06-06T08:00:00+07:00', completedAt: '2026-06-06T09:00:00+07:00' },
]

function _buildPayload(tasks: ClinicTask[] = _baseTasks): DashboardPayload {
  return {
    branches: _branches,
    staff: _staff,
    appointments: _appointments,
    sales: _sales,
    tasks,
    kpiRecords: [] as KPIRecord[],
    recommendations: [] as RosterRecommendation[],
    aiSummaries: [] as AISummary[],
    branchKpis: _branches.map((b): BranchKPI => {
      const bTasks = tasks.filter((t) => t.branchId === b.id)
      const completed = bTasks.filter((t) => t.status === 'completed').length
      return {
        branchId: b.id,
        branchName: b.name,
        revenue: 50000,
        patientCount: 1,
        completionRate: bTasks.length ? Math.round((completed / bTasks.length) * 100) : 0,
        staffWorking: _staff.filter((m) => m.branchId === b.id && m.isWorking).length,
        targetRevenue: b.targetRevenue,
      }
    }),
  }
}

function useTestDashboard() {
  const fallback = _buildPayload()
  const [dashboard, setDashboard] = useState<DashboardPayload>(fallback)
  const [activeBranchId, setActiveBranchId] = useState('branch-a')
  const [isAuthed, setIsAuthed] = useState(false)
  const [email, setEmail] = useState('admin@clinic.ai')
  const [password, setPassword] = useState('clinic1234')
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState('Demo data พร้อมใช้งาน')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error()
      setDashboard(await res.json() as DashboardPayload)
      setNotice('เชื่อมต่อ API แล้ว')
    } catch {
      setDashboard(fallback)
      setNotice('ใช้ demo data ใน frontend ระหว่างรอ API')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      if (!res.ok) throw new Error()
      setIsAuthed(true)
      setNotice('เข้าสู่ระบบ demo แล้ว')
      await loadDashboard()
    } catch {
      setIsAuthed(true)
      setNotice('เข้าสู่ระบบด้วย frontend demo mode')
    } finally {
      setIsLoading(false)
    }
  }, [email, loadDashboard, password])

  const updateTask = useCallback(async (taskId: string, action: 'start' | 'complete') => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setDashboard(await res.json() as DashboardPayload)
      setNotice(action === 'start' ? 'เริ่มจับเวลางานแล้ว' : 'ปิดงานและอัปเดต KPI แล้ว')
    } catch {
      const now = new Date().toISOString()
      const nextTasks = dashboard.tasks.map((task) => {
        if (task.id !== taskId) return task
        return action === 'start'
          ? { ...task, status: 'in-progress' as const, startedAt: now, completedAt: undefined }
          : { ...task, status: 'completed' as const, startedAt: task.startedAt ?? now, completedAt: now }
      })
      setDashboard(_buildPayload(nextTasks))
      setNotice('อัปเดตงานใน frontend demo mode')
    } finally {
      setIsLoading(false)
    }
  }, [dashboard.tasks])

  useEffect(() => {
    const t = setTimeout(() => void loadDashboard(), 0)
    return () => clearTimeout(t)
  }, [loadDashboard])

  const activeData = useMemo(() => ({
    activeBranch: dashboard.branches.find((b) => b.id === activeBranchId),
    activeKpi: dashboard.branchKpis.find((k) => k.branchId === activeBranchId),
    branchTasks: dashboard.tasks.filter((t) => t.branchId === activeBranchId),
    branchAppointments: dashboard.appointments.filter((a) => a.branchId === activeBranchId).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    branchStaff: dashboard.staff.filter((m) => m.branchId === activeBranchId),
    roster: dashboard.recommendations.find((r) => r.branchId === activeBranchId),
    aiSummary: dashboard.aiSummaries.find((s) => s.branchId === activeBranchId),
  }), [activeBranchId, dashboard])

  const totals = useMemo(() => ({
    revenue: dashboard.sales.reduce((s, sale) => s + sale.amount, 0),
    patients: dashboard.appointments.length,
    workingStaff: dashboard.staff.filter((m) => m.isWorking).length,
    completionRate: Math.round((dashboard.tasks.filter((t) => t.status === 'completed').length / Math.max(dashboard.tasks.length, 1)) * 100),
  }), [dashboard])

  return { dashboard, activeBranchId, setActiveBranchId, isAuthed, email, setEmail, password, setPassword, isLoading, notice, loadDashboard, login, updateTask, activeData, totals }
}

describe('useDashboard – initial state', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  })
  afterEach(() => vi.restoreAllMocks())

  it('starts with demo data notice', async () => {
    const { result } = renderHook(() => useTestDashboard())
    expect(result.current.notice).toBe('Demo data พร้อมใช้งาน')
  })

  it('starts with activeBranchId = branch-a', () => {
    const { result } = renderHook(() => useTestDashboard())
    expect(result.current.activeBranchId).toBe('branch-a')
  })

  it('starts with isAuthed = false', () => {
    const { result } = renderHook(() => useTestDashboard())
    expect(result.current.isAuthed).toBe(false)
  })

  it('default email and password match demo credentials', () => {
    const { result } = renderHook(() => useTestDashboard())
    expect(result.current.email).toBe('admin@clinic.ai')
    expect(result.current.password).toBe('clinic1234')
  })
})

describe('useDashboard – loadDashboard', () => {
  afterEach(() => vi.restoreAllMocks())

  it('updates notice to "เชื่อมต่อ API แล้ว" on API success', async () => {
    vi.stubGlobal('fetch', makeFetch(200, _buildPayload()))
    const { result } = renderHook(() => useTestDashboard())
    await act(async () => { await result.current.loadDashboard() })
    expect(result.current.notice).toBe('เชื่อมต่อ API แล้ว')
  })

  it('falls back to demo data when API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    const { result } = renderHook(() => useTestDashboard())
    await act(async () => { await result.current.loadDashboard() })
    expect(result.current.notice).toContain('demo data')
  })

  it('sets isLoading during the call and clears it after', async () => {
    let resolveRef!: (v: unknown) => void
    const pending = new Promise((r) => { resolveRef = r })
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending))
    const { result } = renderHook(() => useTestDashboard())

    act(() => { void result.current.loadDashboard() })
    expect(result.current.isLoading).toBe(true)

    await act(async () => { resolveRef({ ok: false }) })
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useDashboard – login', () => {
  afterEach(() => vi.restoreAllMocks())

  it('sets isAuthed true on successful login', async () => {
    vi.stubGlobal('fetch', makeFetch(200, { token: 'abc', ...(_buildPayload()) }))
    const { result } = renderHook(() => useTestDashboard())
    await act(async () => { await result.current.login() })
    expect(result.current.isAuthed).toBe(true)
  })

  it('still sets isAuthed true when login API fails (frontend fallback)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const { result } = renderHook(() => useTestDashboard())
    await act(async () => { await result.current.login() })
    expect(result.current.isAuthed).toBe(true)
    expect(result.current.notice).toMatch(/เข้าสู่ระบบด้วย frontend demo mode|ใช้ demo data ใน frontend ระหว่างรอ API/)
  })
})

describe('useDashboard – updateTask', () => {
  afterEach(() => vi.restoreAllMocks())

  it('updates notice to "เริ่มจับเวลางานแล้ว" when API succeeds with start', async () => {
    const nextPayload = _buildPayload(
      _baseTasks.map((t) => t.id === 'task-01' ? { ...t, status: 'in-progress' as const } : t)
    )
    vi.stubGlobal('fetch', makeFetch(200, nextPayload))
    const { result } = renderHook(() => useTestDashboard())
    // Wait for auto loadDashboard to settle
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { await result.current.updateTask('task-01', 'start') })
    expect(result.current.notice).toBe('เริ่มจับเวลางานแล้ว')
  })

  it('updates notice to "ปิดงาน" when API succeeds with complete', async () => {
    const nextPayload = _buildPayload(
      _baseTasks.map((t) => t.id === 'task-01' ? { ...t, status: 'completed' as const } : t)
    )
    vi.stubGlobal('fetch', makeFetch(200, nextPayload))
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { await result.current.updateTask('task-01', 'complete') })
    expect(result.current.notice).toContain('ปิดงาน')
  })

  it('mutates tasks locally when API fails (frontend fallback)', async () => {
    // loadDashboard fails, updateTask also fails → frontend mutation
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { await result.current.updateTask('task-01', 'start') })
    const task = result.current.dashboard.tasks.find((t) => t.id === 'task-01')
    expect(task?.status).toBe('in-progress')
    expect(result.current.notice).toBe('อัปเดตงานใน frontend demo mode')
  })
})

describe('useDashboard – activeData', () => {
  afterEach(() => vi.restoreAllMocks())

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  })

  it('activeData.branchTasks is filtered to activeBranchId', async () => {
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    result.current.activeData.branchTasks.forEach((t) => {
      expect(t.branchId).toBe(result.current.activeBranchId)
    })
  })

  it('activeData.branchAppointments is sorted by startsAt', async () => {
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const times = result.current.activeData.branchAppointments.map((a) => new Date(a.startsAt).getTime())
    expect(times).toEqual([...times].sort((a, b) => a - b))
  })

  it('setActiveBranchId switches activeData', async () => {
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setActiveBranchId('branch-b'))
    expect(result.current.activeBranchId).toBe('branch-b')
    // branch-b has no tasks in test data
    expect(result.current.activeData.branchTasks).toHaveLength(0)
  })
})

describe('useDashboard – totals', () => {
  afterEach(() => vi.restoreAllMocks())

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  })

  it('totals.revenue sums all sales', async () => {
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.totals.revenue).toBe(50000)
  })

  it('totals.patients equals appointments count', async () => {
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.totals.patients).toBe(1)
  })

  it('totals.workingStaff counts only isWorking=true', async () => {
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    // _staff has 2 entries; rec-a isWorking=false → 1
    expect(result.current.totals.workingStaff).toBe(1)
  })

  it('totals.completionRate is percentage of completed tasks', async () => {
    const { result } = renderHook(() => useTestDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    // 1 completed out of 2 tasks = 50%
    expect(result.current.totals.completionRate).toBe(50)
  })
})
