import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/tutor-dashboard', '/settings', '/bookings']
const authRoutes = ['/auth/login', '/auth/register']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  if (protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) && !session?.user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (authRoutes.includes(pathname) && session?.user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/tutor-dashboard/:path*', '/settings/:path*', '/bookings/:path*', '/auth/login', '/auth/register'],
}
