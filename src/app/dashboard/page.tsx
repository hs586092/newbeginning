'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect is handled by the auth context
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
              <p className="text-gray-600">첫돌까지 커뮤니티에 오신 것을 환영합니다!</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">사용자 정보</h2>
              <div className="space-y-2">
                <p><span className="font-medium">이메일:</span> {user?.email}</p>
                <p><span className="font-medium">이름:</span> {profile?.full_name || '설정되지 않음'}</p>
                <p><span className="font-medium">사용자명:</span> {profile?.username || '설정되지 않음'}</p>
                <p><span className="font-medium">가입일:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-pink-100 to-pink-200 p-6 rounded-lg">
                <h3 className="font-semibold text-pink-800 mb-2">채팅</h3>
                <p className="text-pink-700 text-sm mb-4">다른 부모님들과 대화해보세요</p>
                <Link
                  href="/chat"
                  className="inline-block bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  채팅하기
                </Link>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">피드</h3>
                <p className="text-blue-700 text-sm mb-4">최신 게시물을 확인하세요</p>
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  피드 보기
                </Link>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">프로필</h3>
                <p className="text-green-700 text-sm mb-4">프로필을 편집하세요</p>
                <Link
                  href="/profile"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  프로필 편집
                </Link>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}