import { BrainCircuit, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { AISummary, Branch, RosterRecommendation } from '../../../types/clinic'
import type { GenerateRosterPayload } from '../../../api/appointmentsApi'

type AiRecommendationPageProps = {
  activeBranchId: string
  branches: Branch[]
  isLoading: boolean
  roster?: RosterRecommendation
  summary?: AISummary
  onGenerateRoster: (payload: GenerateRosterPayload) => Promise<RosterRecommendation>
  onGenerateDailySummary: (branchId: string) => Promise<AISummary>
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function AiRecommendationPage({
  activeBranchId,
  branches,
  isLoading,
  roster,
  summary,
  onGenerateRoster,
  onGenerateDailySummary,
}: AiRecommendationPageProps) {
  const [dayName, setDayName] = useState('Saturday')
  const [error, setError] = useState('')
  const activeBranch = branches.find((branch) => branch.id === activeBranchId)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      await onGenerateRoster({ branchId: activeBranchId, dayName })
    } catch {
      setError('ไม่สามารถสร้างคำแนะนำจากข้อมูล database ได้')
    }
  }

  async function handleGenerateSummary() {
    setError('')
    try {
      await onGenerateDailySummary(activeBranchId)
    } catch {
      setError('ไม่สามารถสร้าง AI daily summary ได้')
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <form className="metric-card space-y-4 p-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">AI Recommendation</h2>
          <BrainCircuit size={18} className="text-[#7c3aed]" aria-hidden="true" />
        </div>

        <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="roster-branch">
          สาขา
          <input
            id="roster-branch"
            className="mt-1 w-full rounded-md border border-[#d8deea] bg-[#f8fafc] px-3 py-2 text-[#172033]"
            readOnly
            value={activeBranch?.name ?? activeBranchId}
          />
        </label>

        <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="roster-day">
          วัน
          <select
            id="roster-day"
            className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
            value={dayName}
            onChange={(event) => setDayName(event.target.value)}
          >
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </label>

        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white" disabled={isLoading} type="submit">
          <Sparkles size={16} aria-hidden="true" />
          Generate Roster
        </button>

        {error && <p className="rounded-md bg-[#fef2f2] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
      </form>

      <div className="space-y-4">
        <section className="metric-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Roster Result</h2>
              <p className="mt-1 text-sm text-[#667085]">{roster?.dayName ?? dayName}</p>
            </div>
            <Sparkles size={18} className="text-[#ca8a04]" aria-hidden="true" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <RosterMetric label="Doctors" value={roster?.doctors ?? 0} accent="#2563eb" />
            <RosterMetric label="Nurses" value={roster?.nurses ?? 0} accent="#0f766e" />
            <RosterMetric label="Reception" value={roster?.reception ?? 0} accent="#9333ea" />
          </div>

          <div className="mt-4 rounded-md border border-[#fde68a] bg-[#fffbeb] p-4">
            <p className="text-sm font-semibold text-[#713f12]">Reason</p>
            <p className="mt-2 leading-7 text-[#713f12]">{roster?.reason ?? '-'}</p>
          </div>
        </section>

        <section className="metric-card p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">AI Daily Summary</h2>
              <p className="mt-1 text-sm text-[#667085]">
                {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleString('th-TH') : activeBranch?.name ?? '-'}
              </p>
            </div>
            <button
              className="flex items-center justify-center gap-2 rounded-md bg-[#7c3aed] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isLoading || !activeBranchId}
              onClick={handleGenerateSummary}
              type="button"
            >
              <Sparkles size={16} aria-hidden="true" />
              Generate AI Daily Summary
            </button>
          </div>

          <p className="rounded-md border border-[#ddd6fe] bg-[#f5f3ff] p-4 leading-7 text-[#4c1d95]">
            {summary?.summary ?? 'กด Generate AI Daily Summary เพื่อให้ AI สรุป KPI, task และ appointment ของสาขานี้'}
          </p>
        </section>
      </div>
    </section>
  )
}

function RosterMetric({ accent, label, value }: { accent: string; label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#e3e7ef] bg-white p-4">
      <p className="text-sm text-[#667085]">{label}</p>
      <p className="mt-2 text-3xl font-semibold" style={{ color: accent }}>{value}</p>
    </div>
  )
}
