import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { ensureAuthAccount } from '@/lib/auth/bootstrap'

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

    const authResult = await ensureAuthAccount(phone)
    
    if (authResult.error) {
      console.warn('Auth account creation warning (non-blocking):', authResult.error)
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('profiles')
      .insert({
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
            error: 'This phone number is already registered. Please try logging in instead.' 
          }, 
          { status: 409 }
        )
      }
      
      return NextResponse.json({ error: error.message || 'Failed to create profile' }, { status: 400 })
    }

    return NextResponse.json({
      ...data,
      auth: {
        userId: authResult.user?.id ?? null,
        created: authResult.created,
        email: authResult.user?.email ?? null,
        authError: authResult.error,
      },
    })
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
      return NextResponse.json({ error: 'Phone parameter is required' }, { status: 400 })
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
