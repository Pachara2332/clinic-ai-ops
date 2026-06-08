import { Users } from 'lucide-react'
import { roleLabel } from '../../../utils/formatters'
import type { RosterRecommendation, Staff } from '../../../types/clinic'

type StaffAllocationProps = {
  roster?: RosterRecommendation
  staff: Staff[]
}

export function StaffAllocation({ roster, staff }: StaffAllocationProps) {
  return (
    <section className="metric-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Staff Allocation</h2>
        <Users size={18} className="text-[#2563eb]" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        <RosterLine label="หมอ" value={`${roster?.doctors ?? 0} คน`} />
        <RosterLine label="พยาบาล" value={`${roster?.nurses ?? 0} คน`} />
        <RosterLine label="Reception" value={`${roster?.reception ?? 0} คน`} />
      </div>
      <p className="mt-4 rounded-md bg-[#eff6ff] p-3 text-sm text-[#1d4ed8]">{roster?.reason}</p>
      <div className="mt-4 border-t border-[#e3e7ef] pt-4">
        <h3 className="mb-2 text-sm font-semibold text-[#4d5c72]">ทีมวันนี้</h3>
        <div className="space-y-2">
          {staff.map((member) => (
            <div className="flex items-center justify-between text-sm" key={member.id}>
              <span>{member.name}</span>
              <span className={member.isWorking ? 'text-[#0f766e]' : 'text-[#94a3b8]'}>{member.isWorking ? roleLabel(member.role) : 'Off'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RosterLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#e3e7ef] px-3 py-3">
      <span className="font-medium">{label}</span>
      <span className="text-lg font-semibold text-[#0f766e]">{value}</span>
    </div>
  )
}
