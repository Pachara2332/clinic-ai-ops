import { Activity, BrainCircuit, CalendarDays, LayoutDashboard, UserCog, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import type { AuthUser } from '../../types/auth'
import { Metric } from '../../components/common/Metric'
import { useDashboard } from '../../hooks/useDashboard'
import { formatCurrency } from '../../utils/formatters'
import { AiRecommendationPage } from './components/AiRecommendationPage'
import { AiSummary } from './components/AiSummary'
import { AppointmentsPage } from './components/AppointmentsPage'
import { AppointmentsTable } from './components/AppointmentsTable'
import { Header } from './components/Header'
import { KpiCharts } from './components/KpiCharts'
import { Sidebar } from './components/Sidebar'
import { StaffAllocation } from './components/StaffAllocation'
import { StaffManagement } from './components/StaffManagement'
import { TaskBoard } from './components/TaskBoard'

type HomeScreenProps = {
  user: AuthUser | null
  onLogout: () => void
}

type HomeView = 'dashboard' | 'appointments' | 'ai' | 'staff'

export function HomeScreen({ user, onLogout }: HomeScreenProps) {
  const state = useDashboard()
  const [view, setView] = useState<HomeView>('dashboard')
  const { activeBranch, activeKpi, aiSummary, branchAppointments, branchStaff, branchTasks, roster } = state.activeData

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#172033]">
      <Header isLoading={state.isLoading} notice={state.notice} onRefresh={state.loadDashboard} />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[300px_1fr]">
        <Sidebar
          activeBranchId={state.activeBranchId}
          branches={state.dashboard.branches}
          isLoading={state.isLoading}
          onBranchChange={state.setActiveBranchId}
          onLogout={onLogout}
          user={user}
        />

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2 rounded-lg border border-[#dde3ed] bg-white p-1">
            <button
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${view === 'dashboard' ? 'bg-[#0f766e] text-white' : 'text-[#4d5c72] hover:bg-[#f6f7fb]'}`}
              onClick={() => setView('dashboard')}
              type="button"
            >
              <LayoutDashboard size={16} aria-hidden="true" />
              Dashboard
            </button>
            <button
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${view === 'appointments' ? 'bg-[#0f766e] text-white' : 'text-[#4d5c72] hover:bg-[#f6f7fb]'}`}
              onClick={() => setView('appointments')}
              type="button"
            >
              <CalendarDays size={16} aria-hidden="true" />
              Appointments
            </button>
            <button
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${view === 'ai' ? 'bg-[#0f766e] text-white' : 'text-[#4d5c72] hover:bg-[#f6f7fb]'}`}
              onClick={() => setView('ai')}
              type="button"
            >
              <BrainCircuit size={16} aria-hidden="true" />
              AI Recommendation
            </button>
            <button
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${view === 'staff' ? 'bg-[#0f766e] text-white' : 'text-[#4d5c72] hover:bg-[#f6f7fb]'}`}
              onClick={() => setView('staff')}
              type="button"
            >
              <UserCog size={16} aria-hidden="true" />
              Staff Management
            </button>
          </div>

          {view === 'dashboard' ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric accent="#0f766e" icon={<Wallet size={20} />} label="ยอดขายวันนี้" value={formatCurrency(state.totals.revenue)} />
                <Metric accent="#2563eb" icon={<Users size={20} />} label="จำนวนคนไข้" value={`${state.totals.patients} คน`} />
                <Metric accent="#9333ea" icon={<CalendarDays size={20} />} label="ตารางนัดหมาย" value={`${state.dashboard.appointments.length} นัด`} />
                <Metric accent="#dc2626" icon={<Activity size={20} />} label="พนักงานที่ทำงาน" value={`${state.totals.workingStaff} คน`} />
              </div>

              <KpiCharts
                activeBranchId={state.activeBranchId}
                activeBranchName={activeBranch?.name}
                activeKpi={activeKpi}
                branchKpis={state.dashboard.branchKpis}
                completionRate={state.totals.completionRate}
                totalRevenue={state.totals.revenue}
              />

              <div className="grid gap-4 xl:grid-cols-3">
                <TaskBoard onUpdateTask={state.updateTask} staff={state.dashboard.staff} tasks={branchTasks} />
                <StaffAllocation roster={roster} staff={branchStaff} />
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <AppointmentsTable appointments={branchAppointments} />
                <AiSummary branchKpis={state.dashboard.branchKpis} summary={aiSummary} />
              </div>
            </>
          ) : view === 'appointments' ? (
            <AppointmentsPage
              activeBranchId={state.activeBranchId}
              appointments={state.dashboard.appointments}
              branches={state.dashboard.branches}
              isLoading={state.isLoading}
              onCreateAppointment={state.addAppointment}
              onLoadAppointments={state.loadAppointments}
              onUpdateStatus={state.setAppointmentStatus}
            />
          ) : view === 'ai' ? (
            <AiRecommendationPage
              activeBranchId={state.activeBranchId}
              branches={state.dashboard.branches}
              isLoading={state.isLoading}
              roster={roster}
              onGenerateRoster={state.runRosterRecommendation}
            />
          ) : (
            <StaffManagement
              activeBranchId={state.activeBranchId}
              branches={state.dashboard.branches}
              staff={state.dashboard.staff}
              onCreateStaff={state.addStaff}
              onDeleteStaff={state.removeStaff}
              onUpdateStaff={state.editStaff}
            />
          )}
        </section>
      </div>
    </main>
  )
}
