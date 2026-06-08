import { Mail } from 'lucide-react'
import { useState } from 'react'
import type { UseAuthReturn } from '../../hooks/useAuth'
import type { LoginPayload } from '../../types/auth'
import { PasswordInput } from '../HomeScreen/components/PasswordInput'

type LoginFormProps = {
  auth: UseAuthReturn
  onSwitchToRegister: () => void
}

export function LoginForm({ auth, onSwitchToRegister }: LoginFormProps) {
  const [form, setForm] = useState<LoginPayload>({ email: 'admin@clinic.ai', password: 'clinic1234' })
  const [remember, setRemember] = useState(true)
  const [fieldError, setFieldError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldError('')

    if (!form.email.trim() || !form.password) {
      setFieldError('กรอกอีเมลและรหัสผ่านให้ครบ')
      return
    }

    await auth.login({ email: form.email.trim(), password: form.password }, remember)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-semibold text-[#172033]">เข้าสู่ระบบ</h2>
        <p className="mt-1 text-sm text-[#667085]">เชื่อมต่อบัญชีผู้จัดการคลินิกกับ backend</p>
      </div>

      <label className="block text-sm font-medium text-[#4d5c72]" htmlFor="login-email">
        อีเมล
        <span className="relative mt-1.5 flex items-center">
          <Mail size={15} className="absolute left-3 text-[#94a3b8]" aria-hidden="true" />
          <input
            id="login-email"
            className="w-full rounded-lg border border-[#d8deea] bg-white py-2.5 pl-9 pr-3 text-sm text-[#172033] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
            value={form.email}
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
          />
        </span>
      </label>

      <PasswordInput
        id="login-password"
        label="รหัสผ่าน"
        value={form.password}
        autoComplete="current-password"
        onChange={(password) => setForm((current) => ({ ...current, password }))}
      />

      <label className="flex items-center gap-2 text-sm text-[#4d5c72]">
        <input
          checked={remember}
          className="h-4 w-4 accent-[#0f766e]"
          onChange={(event) => setRemember(event.target.checked)}
          type="checkbox"
        />
        จดจำการเข้าสู่ระบบ
      </label>

      {(fieldError || auth.error) && (
        <p className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b42318]">
          {fieldError || auth.error}
        </p>
      )}

      <button className="w-full rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d665f] disabled:cursor-not-allowed disabled:opacity-60" disabled={auth.isLoading} type="submit">
        {auth.isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>

      <button className="w-full text-center text-sm font-semibold text-[#0f766e] hover:text-[#0d665f]" onClick={onSwitchToRegister} type="button">
        ยังไม่มีบัญชี สมัครสมาชิก
      </button>
    </form>
  )
}
