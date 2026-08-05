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
    const { request_id, donor_id, reason } = body

    if (!request_id || !donor_id) {
      return NextResponse.json({ error: 'request_id and donor_id are required' }, { status: 400 })
    }

    // Call the function to cancel
    const { data, error } = await supabase.rpc('cancel_blood_request_by_donor', {
      request_id,
      donor_id,
      reason_text: reason || 'No reason provided',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const result = data?.[0]

    if (!result?.success) {
      return NextResponse.json({ error: result?.message || 'Failed to cancel request' }, { status: 400 })
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
