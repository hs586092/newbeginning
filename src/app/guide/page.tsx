'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Users, MessageCircle, BookOpen, Heart } from 'lucide-react'

export default function GuidePage() {
  const steps = [
    {
      id: 1,
      title: '회원가입',
      description: '구글 또는 카카오 계정으로 간편하게 가입하세요',
      icon: Users,
      details: [
        '로그인 페이지에서 소셜 계정 선택',
        '기본 정보 입력 (선택사항)',
        '이용약관 동의',
        '가입 완료!'
      ]
    },
    {
      id: 2,
      title: '프로필 설정',
      description: '아기 정보를 입력하고 맞춤 콘텐츠를 받아보세요',
      icon: Heart,
      details: [
        '아기 개월 수 입력',
        '관심 카테고리 선택',
        '알림 설정 조정',
        '프로필 사진 업로드 (선택)'
      ]
    },
    {
      id: 3,
      title: '커뮤니티 참여',
      description: '다른 부모들과 경험을 나누고 도움을 주고받으세요',
      icon: MessageCircle,
      details: [
        '관심 있는 글에 댓글 달기',
        '나만의 육아 경험 공유하기',
        '채팅방 참여하여 실시간 소통',
        '유용한 글 북마크하기'
      ]
    },
    {
      id: 4,
      title: '정보 활용',
      description: '개월 수별 정보와 전문가 조언을 확인하세요',
      icon: BookOpen,
      details: [
        '개월 수별 발달 정보 확인',
        '전문가가 제공하는 육아 팁',
        '다른 부모들의 질문과 답변',
        '카테고리별 정보 탐색'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              첫돌까지 시작 가이드
            </h1>
            <p className="text-xl text-gray-600">
              처음 방문하셨나요? 첫돌까지를 제대로 활용하는 방법을 알아보세요
            </p>
          </header>

          {/* 시작 가이드 스텝 */}
          <div className="space-y-8 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-2 ml-4">
                        {step.id}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-lg mb-4">
                        {step.description}
                      </p>

                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <ArrowRight className="w-4 h-4 text-pink-500" />
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 주요 기능 소개 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              주요 기능 둘러보기
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-900 mb-2">글쓰기</h3>
                <p className="text-gray-600 text-sm">
                  육아 경험과 궁금한 점을<br/>자유롭게 공유해보세요
                </p>
              </div>

              <div className="text-center p-4">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-semibold text-gray-900 mb-2">실시간 채팅</h3>
                <p className="text-gray-600 text-sm">
                  같은 고민을 가진 부모들과<br/>실시간으로 대화하세요
                </p>
              </div>

              <div className="text-center p-4">
                <div className="text-4xl mb-3">👶</div>
                <h3 className="font-semibold text-gray-900 mb-2">개월별 정보</h3>
                <p className="text-gray-600 text-sm">
                  아기 개월 수에 맞는<br/>발달 정보를 받아보세요
                </p>
              </div>

              <div className="text-center p-4">
                <div className="text-4xl mb-3">🔖</div>
                <h3 className="font-semibold text-gray-900 mb-2">북마크</h3>
                <p className="text-gray-600 text-sm">
                  유용한 글과 정보를<br/>저장하고 관리하세요
                </p>
              </div>

              <div className="text-center p-4">
                <div className="text-4xl mb-3">🔔</div>
                <h3 className="font-semibold text-gray-900 mb-2">알림</h3>
                <p className="text-gray-600 text-sm">
                  새 댓글과 메시지를<br/>놓치지 마세요
                </p>
              </div>

              <div className="text-center p-4">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-semibold text-gray-900 mb-2">그룹</h3>
                <p className="text-gray-600 text-sm">
                  관심사별 그룹에 참여하여<br/>더 깊이 소통하세요
                </p>
              </div>
            </div>
          </div>

          {/* 팁과 에티켓 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              커뮤니티 이용 팁
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ 좋은 글 쓰기</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 구체적이고 명확한 제목 작성</li>
                  <li>• 상황을 자세히 설명</li>
                  <li>• 관련 사진이나 자료 첨부</li>
                  <li>• 적절한 카테고리와 태그 설정</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🤝 커뮤니티 에티켓</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 서로를 존중하며 대화</li>
                  <li>• 건설적인 조언과 격려</li>
                  <li>• 개인정보 보호 주의</li>
                  <li>• 스팸이나 광고성 글 금지</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 시작하기 버튼 */}
          <div className="text-center">
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg mr-4"
            >
              지금 시작하기
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/faq'}
              className="px-8 py-3 text-lg"
            >
              FAQ 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}