'use client'

import { useState } from 'react'
import { SignInForm, SignUpForm } from '@/components/auth/auth-forms'
import Link from 'next/link'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          {isSignUp ? <SignUpForm /> : <SignInForm />}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
              {' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                {isSignUp ? '로그인' : '회원가입'}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              href="https://newbeginning-seven.vercel.app/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}