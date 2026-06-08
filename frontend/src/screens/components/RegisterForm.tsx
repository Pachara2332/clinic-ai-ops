import { Building2, Mail, User } from 'lucide-react'
import { useState } from 'react'
import type { UseAuthReturn } from '../../hooks/useAuth'
import type { AuthRole, RegisterPayload } from '../../types/auth'
import { PasswordInput } from '../HomeScreen/components/PasswordInput'
import { PasswordStrength } from '../HomeScreen/components/PasswordStrength'

type RegisterFormProps = {
  auth: UseAuthReturn
  onSwitchToLogin: () => void
}

const roles: Array<{ value: AuthRole; label: string }> = [
  { value: 'manager', label: 'ผู้จัดการ' },
  { value: 'doctor', label: 'แพทย์' },
  { value: 'nurse', label: 'พยาบาล' },
  { value: 'reception', label: 'Reception' },
]

export function RegisterForm({ auth, onSwitchToLogin }: RegisterFormProps) {
  const [form, setForm] = useState<RegisterPayload>({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    clinicName: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldError, setFieldError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldError('')

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFieldError('กรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }

    if (form.password.length < 8) {
      setFieldError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }

    if (form.password !== confirmPassword) {
      setFieldError('รหัสผ่านไม่ตรงกัน')
      return
    }

    await auth.register({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      clinicName: form.clinicName?.trim() || undefined,
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-semibold text-[#172033]">สมัครสมาชิก</h2>
        <p className="mt-1 text-sm text-[#667085]">ส่งข้อมูลผู้ใช้ใหม่ไปที่ backend เพื่อสร้างบัญชี</p>
      </div>

      <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="register-name">
        ชื่อผู้ใช้
        <span className="relative mt-1.5 flex items-center">
          <User size={15} className="absolute left-3 text-[#94a3b8]" aria-hidden="true" />
          <input
            id="register-name"
            className="w-full rounded-lg border border-[#d8deea] bg-white py-2.5 pl-9 pr-3 text-sm text-[#172033] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
            value={form.name}
            autoComplete="name"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </span>
      </label>

      <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="register-email">
        อีเมล
        <span className="relative mt-1.5 flex items-center">
          <Mail size={15} className="absolute left-3 text-[#94a3b8]" aria-hidden="true" />
          <input
            id="register-email"
            className="w-full rounded-lg border border-[#d8deea] bg-white py-2.5 pl-9 pr-3 text-sm text-[#172033] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
            value={form.email}
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
          />
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="register-clinic">
          คลินิก
          <span className="relative mt-1.5 flex items-center">
            <Building2 size={15} className="absolute left-3 text-[#94a3b8]" aria-hidden="true" />
            <input
              id="register-clinic"
              className="w-full rounded-lg border border-[#d8deea] bg-white py-2.5 pl-9 pr-3 text-sm text-[#172033] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
              value={form.clinicName}
              onChange={(event) => setForm((current) => ({ ...current, clinicName: event.target.value }))}
            />
          </span>
        </label>

        <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="register-role">
          บทบาท
          <select
            id="register-role"
            className="mt-1.5 w-full rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AuthRole }))}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <PasswordInput
          id="register-password"
          label="รหัสผ่าน"
          value={form.password}
          autoComplete="new-password"
          onChange={(password) => setForm((current) => ({ ...current, password }))}
        />
        <PasswordStrength password={form.password} />
      </div>

      <PasswordInput
        id="register-confirm-password"
        label="ยืนยันรหัสผ่าน"
        value={confirmPassword}
        autoComplete="new-password"
        onChange={setConfirmPassword}
      />

      {(fieldError || auth.error) && (
        <p className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b42318]">
          {fieldError || auth.error}
        </p>
      )}

      <button className="w-full rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d665f] disabled:cursor-not-allowed disabled:opacity-60" disabled={auth.isLoading} type="submit">
        {auth.isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
      </button>

      <button className="w-full text-center text-sm font-semibold text-[#0f766e] hover:text-[#0d665f]" onClick={onSwitchToLogin} type="button">
        มีบัญชีแล้ว เข้าสู่ระบบ
      </button>
    </form>
  )
}
