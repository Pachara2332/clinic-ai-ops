type Level = { label: string; color: string; percent: number }

function getStrength(password: string): Level {
  if (!password) return { label: '', color: 'transparent', percent: 0 }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels: Level[] = [
    { label: 'อ่อนมาก', color: '#e24b4a', percent: 25 },
    { label: 'ปานกลาง', color: '#ef9f27', percent: 50 },
    { label: 'ดี', color: '#97c459', percent: 75 },
    { label: 'แข็งแกร่งมาก', color: '#1d9e75', percent: 100 },
  ]
  return levels[score - 1] ?? levels[0]
}

export function PasswordStrength({ password }: { password: string }) {
  const { label, color, percent } = getStrength(password)
  if (!password) return null

  return (
    <div className="mt-1 space-y-1">
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#e3e7ef]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  )
}