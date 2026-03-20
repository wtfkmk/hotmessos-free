import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Must be created before any response is returned so cookies can be refreshed
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to both the request (for downstream middleware) and the response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() not getSession() — getUser() re-validates the JWT server-side
  // so revoked tokens are caught. getSession() only reads cookies without verification.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes — require authentication
  const isProtected = pathname.startsWith('/account')

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Always return supabaseResponse (not NextResponse.next()) so refreshed
  // auth cookies are forwarded to the browser
  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on /account and all sub-paths. Exclude Next.js internals and static assets.
    '/account/:path*',
  ],
}
