import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    branch: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    staff: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    patientAppointment: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    sale: {
      findMany: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    kPIRecord: {
      findMany: vi.fn(),
    },
    rosterRecommendation: {
      findMany: vi.fn(),
    },
    aISummary: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('./configs/prisma.js', () => ({ default: prismaMock }))
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(async (password: string) => password === 'database123'),
    hash: vi.fn(async () => 'hashed-password'),
  },
}))

const { createApp } = await import('./app.js')

describe('clinic api', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-01',
      name: 'Database Manager',
      email: 'manager@example.com',
      passwordHash: 'hashed-password',
      role: 'manager',
    })
    prismaMock.branch.findMany.mockResolvedValue([])
    prismaMock.staff.findMany.mockResolvedValue([])
    prismaMock.patientAppointment.findMany.mockResolvedValue([])
    prismaMock.sale.findMany.mockResolvedValue([])
    prismaMock.task.findMany.mockResolvedValue([])
    prismaMock.kPIRecord.findMany.mockResolvedValue([])
    prismaMock.rosterRecommendation.findMany.mockResolvedValue([])
    prismaMock.aISummary.findMany.mockResolvedValue([])
    prismaMock.aISummary.create.mockImplementation(async ({ data }: { data: { branchId: string; summary: string } }) => ({
      id: 'summary-created',
      branchId: data.branchId,
      summary: data.summary,
      generatedAt: new Date('2026-06-08T12:00:00.000Z'),
    }))
  })

  async function login() {
    return request(app).post('/api/auth/login').send({
      email: 'manager@example.com',
      password: 'database123',
    })
  }

  it('returns health status', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  it('allows credentialed requests from the local frontend', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })

  it('logs in a database user and returns an empty dashboard when the database has no clinic rows', async () => {
    const auth = await login()
    expect(auth.status).toBe(200)
    expect(auth.body.token).toBeTruthy()
    expect(auth.headers['set-cookie']?.[0]).toContain('clinic_access_token=')

    const dashboard = await request(app).get('/api/dashboard')
    expect(dashboard.status).toBe(200)
    expect(dashboard.body.branches).toEqual([])
    expect(dashboard.body.appointments).toEqual([])
    expect(dashboard.body.tasks).toEqual([])
  })

  it('rejects login credentials that are not backed by a database user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)

    const response = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com',
      password: 'database123',
    })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('Invalid email or password')
  })

  it('exposes register endpoint with validation errors instead of 404', async () => {
    const response = await request(app).post('/api/auth/register').send({})

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Name is required')
  })

  it('requires authentication for staff management', async () => {
    const response = await request(app).post('/api/staff').send({})

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('Authentication required')
  })

  it('accepts manager token on staff management routes', async () => {
    const auth = await login()
    const response = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${auth.body.token}`)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Valid staff role is required')
  })

  it('accepts auth cookie on staff management routes', async () => {
    const auth = await login()
    const response = await request(app)
      .post('/api/staff')
      .set('Cookie', auth.headers['set-cookie'])
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Valid staff role is required')
  })

  it('returns appointment rows from the database for authenticated users', async () => {
    const startsAt = new Date('2026-06-06T09:15:00.000Z')
    prismaMock.patientAppointment.findMany.mockResolvedValueOnce([
      {
        id: 'apt-db-01',
        branchId: 'branch-db-01',
        patientName: 'Database Patient',
        service: 'Consultation',
        startsAt,
        status: 'confirmed',
      },
    ])

    const auth = await login()
    const response = await request(app)
      .get('/api/appointments')
      .set('Cookie', auth.headers['set-cookie'])

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      {
        id: 'apt-db-01',
        branchId: 'branch-db-01',
        patientName: 'Database Patient',
        service: 'Consultation',
        startsAt: startsAt.toISOString(),
        status: 'confirmed',
      },
    ])
  })

  it('generates roster recommendation from database appointments and sales', async () => {
    prismaMock.patientAppointment.findMany.mockResolvedValueOnce([
      { id: 'apt-01', branchId: 'branch-db-01', patientName: 'A', service: 'S', startsAt: new Date(), status: 'confirmed' },
      { id: 'apt-02', branchId: 'branch-db-01', patientName: 'B', service: 'S', startsAt: new Date(), status: 'confirmed' },
      { id: 'apt-03', branchId: 'branch-db-01', patientName: 'C', service: 'S', startsAt: new Date(), status: 'confirmed' },
      { id: 'apt-04', branchId: 'branch-db-01', patientName: 'D', service: 'S', startsAt: new Date(), status: 'confirmed' },
    ])

    const response = await request(app)
      .post('/api/ai/roster')
      .send({ branchId: 'branch-db-01', dayName: 'Monday' })

    expect(response.status).toBe(200)
    expect(response.body.branchId).toBe('branch-db-01')
    expect(response.body.doctors).toBe(3)
    expect(response.body.reason).toBeTruthy()
  })

  it('generates a daily AI summary from branch KPI data without requiring an external provider', async () => {
    prismaMock.branch.findMany.mockResolvedValueOnce([
      { id: 'branch-db-01', name: 'Bangkok', city: 'Bangkok', targetRevenue: 240000 },
    ])
    prismaMock.staff.findMany.mockResolvedValueOnce([
      { id: 'staff-01', branchId: 'branch-db-01', name: 'Nurse A', role: 'NURSE', isWorking: true, taskLoad: 2 },
    ])
    prismaMock.patientAppointment.findMany.mockResolvedValueOnce([
      { id: 'apt-01', branchId: 'branch-db-01', patientName: 'A', service: 'S', startsAt: new Date(), status: 'confirmed' },
      { id: 'apt-02', branchId: 'branch-db-01', patientName: 'B', service: 'S', startsAt: new Date(), status: 'waiting' },
    ])
    prismaMock.sale.findMany.mockResolvedValueOnce([
      { id: 'sale-01', branchId: 'branch-db-01', amount: 120000, service: 'Laser', soldAt: new Date() },
    ])
    prismaMock.task.findMany.mockResolvedValueOnce([
      {
        id: 'task-01',
        branchId: 'branch-db-01',
        staffId: 'staff-01',
        title: 'Prepare room',
        queueCount: 1,
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
      },
      {
        id: 'task-02',
        branchId: 'branch-db-01',
        staffId: 'staff-01',
        title: 'Confirm appointments',
        queueCount: 1,
        status: 'TODO',
        startedAt: null,
        completedAt: null,
      },
    ])

    const response = await request(app)
      .post('/api/ai/summary')
      .send({ branchId: 'branch-db-01' })

    expect(response.status).toBe(200)
    expect(response.body.branchId).toBe('branch-db-01')
    expect(response.body.summary).toContain('Bangkok')
    expect(response.body.summary).toContain('120')
  })
})
