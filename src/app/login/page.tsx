'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client-factory'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const supabase = await getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }
    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    console.log('🔐 Login attempt started for:', email)
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = await getSupabaseClient()
      console.log('🔄 Calling signInWithPassword...')

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log('📊 Login response:', {
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        error: error?.message
      })

      if (error) {
        console.error('❌ Login error:', error)

        if (error.message === 'Email logins are disabled') {
          setError('현재 이메일 로그인이 일시적으로 비활성화되었습니다. Google 로그인을 이용해 주세요.')
        } else if (error.message === 'Invalid login credentials') {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message === 'Email not confirmed') {
          setError('이메일 인증이 완료되지 않았습니다. 이메일을 확인해 주세요.')
        } else {
          setError(`로그인 실패: ${error.message}`)
        }
        return
      }

      if (data.session && data.user) {
        console.log('✅ Login successful:', data.user.email)
        setMessage('로그인 성공! 메인 페이지로 이동합니다...')
        router.push('/')
      } else {
        console.warn('⚠️ Login returned no session')
        setError('로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.')
      }
    } catch (err) {
      console.error('❌ Login exception:', err)
      setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
    } finally {
      console.log('🔄 Setting loading to false')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    console.log('🔐 Google login attempt started')
    setLoading(true)
    setError(null)

    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('❌ Google login error:', error)
        setError(`Google 로그인 실패: ${error.message}`)
      } else {
        console.log('✅ Google OAuth redirect initiated')
        setMessage('Google 로그인 중... 잠시만 기다려주세요.')
        return
      }
    } catch (err) {
      console.error('❌ Google login exception:', err)
      setError('Google 로그인 중 오류가 발생했습니다.')
    } finally {
      setTimeout(() => setLoading(false), 100)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">로그인</h1>
            <p className="text-gray-600">첫돌까지 커뮤니티에 오신 것을 환영합니다</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
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