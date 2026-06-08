import type { ReactNode } from 'react'

type MetricProps = {
  icon: ReactNode
  label: string
  value: string
  accent: string
}

export function Metric({ icon, label, value, accent }: MetricProps) {
  return (
    <section className="metric-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#667085]">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md text-white" style={{ backgroundColor: accent }}>
          {icon}
        </div>
      </div>
    </section>
  )
}
