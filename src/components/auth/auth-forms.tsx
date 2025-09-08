'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function GoogleSignInButton() {
  const { signInWithGoogle, isLoading } = useAuth()
  const [isPending, setIsPending] = useState(false)

  async function handleGoogleSignIn() {
    setIsPending(true)
    try {
      const result = await signInWithGoogle()
      if (!result.success) {
        toast.error(result.error || 'Google 로그인 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Google 로그인 중 오류가 발생했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      loading={isPending || isLoading}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Google로 로그인
    </Button>
  )
}

function KakaoSignInButton() {
  const { signInWithKakao, isLoading } = useAuth()
  const [isPending, setIsPending] = useState(false)

  async function handleKakaoSignIn() {
    setIsPending(true)
    try {
      const result = await signInWithKakao()
      if (!result.success) {
        toast.error(result.error || '카카오 로그인 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Kakao sign in error:', error)
      toast.error('카카오 로그인 중 오류가 발생했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      className="w-full bg-yellow-300 hover:bg-yellow-400 text-gray-900 border-yellow-300"
      onClick={handleKakaoSignIn}
      loading={isPending || isLoading}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
      </svg>
      카카오로 로그인
    </Button>
  )
}

export function SignInForm() {
  const { signIn, isLoading } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsPending(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const result = await signIn(email, password)
      
      if (!result.success) {
        setError(result.error || '로그인 중 오류가 발생했습니다.')
      } else {
        toast.success('성공적으로 로그인되었습니다.')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('로그인 중 예기치 못한 오류가 발생했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-gray-600 mt-2">계정에 로그인하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={isPending || isLoading}>
          로그인
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>

      <div className="space-y-3">
        <GoogleSignInButton />
        <KakaoSignInButton />
      </div>
    </div>
  )
}

export function SignUpForm() {
  const { signUp, isLoading } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsPending(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const username = formData.get('username') as string

      const result = await signUp(email, password, username)
      
      if (!result.success) {
        setError(result.error || '회원가입 중 오류가 발생했습니다.')
      } else {
        toast.success('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setError('회원가입 중 예기치 못한 오류가 발생했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-gray-600 mt-2">새 계정을 만들어보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">닉네임</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="닉네임을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="6자 이상 입력하세요"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={isPending || isLoading}>
          회원가입
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>

      <div className="space-y-3">
        <GoogleSignInButton />
        <KakaoSignInButton />
      </div>
    </div>
  )
}