import { jsonError, jsonOk } from '@/lib/api'
import { assertAdminSecret } from '@/lib/admin-wallet'
import { createAdminClient } from '@/lib/supabase'

const RLS_SQL = `
alter table public.books enable row level security;
alter table public.posts enable row level security;
alter table public.purchases enable row level security;
alter table public.profiles enable row level security;
alter table public.tutors enable row level security;
`.trim()

export async function POST(request: Request) {
  if (!assertAdminSecret(request)) {
    return jsonError('Unauthorized', 401)
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('apply_lugha_rls_policies')

  if (error) {
    return jsonError(
      `RLS apply failed: ${error.message}. Run supabase/schema.sql in the Supabase SQL editor first (creates apply_lugha_rls_policies).`,
      500,
    )
  }

  const result = data as { ok?: boolean; error?: string; message?: string } | null
  if (result && result.ok === false) {
    return jsonError(result.error ?? 'RLS apply failed', 500)
  }

  return jsonOk(
    {
      applied: true,
      rpc: result,
      note: 'Policies also documented in supabase/schema.sql',
      sql_hint: RLS_SQL,
    },
    'RLS policies applied',
  )
}

export async function GET() {
  return jsonOk(
    {
      endpoint: 'POST /api/admin/apply-rls-policies',
      header: 'x-admin-secret',
      schema: 'supabase/schema.sql',
    },
    'Use POST with admin secret to apply RLS policies',
  )
}
