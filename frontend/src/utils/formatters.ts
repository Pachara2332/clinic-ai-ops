import type { ClinicTask, Staff } from '../types/clinic'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function roleLabel(role: Staff['role']) {
  return {
    doctor: 'Doctor',
    nurse: 'Nurse',
    reception: 'Reception',
    manager: 'Manager',
  }[role]
}

export function taskStatusLabel(status: ClinicTask['status']) {
  return {
    todo: 'รอเริ่ม',
    'in-progress': 'กำลังทำ',
    completed: 'เสร็จแล้ว',
  }[status]
}
