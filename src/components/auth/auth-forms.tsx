'use client'

import { useState, useTransition } from 'react'
import { signIn, signUp } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function SignInForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-gray-600 mt-2">계정에 로그인하세요</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
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

        <Button type="submit" className="w-full" loading={isPending}>
          로그인
        </Button>
      </form>
    </div>
  )
}

export function SignUpForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        toast.success('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-gray-600 mt-2">새 계정을 만들어보세요</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
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

        <Button type="submit" className="w-full" loading={isPending}>
          회원가입
        </Button>
      </form>
    </div>
  )
}