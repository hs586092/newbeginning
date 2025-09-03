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

    if (data.user) {
      // Create profile with explicit fields
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: validatedData.username,
          full_name: null,
          avatar_url: null
        } as any)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { 
          error: '프로필 생성 중 오류가 발생했습니다.',
          type: 'profile' as const
        }
      }
    }

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
  const supabase = await createServerSupabaseClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  try {
    const validatedData = signInSchema.parse(rawData)

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return { 
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
        type: 'auth' as const
      }
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    return { 
      error: '로그인 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function signInWithGoogle() {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
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

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: '로그아웃 중 오류가 발생했습니다.' }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}