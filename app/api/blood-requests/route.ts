import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase/auth'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const supabase = getSupabaseClient()
  try {
    const body = await request.json()
    let {
      requester_id,
      patient_blood_group,
      request_type,
      required_date,
      hospital_name,
      hospital_lat,
      hospital_lng,
    } = body

    if (!requester_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (profileError || !profile) {
        return NextResponse.json({ error: 'Authenticated user profile not found' }, { status: 404 })
      }

      requester_id = profile.id
    }

    if (!requester_id || !patient_blood_group || !hospital_name || !hospital_lat || !hospital_lng) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blood_requests')
      .insert({
        requester_id,
        patient_blood_group,
        request_type: request_type || 'instant',
        required_date: required_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        hospital_name,
        hospital_location: `POINT(${hospital_lng} ${hospital_lat})`,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status')
  const myOnly = request.nextUrl.searchParams.get('my') === 'true'
  const matchOnly = request.nextUrl.searchParams.get('match') === 'true'
  const supabase = getSupabaseClient()

  try {
    let query

    if (myOnly || matchOnly) {
      const user = await getAuthenticatedUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, blood_group')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (profileError || !profile) {
        return NextResponse.json({ error: 'Authenticated user profile not found' }, { status: 404 })
      }

      if (matchOnly) {
        query = supabase
          .from('blood_requests')
          .select('*')
          .eq('patient_blood_group', profile.blood_group)
          .eq('status', 'pending')
          .neq('requester_id', profile.id)
      } else {
        query = supabase
          .from('blood_requests')
          .select('*')
          .or(`requester_id.eq.${profile.id},accepted_by_donor_id.eq.${profile.id}`)
      }
    } else {
      query = supabase.from('blood_requests').select('*')
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
