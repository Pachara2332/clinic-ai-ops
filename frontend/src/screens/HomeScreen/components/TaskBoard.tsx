import { CheckCircle2, ClipboardList, Play } from 'lucide-react'
import { formatTime, roleLabel, taskStatusLabel } from '../../../utils/formatters'
import type { ClinicTask, Staff } from '../../../types/clinic'

type TaskBoardProps = {
  tasks: ClinicTask[]
  staff: Staff[]
  onUpdateTask: (taskId: string, action: 'start' | 'complete') => void
}

export function TaskBoard({ tasks, staff, onUpdateTask }: TaskBoardProps) {
  return (
    <section className="metric-card p-4 xl:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Daily Task</h2>
        <ClipboardList size={18} className="text-[#0f766e]" aria-hidden="true" />
      </div>
      <div className="grid gap-3">
        {tasks.map((task) => {
          const owner = staff.find((member) => member.id === task.staffId)
          return (
            <div className="grid gap-3 rounded-md border border-[#e3e7ef] bg-white p-3 md:grid-cols-[1fr_auto]" key={task.id}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{owner?.name}</span>
                  <span className="rounded-md bg-[#f1f5f9] px-2 py-1 text-xs text-[#4d5c72]">{roleLabel(owner?.role ?? 'manager')}</span>
                  <span className="rounded-md bg-[#fff7ed] px-2 py-1 text-xs text-[#c2410c]">{taskStatusLabel(task.status)}</span>
                </div>
                <p className="mt-2 text-sm text-[#4d5c72]">{task.title} {task.queueCount > 1 ? `${task.queueCount} รายการ` : ''}</p>
                <p className="mt-1 text-xs text-[#667085]">Start: {task.startedAt ? formatTime(task.startedAt) : '-'} · Complete: {task.completedAt ? formatTime(task.completedAt) : '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex min-w-28 items-center justify-center gap-2 rounded-md border border-[#d8deea] bg-white px-3 py-2 text-sm font-semibold text-[#172033] disabled:opacity-45" disabled={task.status !== 'todo'} onClick={() => onUpdateTask(task.id, 'start')} type="button">
                  <Play size={16} aria-hidden="true" /> Start
                </button>
                <button className="flex min-w-28 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white disabled:opacity-45" disabled={task.status === 'completed'} onClick={() => onUpdateTask(task.id, 'complete')} type="button">
                  <CheckCircle2 size={16} aria-hidden="true" /> Complete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
