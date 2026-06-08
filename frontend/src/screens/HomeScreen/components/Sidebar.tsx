import { LogOut, UserRound } from 'lucide-react'
import type { AuthUser } from '../../../types/auth'
import type { Branch } from '../../../types/clinic'

type SidebarProps = {
  branches: Branch[]
  activeBranchId: string
  isLoading: boolean
  onBranchChange: (branchId: string) => void
  onLogout: () => void
  user: AuthUser | null
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="min-w-0 space-y-4">
      <section className="metric-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">บัญชีผู้ใช้</h2>
          <UserRound size={18} className="text-[#0f766e]" aria-hidden="true" />
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-[#172033]">{props.user?.name ?? 'Clinic user'}</p>
            <p className="wrap-anywhere text-[#667085]">{props.user?.email}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#0f766e]">{props.user?.role}</p>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d8deea] bg-white px-3 py-2 font-semibold text-[#334155] transition hover:border-[#94a3b8] disabled:opacity-60" disabled={props.isLoading} onClick={props.onLogout} type="button">
            <LogOut size={17} aria-hidden="true" />
            ออกจากระบบ
          </button>
        </div>
      </section>

      <section className="metric-card p-4">
        <h2 className="mb-3 text-base font-semibold">Branch</h2>
        <div className="grid gap-2">
          {props.branches.map((branch) => (
            <button className={`rounded-md border px-3 py-3 text-left transition ${props.activeBranchId === branch.id ? 'border-[#0f766e] bg-[#ecfdf5] text-[#0f766e]' : 'border-[#d8deea] bg-white text-[#334155] hover:border-[#94a3b8]'}`} key={branch.id} onClick={() => props.onBranchChange(branch.id)} type="button">
              <span className="block text-sm font-semibold">{branch.name}</span>
              <span className="text-xs text-[#667085]">{branch.city}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}