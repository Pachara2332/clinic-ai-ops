import { recommendRoster } from '../../data/clinic-data.js'
import { env } from '../../configs/env.js'
import prisma from '../../configs/prisma.js'
import type { AISummary, BranchKPI, ClinicTask } from '../../types/clinic.js'
import { listDashboardData } from '../dashboard/dashboard.repository.js'
import { buildBranchKpis } from '../../data/clinic-data.js'

type ChatProvider = 'gemini' | 'openai' | 'local'

function formatBaht(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value)
}

function buildFallbackSummary(kpi: BranchKPI, tasks: ClinicTask[]) {
  const pendingTasks = tasks.filter((task) => task.branchId === kpi.branchId && task.status !== 'completed').length
  const revenueGap = Math.max(kpi.targetRevenue - kpi.revenue, 0)
  const staffingHint = kpi.patientCount >= 12 || kpi.completionRate < 85
    ? 'แนะนำเพิ่มพยาบาล 1 คนในช่วงบ่าย และให้ reception ช่วยยืนยันคิวนัดหมายก่อน peak time'
    : 'กำลังคนวันนี้เพียงพอ ให้โฟกัสปิดงานค้างและรักษาความเร็วในการบริการ'

  return [
    `วันนี้สาขา ${kpi.branchName} มีคนไข้ ${kpi.patientCount} คน ยอดขาย ${formatBaht(kpi.revenue)} และงานเสร็จ ${kpi.completionRate}%.`,
    pendingTasks ? `ยังมีงานค้าง ${pendingTasks} งาน ควรเร่งงานที่กระทบคิวคนไข้ก่อน.` : 'งานประจำวันปิดได้ดี ไม่มีงานค้างสำคัญ.',
    revenueGap ? `ยังห่างเป้ายอดขาย ${formatBaht(revenueGap)}.` : 'ยอดขายแตะหรือเกินเป้าประจำวันแล้ว.',
    staffingHint,
  ].join(' ')
}

function buildSummaryPrompt(kpi: BranchKPI, tasks: ClinicTask[]) {
  const branchTasks = tasks.filter((task) => task.branchId === kpi.branchId)
  const taskStats = {
    total: branchTasks.length,
    completed: branchTasks.filter((task) => task.status === 'completed').length,
    inProgress: branchTasks.filter((task) => task.status === 'in-progress').length,
    todo: branchTasks.filter((task) => task.status === 'todo').length,
  }

  return [
    'คุณคือ AI operator สำหรับผู้จัดการคลินิกเวชสำอาง.',
    'สรุปสถานการณ์ประจำวันเป็นภาษาไทย 2-3 ประโยค กระชับ ใช้ตัวเลขจริง และปิดท้ายด้วย recommendation เรื่องกำลังคนหรือ operation.',
    'อย่าแต่งตัวเลขเพิ่มจากข้อมูลที่ให้.',
    '',
    `Branch: ${kpi.branchName}`,
    `Patients: ${kpi.patientCount}`,
    `Revenue THB: ${kpi.revenue}`,
    `Target revenue THB: ${kpi.targetRevenue}`,
    `Task completion: ${kpi.completionRate}%`,
    `Working staff: ${kpi.staffWorking}`,
    `Tasks: total ${taskStats.total}, completed ${taskStats.completed}, in progress ${taskStats.inProgress}, todo ${taskStats.todo}`,
  ].join('\n')
}

function extractGeminiText(data: unknown) {
  const candidates = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates
  return candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join('\n').trim()
}

function extractOpenAiText(data: unknown) {
  const choices = (data as { choices?: Array<{ message?: { content?: string } }> }).choices
  return choices?.[0]?.message?.content?.trim()
}

async function requestGeminiSummary(prompt: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 220,
      },
    }),
  })

  if (!response.ok) throw new Error('Gemini summary request failed')
  return extractGeminiText(await response.json())
}

async function requestOpenAiSummary(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You write concise daily clinic operations summaries in Thai.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 220,
    }),
  })

  if (!response.ok) throw new Error('OpenAI summary request failed')
  return extractOpenAiText(await response.json())
}

async function generateProviderSummary(prompt: string): Promise<{ provider: ChatProvider; text?: string }> {
  if (process.env.VITEST) {
    return { provider: 'local' }
  }

  if (env.geminiApiKey) {
    try {
      return { provider: 'gemini', text: await requestGeminiSummary(prompt) }
    } catch {
      // Keep the AI feature demo-safe even when the external provider is unavailable.
    }
  }

  if (env.openAiApiKey) {
    try {
      return { provider: 'openai', text: await requestOpenAiSummary(prompt) }
    } catch {
      // Fall back to local rules below.
    }
  }

  return { provider: 'local' }
}

export async function getRosterRecommendation(branchId: string, dayName = 'Saturday') {
  const { appointments, sales } = await listDashboardData()
  return recommendRoster(branchId, dayName, appointments, sales)
}

export async function getDailySummaries() {
  const { aiSummaries } = await listDashboardData()
  return aiSummaries
}

export async function generateDailySummary(branchId: string): Promise<AISummary> {
  const data = await listDashboardData()
  const branchKpis = buildBranchKpis(data.branches, data.tasks, data.staff, data.appointments, data.sales)
  const kpi = branchKpis.find((item) => item.branchId === branchId)

  if (!kpi) {
    throw new Error('Branch not found')
  }

  const prompt = buildSummaryPrompt(kpi, data.tasks)
  const providerResult = await generateProviderSummary(prompt)
  const summary = providerResult.text || buildFallbackSummary(kpi, data.tasks)
  const persistedSummary = await prisma.aISummary.create({
    data: {
      branchId,
      summary,
    },
  })

  return {
    branchId,
    summary: persistedSummary.summary,
    generatedAt: persistedSummary.generatedAt.toISOString(),
  }
}
