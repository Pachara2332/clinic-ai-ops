import { CalendarDays } from 'lucide-react'
import { formatTime } from '../../../utils/formatters'
import type { Appointment } from '../../../types/clinic'

export function AppointmentsTable({ appointments }: { appointments: Appointment[] }) {
  return (
    <section className="metric-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">ตารางนัดหมาย</h2>
        <CalendarDays size={18} className="text-[#9333ea]" aria-hidden="true" />
      </div>
      <div className="overflow-hidden rounded-md border border-[#e3e7ef]">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-[#f8fafc] text-left text-[#4d5c72]">
            <tr>
              <th className="w-20 px-3 py-2 font-semibold">เวลา</th>
              <th className="px-3 py-2 font-semibold">คนไข้</th>
              <th className="px-3 py-2 font-semibold">บริการ</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr className="border-t border-[#e3e7ef]" key={appointment.id}>
                <td className="px-3 py-2 font-semibold">{formatTime(appointment.startsAt)}</td>
                <td className="px-3 py-2">{appointment.patientName}</td>
                <td className="px-3 py-2 text-[#5e6b81]">{appointment.service}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
