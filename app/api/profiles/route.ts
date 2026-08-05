import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const body = await request.json()
    const { name, phone, blood_group, is_donor, latitude, longitude } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    // Insert profile
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
      return NextResponse.json({ error: error.message }, { status: 400 })
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
