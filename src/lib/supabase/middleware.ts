import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // ✅ Edge Runtime Optimization: 환경변수 빠른 검증
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Edge에서 빠른 실패 처리
  if (!supabaseUrl || !supabaseKey ||
      supabaseUrl === 'https://placeholder.supabase.co' ||
      supabaseKey === 'placeholder-key') {
    // X-Auth-Status 헤더로 상태 전달 (Edge 최적화)
    supabaseResponse.headers.set('X-Auth-Status', 'no-config')
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    // ✅ Edge Optimization: 인증 상태를 헤더로 전달
    if (user) {
      supabaseResponse.headers.set('X-Auth-Status', 'authenticated')
      supabaseResponse.headers.set('X-User-ID', user.id)
    } else {
      supabaseResponse.headers.set('X-Auth-Status', 'anonymous')
    }
  } catch (error) {
    // Edge에서 빠른 실패 처리
    supabaseResponse.headers.set('X-Auth-Status', 'error')
    user = null
  }

  // Protected routes
  if (!user && (
    request.nextUrl.pathname.startsWith('/write') ||
    request.nextUrl.pathname.startsWith('/my-posts') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/chat') ||
    request.nextUrl.pathname.includes('/edit')
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to home if already logged in and trying to access auth pages
  if (user && (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}