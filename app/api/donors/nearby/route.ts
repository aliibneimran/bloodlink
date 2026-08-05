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

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const lat = request.nextUrl.searchParams.get('lat')
    const lng = request.nextUrl.searchParams.get('lng')
    const blood_type = request.nextUrl.searchParams.get('blood_type')
    const radius = request.nextUrl.searchParams.get('radius') || '5'

    if (!lat || !lng || !blood_type) {
      return NextResponse.json(
        { error: 'lat, lng, and blood_type parameters are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.rpc('get_nearby_donors', {
      lat: parseFloat(lat),
      lon: parseFloat(lng),
      radius_km: parseInt(radius),
      blood_type,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
