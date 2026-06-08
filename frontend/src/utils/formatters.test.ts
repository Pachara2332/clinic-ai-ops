import { describe, expect, it } from 'vitest'
import { formatCurrency, roleLabel, taskStatusLabel } from './formatters'

describe('formatters', () => {
  it('formats Thai baht without decimals', () => {
    expect(formatCurrency(297000)).toContain('297,000')
  })

  it('maps clinic roles and task statuses', () => {
    expect(roleLabel('nurse')).toBe('Nurse')
    expect(taskStatusLabel('in-progress')).toBe('กำลังทำ')
  })
})
