import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { ensureAuthAccount } from '@/lib/auth/bootstrap'
import { getAuthenticatedUser } from '@/lib/supabase/auth'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    console.error('Supabase config missing:', { 
      hasUrl: !!url, 
      hasKey: !!key,
      envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    })
    throw new Error('Missing Supabase configuration: URL or SERVICE_ROLE_KEY not set')
  }
  
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, blood_group, is_donor, latitude, longitude } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const authUser = await getAuthenticatedUser(request)

    const authResult: any = authUser
      ? { user: { id: authUser.id, email: authUser.email ?? null }, session: null, created: false, error: null }
      : await ensureAuthAccount(phone)

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        auth_user_id: authUser?.id ?? authResult.user?.id ?? null,
        name,
        phone,
        blood_group: blood_group || null,
        is_donor: is_donor || false,
        location: latitude && longitude ? `POINT(${longitude} ${latitude})` : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Profile insert error:', error)

      const errorMessage = error.message?.toLowerCase() || ''

      if (errorMessage.includes('permission denied') || errorMessage.includes('violates row level security')) {
        return NextResponse.json(
          {
            error: 'Database permissions not configured. Please run the migration script at lib/migrations/001-fix-rls-policies.sql in your Supabase SQL Editor. See SETUP.md for detailed instructions.',
            code: 'RLS_POLICY_ERROR',
            details: error.message,
          },
          { status: 403 }
        )
      }

      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique')) {
        return NextResponse.json(
          {
            error: 'This phone number is already registered. Please try logging in instead.',
          },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: error.message || 'Failed to create profile' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const phone = request.nextUrl.searchParams.get('phone')

    if (!phone) {
      const authUser = await getAuthenticatedUser(request)
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('phone', phone).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
