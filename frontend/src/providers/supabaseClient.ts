import { createClient } from '@supabase/supabase-js'
import { environment } from '../constants/environment'

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const supabase =
  isHttpUrl(environment.supabaseUrl) && environment.supabaseAnonKey
    ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
    : null
