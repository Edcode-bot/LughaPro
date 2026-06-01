import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function hasValidSupabaseConfig(key: string | undefined = supabaseAnonKey) {
  try {
    if (!supabaseUrl || !key) return false
    new URL(supabaseUrl)
    return key.split('.').length === 3 || key.startsWith('sb_')
  } catch {
    return false
  }
}

function logSupabaseConfigError() {
  console.error('Supabase is not configured correctly. Check NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.')
}

const emptyQuery = {
  select: () => emptyQuery,
  insert: () => emptyQuery,
  upsert: () => emptyQuery,
  update: () => emptyQuery,
  delete: () => emptyQuery,
  eq: () => emptyQuery,
  in: () => emptyQuery,
  order: () => emptyQuery,
  limit: () => emptyQuery,
  range: () => emptyQuery,
  maybeSingle: async () => ({ data: null, error: null }),
  single: async () => ({ data: null, error: null }),
  then: (resolve: (value: { data: never[]; error: null }) => unknown) => resolve({ data: [], error: null }),
}

function createEmptyClient() {
  return {
    from: () => emptyQuery,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      admin: {
        createUser: async () => ({ data: { user: null }, error: new Error('Supabase is not configured') }),
      },
    },
  }
}

export const createBrowserSupabaseClient = () => {
  if (!hasValidSupabaseConfig()) {
    logSupabaseConfigError()
    return createEmptyClient() as ReturnType<typeof createBrowserClient>
  }
  try {
    return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  } catch (error) {
    console.error('Failed to create Supabase browser client', error)
    return createEmptyClient() as ReturnType<typeof createBrowserClient>
  }
}

export const createServerSupabaseClient = async (): Promise<any> => {
  if (!hasValidSupabaseConfig()) {
    logSupabaseConfigError()
    return createEmptyClient()
  }
  try {
    const cookieStore = await cookies()
    return createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(items) {
          items.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })
  } catch (error) {
    console.error('Failed to create Supabase server client', error)
    return createEmptyClient()
  }
}

/** Service-role client — bypasses RLS. Use in all server API routes for writes. */
export function createAdminClient() {
  if (!hasValidSupabaseConfig(serviceRoleKey)) {
    logSupabaseConfigError()
    return createEmptyClient() as unknown as ReturnType<typeof createClient>
  }
  try {
    return createClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error('Failed to create Supabase admin client', error)
    return createEmptyClient() as unknown as ReturnType<typeof createClient>
  }
}

export const supabaseAdmin = createAdminClient()
