import { RefreshCw, Stethoscope } from 'lucide-react'

type HeaderProps = {
  notice: string
  isLoading: boolean
  onRefresh: () => void
}

export function Header({ notice, isLoading, onRefresh }: HeaderProps) {
  return (
    <header className="border-b border-[#dde3ed] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0f766e] text-white">
            <Stethoscope size={23} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-lg font-semibold tracking-normal sm:text-xl">Clinic AI Ops Dashboard</h1>
            <p className="hidden break-words text-sm text-[#5e6b81] sm:block">ระบบจัดการข้อมูลคลินิก + AI ช่วยจัดตารางพนักงาน + KPI</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-[#d8deea] bg-[#f8fafc] px-3 py-2 text-sm text-[#4d5c72]">{notice}</span>
          <button className="icon-button" onClick={onRefresh} title="Refresh dashboard" type="button">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
