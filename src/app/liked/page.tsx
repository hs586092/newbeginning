/**
 * 좋아요한 글 페이지
 * CLAUDE.md 원칙: 단순함 우선
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '좋아요한 글 | 첫돌까지',
  description: '좋아요를 누른 글들을 확인하세요'
}

export default function LikedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">좋아요한 글</h1>

          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              좋아요한 글 모아보기 준비 중
            </h2>
            <p className="text-gray-600">
              좋아요를 누른 글들을 모아볼 수 있는 기능을 준비하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}