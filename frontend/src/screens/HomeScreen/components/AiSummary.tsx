import { Sparkles } from 'lucide-react'
import { formatCurrency } from '../../../utils/formatters'
import type { AISummary as AISummaryType, BranchKPI } from '../../../types/clinic'

type AiSummaryProps = {
  summary?: AISummaryType
  branchKpis: BranchKPI[]
}

export function AiSummary({ summary, branchKpis }: AiSummaryProps) {
  return (
    <section className="metric-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">AI Summary</h2>
        <Sparkles size={18} className="text-[#ca8a04]" aria-hidden="true" />
      </div>
      <p className="rounded-md bg-[#fffbeb] p-4 leading-7 text-[#713f12]">{summary?.summary}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {branchKpis.map((kpi) => (
          <div className="rounded-md border border-[#e3e7ef] bg-white p-3" key={kpi.branchId}>
            <p className="truncate text-sm font-semibold">{kpi.branchName}</p>
            <p className="mt-1 text-xs text-[#667085]">{formatCurrency(kpi.revenue)}</p>
            <p className="mt-2 text-sm font-semibold text-[#0f766e]">{kpi.completionRate}% task KPI</p>
          </div>
        ))}
      </div>
    </section>
  )
}
