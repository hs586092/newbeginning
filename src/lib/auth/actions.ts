'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  username: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(20, '닉네임은 최대 20자까지 가능합니다')
    .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다')
})

const signInSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요')
})

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    username: formData.get('username') as string
  }

  try {
    const validatedData = signUpSchema.parse(rawData)

    // Check if username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', validatedData.username)
      .single()

    if (existingProfile) {
      return { 
        error: '이미 사용중인 닉네임입니다.',
        type: 'username' as const
      }
    }

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          username: validatedData.username
        }
      }
    })

    if (error) {
      return { 
        error: error.message,
        type: 'auth' as const
      }
    }

    // Profile creation is handled automatically by Supabase trigger
    // No manual profile creation needed

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    return { 
      error: '회원가입 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function signIn(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    }

    const validatedData = signInSchema.parse(rawData)

    console.log('🔑 로그인 시도:', { email: validatedData.email })

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      console.error('❌ Supabase Auth Error:', {
        message: error.message,
        status: error.status,
        code: error.code
      })
      
      // 구체적인 에러 메시지 매핑
      if (error.message?.includes('Invalid login credentials')) {
        return { 
          error: '이메일 또는 비밀번호가 올바르지 않습니다.',
          type: 'auth' as const
        }
      }
      
      if (error.message?.includes('Email not confirmed')) {
        return { 
          error: '이메일 확인이 필요합니다.',
          type: 'auth' as const
        }
      }
      
      return { 
        error: `인증 오류: ${error.message}`,
        type: 'auth' as const
      }
    }

    if (!data.user) {
      console.error('❌ 인증 성공했지만 사용자 데이터 없음')
      return { 
        error: '로그인 처리 중 문제가 발생했습니다.',
        type: 'auth' as const
      }
    }

    console.log('✅ 로그인 성공:', { 
      userId: data.user.id, 
      email: data.user.email,
      emailConfirmed: data.user.email_confirmed_at ? '✅' : '❌'
    })

    // 프로필 확인 (Best Practice - 실패해도 로그인 진행)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        console.log('✅ 프로필 확인:', { username: (profile as any).username })
      } else {
        console.warn('⚠️ 프로필 없음, 하지만 로그인 진행')
      }
    } catch (profileError) {
      console.warn('⚠️ 프로필 조회 실패, 하지만 로그인 진행:', profileError)
    }

    console.log('🔄 페이지 리다이렉트 준비')
    revalidatePath('/', 'layout')
    redirect('/')
    
  } catch (error) {
    // 유효성 검증 에러
    if (error instanceof z.ZodError) {
      console.error('❌ 유효성 검증 실패:', error.issues[0].message)
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    // Next.js redirect는 정상 동작 (에러가 아님)
    if (error && typeof error === 'object') {
      const errorObj = error as any
      if (errorObj.digest === 'NEXT_REDIRECT' || 
          errorObj.message?.includes('NEXT_REDIRECT') ||
          errorObj.__NEXT_REDIRECT_ERROR__) {
        console.log('✅ 로그인 성공 - 메인 페이지로 리다이렉트')
        throw error // 정상적인 redirect이므로 다시 throw
      }
    }
    
    // 진짜 예외 상황
    console.error('💥 예상치 못한 로그인 오류:', {
      errorType: typeof error,
      message: (error as any)?.message,
      digest: (error as any)?.digest,
      name: (error as any)?.name
    })
    
    return { 
      error: '로그인 처리 중 시스템 오류가 발생했습니다.',
      type: 'system' as const
    }
  }
}

export async function signInWithGoogle() {
  const supabase = await createServerSupabaseClient()
  
  // Get the correct base URL for production and development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://newbeginning-seven.vercel.app'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  })

  if (error) {
    console.error('Google OAuth error:', error)
    return { error: 'Google 로그인 중 오류가 발생했습니다.' }
  }

  if (data?.url) {
    redirect(data.url)
  }
}

export async function signInWithKakao() {
  const supabase = await createServerSupabaseClient()
  
  // Get the correct base URL for production and development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://newbeginning-seven.vercel.app'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    }
  })

  if (error) {
    console.error('Kakao OAuth error:', error)
    return { error: '카카오 로그인 중 오류가 발생했습니다.' }
  }

  if (data?.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: '로그아웃 중 오류가 발생했습니다.' }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}