import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
    }

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
          console.error('Profile creation error:', profileError)
          // 프로필 생성 실패해도 로그인은 성공으로 처리
        }
      }
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
}