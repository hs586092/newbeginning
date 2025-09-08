import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')
  
  // Get the correct base URL for production and development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://newbeginning-seven.vercel.app'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

  // Enhanced logging for Kakao debugging
  console.log('🔄 Auth callback started:', {
    hasCode: !!code,
    hasState: !!state,
    hasError: !!error,
    baseUrl,
    url: request.url,
    allParams: Object.fromEntries(requestUrl.searchParams.entries()),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer')
  })

  // Check for OAuth errors first
  if (error) {
    console.error('❌ OAuth error received:', {
      error,
      error_description: requestUrl.searchParams.get('error_description'),
      state
    })
    return NextResponse.redirect(new URL(`/login?error=oauth_error&details=${error}`, baseUrl))
  }

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    console.log('🔑 Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Auth callback error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        details: JSON.stringify(error, null, 2)
      })
      return NextResponse.redirect(new URL(`/login?error=auth_callback_error&details=${encodeURIComponent(error.message)}`, baseUrl))
    }

    console.log('✅ Session exchange successful:', {
      hasUser: !!data.user,
      userId: data.user?.id,
      email: data.user?.email,
      provider: data.user?.app_metadata?.provider,
      providers: data.user?.app_metadata?.providers
    })

    if (data.user) {
      // Google OAuth로 로그인한 경우 프로필 생성 또는 업데이트
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // 새 사용자인 경우 프로필 생성
        const username = data.user.user_metadata?.full_name 
          ? data.user.user_metadata.full_name.replace(/\s+/g, '_').toLowerCase()
          : `user_${data.user.id.slice(-8)}`

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            full_name: data.user.user_metadata?.full_name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          } as any)

        if (profileError) {
          console.error('⚠️ Profile creation error:', profileError)
          // 프로필 생성 실패해도 로그인은 성공으로 처리
        } else {
          console.log('✅ Profile created successfully')
        }
      } else {
        console.log('ℹ️ Profile already exists')
      }
    }

    console.log('🏠 Redirecting to home page:', baseUrl)
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  console.log('❌ No code parameter found')
  return NextResponse.redirect(new URL('/login?error=no_code', baseUrl))
}