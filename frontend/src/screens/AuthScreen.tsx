import { useState } from 'react'
import { ShieldCheck, Users } from 'lucide-react'
import type { UseAuthReturn } from '../hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'

type AuthTab = 'login' | 'register'

type AuthScreenProps = {
  auth: UseAuthReturn
}

export function AuthScreen({ auth }: AuthScreenProps) {
  const [tab, setTab] = useState<AuthTab>('login')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-[#dde3ed] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[340px_1fr]">
          <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden bg-[#0f766e] p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/[0.07]" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full border-[30px] border-white/[0.07]" />

            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-lg bg-white/20">
              <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
            </div>

            <div className="relative z-10 text-center">
              <h1 className="text-2xl font-semibold leading-tight text-white">Clinic AI Ops<br />Dashboard</h1>
              <p className="mt-2 text-sm leading-relaxed text-white/75">ระบบจัดการคลินิก + AI<br />ช่วยจัดตารางพนักงานและ KPI</p>
            </div>

            <ul className="relative z-10 w-full space-y-2.5">
              {[
                'ส่ง login/register ไป backend API',
                'เก็บ access token ไว้ใน memory',
                'รองรับ httpOnly cookie จาก backend',
                'จำ session ได้โดยไม่เก็บ token',
                'ออกจากระบบแล้วล้าง session ทันที',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-white/85">
                  <Users size={15} className="flex-shrink-0 text-white/70" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col p-8">
            <div className="mb-6 flex rounded-lg bg-[#f6f7fb] p-1">
              {(['login', 'register'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                    tab === item
                      ? 'bg-white text-[#0f766e] shadow-sm ring-1 ring-[#dde3ed]'
                      : 'text-[#667085] hover:text-[#334155]'
                  }`}
                  type="button"
                >
                  {item === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <LoginForm auth={auth} onSwitchToRegister={() => setTab('register')} />
            ) : (
              <RegisterForm auth={auth} onSwitchToLogin={() => setTab('login')} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
