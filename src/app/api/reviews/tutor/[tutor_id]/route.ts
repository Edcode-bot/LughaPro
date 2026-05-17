import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ tutor_id: string }> }) {
  const { tutor_id } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*, student:profiles(*)')
    .eq('tutor_id', tutor_id)
    .order('created_at', { ascending: false })

  if (error) return jsonError('Unable to load reviews', 500)

  return jsonOk(data ?? [], 'Reviews loaded')
}

