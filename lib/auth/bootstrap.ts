import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function buildAuthEmail(phone: string) {
  const normalized = phone.replace(/[^0-9+]/g, '')
  return `bloodlink+${normalized}@bloodlink.local`
}

export function buildAuthPassword(phone: string) {
  const normalized = phone.replace(/[^0-9+]/g, '')
  const suffix = normalized.slice(-6)
  return `BloodLink-${suffix.toUpperCase()}-2026!`
}

export async function ensureAuthAccount(phone: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, session: null, created: null, error: 'Missing Supabase configuration' }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const email = buildAuthEmail(phone)
  const password = buildAuthPassword(phone)

  try {
    const { data: existing, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (!signInError && existing.session) {
      return { user: existing.user, session: existing.session, created: false, error: null }
    }
  } catch (err) {
    console.error('Sign in error:', err)
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error('Sign up error:', error)
      if (error.message?.includes('rate limit')) {
        return { user: null, session: null, created: null, error: error.message }
      }
      return { user: null, session: null, created: null, error: error.message }
    }

    return { user: data.user, session: data.session, created: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during auth'
    console.error('Auth error:', message)
    return { user: null, session: null, created: null, error: message }
  }
}
