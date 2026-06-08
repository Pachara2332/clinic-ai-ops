import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

type PasswordInputProps = {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  error?: string
  label: string
  onInput?: (value: string) => void
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  error,
  label,
  onInput,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#4d5c72]">
        {label}
      </label>
      <div className="relative flex items-center">
        <Lock size={15} className="absolute left-3 text-[#94a3b8]" aria-hidden="true" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onInput={(e) => onInput?.((e.target as HTMLInputElement).value)}
          className={`w-full rounded-lg border py-2.5 pl-9 pr-10 text-sm text-[#172033] outline-none transition focus:ring-2 focus:ring-[#0f766e]/20 ${
            error
              ? 'border-[#e24b4a] focus:border-[#e24b4a]'
              : 'border-[#d8deea] focus:border-[#0f766e]'
          }`}
        />
        <button
          type="button"
          aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          onClick={() => setShow((v) => !v)}
          className="absolute right-2.5 flex items-center justify-center rounded p-1 text-[#94a3b8] transition hover:text-[#334155]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span className="text-xs text-[#e24b4a]">{error}</span>}
    </div>
  )
}