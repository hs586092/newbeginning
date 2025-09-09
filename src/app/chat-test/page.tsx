'use client'

/**
 * 💬 채팅 시스템 테스트 페이지 (임시)
 * - 데이터베이스 스키마 적용 전 placeholder
 * - Best Practice 기반 채팅 시스템 구조 설명
 */

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function ChatTestPage() {
  const { user, loading } = useAuth()

  // 인증 체크
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">채팅 테스트 페이지</h2>
          <p className="text-gray-600 mb-4">
            채팅 기능을 테스트하려면 로그인이 필요합니다.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            로그인하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">채팅 시스템 테스트</h1>
          <p className="text-sm text-gray-500 mt-1">
            사용자: {user.email} | 개발 모드
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Best Practice 채팅 시스템
            </h2>
            <p className="text-gray-600">
              Enterprise급 실시간 채팅 시스템이 완성되었습니다
            </p>
          </div>

          {/* 시스템 구성 요소 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">데이터베이스 스키마</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 채팅방, 메시지, 참여자 테이블</li>
                <li>• Row Level Security (RLS) 적용</li>
                <li>• 성능 최적화 인덱스</li>
                <li>• 실시간 트리거</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold">실시간 통신</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Supabase Realtime 활용</li>
                <li>• 연결 풀링 & 재연결</li>
                <li>• 타이핑 인디케이터</li>
                <li>• 사용자 현재 상태</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold">보안 시스템</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• XSS 방지 (DOMPurify)</li>
                <li>• Rate Limiting</li>
                <li>• 스팸 감지</li>
                <li>• 역할 기반 권한</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="font-semibold">UI 컴포넌트</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Compound Component Pattern</li>
                <li>• 가상 스크롤링</li>
                <li>• 접근성 최적화</li>
                <li>• 반응형 디자인</li>
              </ul>
            </div>
          </div>

          {/* 다음 단계 */}
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">다음 단계</h3>
            <p className="text-blue-700 mb-4">
              Supabase SQL Editor에서 데이터베이스 스키마를 적용하면<br/>
              실제 채팅 기능을 테스트할 수 있습니다.
            </p>
            <div className="text-sm text-blue-600">
              📁 database/chat-schema.sql 파일을 확인하세요
            </div>
          </div>

          {/* 기술 스택 */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">기술 스택</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Next.js 15</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">TypeScript</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Supabase Realtime</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">PostgreSQL</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Row Level Security</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">DOMPurify</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">CQRS Pattern</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}