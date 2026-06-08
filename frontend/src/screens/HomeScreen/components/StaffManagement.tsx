import { Pencil, Plus, Save, Trash2, UserCog, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Branch, Staff, StaffRole } from '../../../types/clinic'
import { roleLabel } from '../../../utils/formatters'

type StaffFormState = {
  name: string
  branchId: string
  role: StaffRole
  isWorking: boolean
  taskLoad: number
}

type StaffManagementProps = {
  activeBranchId: string
  branches: Branch[]
  staff: Staff[]
  onCreateStaff: (payload: Omit<Staff, 'id'>) => Promise<void>
  onUpdateStaff: (staffId: string, payload: Partial<Omit<Staff, 'id'>>) => Promise<void>
  onDeleteStaff: (staffId: string) => Promise<void>
}

const roles: StaffRole[] = ['doctor', 'nurse', 'reception', 'manager']

function createEmptyForm(branchId: string): StaffFormState {
  return {
    name: '',
    branchId,
    role: 'nurse',
    isWorking: true,
    taskLoad: 0,
  }
}

export function StaffManagement({
  activeBranchId,
  branches,
  staff,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
}: StaffManagementProps) {
  const [form, setForm] = useState<StaffFormState>(() => createEmptyForm(activeBranchId))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const sortedStaff = useMemo(() => (
    [...staff].sort((a, b) => {
      if (a.branchId !== b.branchId) return a.branchId.localeCompare(b.branchId)
      return a.name.localeCompare(b.name)
    })
  ), [staff])

  const roleCounts = useMemo(() => roles.map((role) => ({
    role,
    count: staff.filter((member) => member.role === role).length,
  })), [staff])

  function resetForm(nextBranchId = activeBranchId) {
    setForm(createEmptyForm(nextBranchId))
    setEditingId(null)
    setError('')
  }

  function startEdit(member: Staff) {
    setEditingId(member.id)
    setForm({
      name: member.name,
      branchId: member.branchId,
      role: member.role,
      isWorking: member.isWorking,
      taskLoad: member.taskLoad,
    })
    setError('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const name = form.name.trim()
    if (!name) {
      setError('กรอกชื่อพนักงานก่อนบันทึก')
      return
    }

    const payload = {
      name,
      branchId: form.branchId,
      role: form.role,
      isWorking: form.isWorking,
      taskLoad: Math.max(0, Number(form.taskLoad) || 0),
    }

    if (editingId) {
      await onUpdateStaff(editingId, payload)
    } else {
      await onCreateStaff(payload)
    }
    resetForm(payload.branchId)
  }

  async function handleDelete(member: Staff) {
    const confirmed = window.confirm(`ลบ ${member.name} ออกจากทีมใช่ไหม?`)
    if (!confirmed) return
    await onDeleteStaff(member.id)
    if (editingId === member.id) resetForm(member.branchId)
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {roleCounts.map((item) => (
          <div className="metric-card p-4" key={item.role}>
            <p className="text-sm text-[#667085]">{roleLabel(item.role)}</p>
            <p className="mt-2 text-2xl font-semibold text-[#172033]">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <form className="metric-card space-y-4 p-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{editingId ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}</h2>
            <UserCog size={18} className="text-[#0f766e]" aria-hidden="true" />
          </div>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="staff-name">
            ชื่อพนักงาน
            <input
              id="staff-name"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="staff-branch">
            สาขา
            <select
              id="staff-branch"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.branchId}
              onChange={(event) => setForm((current) => ({ ...current, branchId: event.target.value }))}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="staff-role">
            Role
            <select
              id="staff-role"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as StaffRole }))}
            >
              {roles.map((role) => (
                <option key={role} value={role}>{roleLabel(role)}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="staff-load">
            Task load
            <input
              id="staff-load"
              className="mt-1 w-full rounded-md border border-[#d8deea] bg-white px-3 py-2 text-[#172033] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              min={0}
              type="number"
              value={form.taskLoad}
              onChange={(event) => setForm((current) => ({ ...current, taskLoad: Number(event.target.value) }))}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-[#4d5c72]">
            <input
              checked={form.isWorking}
              className="h-4 w-4 accent-[#0f766e]"
              type="checkbox"
              onChange={(event) => setForm((current) => ({ ...current, isWorking: event.target.checked }))}
            />
            กำลังทำงานวันนี้
          </label>

          {error && <p className="rounded-md bg-[#fef2f2] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

          <div className="flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white" type="submit">
              {editingId ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
              {editingId ? 'บันทึก' : 'เพิ่ม'}
            </button>
            {editingId && (
              <button className="icon-button" onClick={() => resetForm()} title="ยกเลิก" type="button">
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </form>

        <section className="metric-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">รายชื่อพนักงาน</h2>
            <span className="text-sm text-[#667085]">{staff.length} คน</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-[#667085]">
                  <th className="border-b border-[#e3e7ef] py-2 pr-3 font-semibold">ชื่อ</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">Role</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">สาขา</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">Load</th>
                  <th className="border-b border-[#e3e7ef] px-3 py-2 font-semibold">สถานะ</th>
                  <th className="border-b border-[#e3e7ef] py-2 pl-3 text-right font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {sortedStaff.map((member) => {
                  const branch = branches.find((item) => item.id === member.branchId)
                  return (
                    <tr key={member.id}>
                      <td className="border-b border-[#f1f5f9] py-3 pr-3 font-semibold text-[#172033]">{member.name}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3">{roleLabel(member.role)}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3 text-[#4d5c72]">{branch?.name ?? '-'}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3">{member.taskLoad}</td>
                      <td className="border-b border-[#f1f5f9] px-3 py-3">
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${member.isWorking ? 'bg-[#ecfdf5] text-[#0f766e]' : 'bg-[#f1f5f9] text-[#667085]'}`}>
                          {member.isWorking ? 'Working' : 'Off'}
                        </span>
                      </td>
                      <td className="border-b border-[#f1f5f9] py-3 pl-3">
                        <div className="flex justify-end gap-2">
                          <button className="icon-button" onClick={() => startEdit(member)} title="แก้ไข" type="button">
                            <Pencil size={16} aria-hidden="true" />
                          </button>
                          <button className="icon-button text-[#b42318]" onClick={() => void handleDelete(member)} title="ลบ" type="button">
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
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
