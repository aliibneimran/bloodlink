import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase/auth'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
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

  try {
    const body = await request.json()
    const { request_id, donor_id } = body

    if (!request_id || !donor_id) {
      return NextResponse.json({ error: 'request_id and donor_id are required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Call the atomic function
    const { data, error } = await supabase.rpc('accept_blood_request_atomically', {
      request_id,
      donor_id,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // data should be an array with one result from the function
    const result = data?.[0]

    if (!result?.success) {
      return NextResponse.json({ error: result?.message || 'Failed to accept request' }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
