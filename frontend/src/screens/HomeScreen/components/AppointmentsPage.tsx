import { CalendarDays, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Appointment, Branch } from '../../../types/clinic'
import { formatTime } from '../../../utils/formatters'
import type { AppointmentCreatePayload, AppointmentStatus } from '../../../api/appointmentsApi'

type AppointmentsPageProps = {
  activeBranchId: string
  appointments: Appointment[]
  branches: Branch[]
  isLoading: boolean
  onCreateAppointment: (payload: AppointmentCreatePayload) => Promise<void>
  onLoadAppointments: () => Promise<void>
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>
}

const statuses: AppointmentStatus[] = ['confirmed', 'waiting', 'done']

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: 'bg-[#eff6ff] text-[#1d4ed8]',
  waiting: 'bg-[#fffbeb] text-[#a16207]',
  done: 'bg-[#ecfdf5] text-[#047857]',
}

const statusLabels: Record<AppointmentStatus, string> = {
  confirmed: 'confirmed',
  waiting: 'waiting',
  done: 'done',
}

function emptyAppointment(branchId: string) {
  return {
    branchId,
    patientName: '',
    service: '',
    startsAt: new Date().toISOString().slice(0, 16),
    status: 'confirmed' as AppointmentStatus,
  }
}

export function AppointmentsPage({
  activeBranchId,
  appointments,
  branches,
  isLoading,
  onCreateAppointment,
  onLoadAppointments,
  onUpdateStatus,
}: AppointmentsPageProps) {
  const [form, setForm] = useState(() => emptyAppointment(activeBranchId))
  const [error, setError] = useState('')

  useEffect(() => {
    void onLoadAppointments()
  }, [onLoadAppointments])

  useEffect(() => {
    setForm((current) => ({ ...current, branchId: activeBranchId }))
  }, [activeBranchId])

  const sortedAppointments = useMemo(() => (
    [...appointments].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  ), [appointments])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const patientName = form.patientName.trim()
    const service = form.service.trim()
    if (!patientName || !service || !form.startsAt) {
      setError('กรอกข้อมูลนัดให้ครบก่อนบันทึก')
      return
    }

    await onCreateAppointment({
      branchId: form.branchId,
      patientName,
      service,
      startsAt: new Date(form.startsAt).toISOString(),
      status: form.status,
    })
    setForm(emptyAppointment(form.branchId))
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <form className="metric-card space-y-4 p-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">เพิ่มนัดคนไข้</h2>
            <CalendarDays size={18} className="text-[#9333ea]" aria-hidden="true" />
          </div>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="appointment-patient">
            คนไข้
            <input
              id="appointment-patient"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.patientName}
              onChange={(event) => setForm((current) => ({ ...current, patientName: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="appointment-service">
            บริการ
            <input
              id="appointment-service"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.service}
              onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="appointment-starts">
            เวลา
            <input
              id="appointment-starts"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="appointment-branch">
            สาขา
            <select
              id="appointment-branch"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.branchId}
              onChange={(event) => setForm((current) => ({ ...current, branchId: event.target.value }))}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="appointment-status">
            สถานะ
            <select
              id="appointment-status"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AppointmentStatus }))}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </label>

          {error && <p className="rounded-md bg-[#fef2f2] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white" disabled={isLoading} type="submit">
            <Plus size={16} aria-hidden="true" />
            เพิ่มนัด
          </button>
        </form>

        <section className="metric-card p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Appointments</h2>
              <p className="mt-1 text-sm text-[#667085]">{sortedAppointments.length} นัด</p>
            </div>
            <button className="icon-button" disabled={isLoading} onClick={() => void onLoadAppointments()} title="Refresh appointments" type="button">
              <RefreshCw size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-[#667085]">
                  <th className="border-b border-[#e3e7ef] py-2 pr-3 font-semibold">เวลา</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">คนไข้</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">บริการ</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">สาขา</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">สถานะ</th>
                  <th className="border-b border-[#e3e7ef] py-2 pl-3 font-semibold">เปลี่ยนสถานะ</th>
                </tr>
              </thead>
              <tbody>
                {sortedAppointments.map((appointment) => {
                  const branch = branches.find((item) => item.id === appointment.branchId)
                  return (
                    <tr key={appointment.id}>
                      <td className="border-b border-[#f1f5f9] py-3 pr-3 font-semibold text-[#172033]">{formatTime(appointment.startsAt)}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3">{appointment.patientName}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3 text-[#4d5c72]">{appointment.service}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3 text-[#4d5c72]">{branch?.name ?? '-'}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3">
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}>
                          {statusLabels[appointment.status]}
                        </span>
                      </td>
                      <td className="border-b border-[#f1f5f9] py-3 pl-3">
                        <select
                          className="w-full rounded-md border border-[#d8deea] bg-white px-2 py-1.5 text-sm text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
                          value={appointment.status}
                          onChange={(event) => void onUpdateStatus(appointment.id, event.target.value as AppointmentStatus)}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{statusLabels[status]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}
