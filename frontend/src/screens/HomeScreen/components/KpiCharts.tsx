import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../../utils/formatters'
import type { BranchKPI } from '../../../types/clinic'

type KpiChartsProps = {
  branchKpis: BranchKPI[]
  activeBranchId: string
  activeBranchName?: string
  activeKpi?: BranchKPI
  completionRate: number
  totalRevenue: number
}

export function KpiCharts({ branchKpis, activeBranchId, activeBranchName, activeKpi, completionRate, totalRevenue }: KpiChartsProps) {
  const revenueTrend = [
    { label: '09:00', revenue: 42000 },
    { label: '11:00', revenue: 110000 },
    { label: '13:00', revenue: 146000 },
    { label: '15:00', revenue: 223000 },
    { label: '17:00', revenue: totalRevenue },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="metric-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">KPI รายสาขา</h2>
            <p className="text-sm text-[#667085]">ยอดขาย, จำนวนคนไข้, งานที่เสร็จ และทีมที่ active</p>
          </div>
          <span className="rounded-md bg-[#eff6ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{completionRate}% done</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchKpis}>
              <CartesianGrid stroke="#edf1f7" vertical={false} />
              <XAxis dataKey="branchName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar barSize={44} dataKey="revenue" isAnimationActive={false} radius={[6, 6, 0, 0]}>
                {branchKpis.map((entry) => <Cell fill={entry.branchId === activeBranchId ? '#0f766e' : '#94a3b8'} key={entry.branchId} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="metric-card p-4">
        <h2 className="text-base font-semibold">{activeBranchName}</h2>
        <div className="mt-4 grid gap-3">
          <BranchLine label="Revenue target" value={`${Math.round(((activeKpi?.revenue ?? 0) / Math.max(activeKpi?.targetRevenue ?? 1, 1)) * 100)}%`} />
          <BranchLine label="Patients" value={`${activeKpi?.patientCount ?? 0} คน`} />
          <BranchLine label="Task completion" value={`${activeKpi?.completionRate ?? 0}%`} />
          <BranchLine label="Working staff" value={`${activeKpi?.staffWorking ?? 0} คน`} />
        </div>
        <div className="mt-5 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area dataKey="revenue" fill="#e0f2f1" isAnimationActive={false} stroke="#0f766e" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

function BranchLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[#f8fafc] px-3 py-2 text-sm">
      <span className="text-[#5e6b81]">{label}</span>
      <span className="font-semibold text-[#172033]">{value}</span>
    </div>
  )
}
