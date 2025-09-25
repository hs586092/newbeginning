'use client'

import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              첫돌까지에 대하여
            </h1>
            <p className="text-xl text-gray-600">
              초보엄마부터 베테랑맘까지 모든 육아맘들이 소통하는 공간
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">우리의 미션</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              첫돌까지는 새로운 부모들이 육아 여정에서 겪는 다양한 경험을 공유하고,
              서로 도움을 주고받을 수 있는 따뜻한 커뮤니티입니다.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              우리는 모든 부모가 자신감을 가지고 즐겁게 육아할 수 있도록
              정보, 경험, 그리고 무엇보다 마음의 지지를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🤱 경험 공유
              </h3>
              <p className="text-gray-700">
                실제 육아 경험담을 나누며
                서로에게서 배우고 성장합니다.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                💬 실시간 소통
              </h3>
              <p className="text-gray-700">
                채팅과 커뮤니티 기능으로
                언제든지 궁금한 것을 물어보세요.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                👶 전문 정보
              </h3>
              <p className="text-gray-700">
                개월 수별 발달 정보와
                전문가의 조언을 제공합니다.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ❤️ 마음의 지지
              </h3>
              <p className="text-gray-700">
                힘든 순간에도 혼자가 아니라는
                따뜻한 응원을 받으세요.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
            >
              커뮤니티 둘러보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}