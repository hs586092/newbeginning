'use client'

import { useState } from 'react'
import { HeroSection } from './hero-section'
import { SocialProof } from './social-proof'
import { Button } from '@/components/ui/button'
import { Heart, Users } from 'lucide-react'
import Link from 'next/link'
import SocialFeed from '@/components/social/social-feed'

type UserType = 'pregnant' | 'newMom' | 'growingMom' | 'experienced' | null

interface CustomerCentricPageProps {
  initialUserType?: UserType
}

export function CustomerCentricPage({ initialUserType = null }: CustomerCentricPageProps) {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(initialUserType)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleUserTypeChange = (type: UserType) => {
    setSelectedUserType(type)
    // 사용자 타입에 따라 페이지 개인화
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', type || 'default')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection 
        userType={selectedUserType} 
        onUserTypeSelect={handleUserTypeChange}
      />

      {/* Live Community Feed with Sidebar Layout */}
      <section className="py-16 bg-gradient-to-b from-pink-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Community Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full text-pink-700 font-medium mb-4">
              <Users className="w-5 h-5" />
              <span>👶 실시간 엄마들의 이야기</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
                첫돌까지 함께하는 여정
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              소중한 21개월의 여정을 2,847명의 엄마들과 함께 나누고 있어요
            </p>
          </div>

          {/* Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">첫돌까지 함께하는 여정</h3>
                <div className="text-center text-sm text-gray-600 mb-6">소중한 21개월을 함께 걸어가고 있어요</div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">❤️</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">89.2K</div>
                    <div className="text-xs text-gray-600">+15%</div>
                    <div className="text-xs text-gray-500">포근한 응원</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">👥</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">2,847</div>
                    <div className="text-xs text-gray-600">+23%</div>
                    <div className="text-xs text-gray-500">활성 엄마들</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">⭐</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">94%</div>
                    <div className="text-xs text-gray-600">+4%</div>
                    <div className="text-xs text-gray-500">만족도 지수</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">⏰</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">1,234</div>
                    <div className="text-xs text-gray-600">+38%</div>
                    <div className="text-xs text-gray-500">월간 글</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>응원하기</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <span>⏰</span>
                    <span>신속한 피드</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <span>🎭</span>
                    <span>커뮤니티 소식</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <span>📘</span>
                    <span>진료기록</span>
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">전문의 상담</h3>
                <div className="text-sm text-gray-600 mb-4">각 분야별 상담 정보를 보여드려요</div>
                
                <div className="space-y-3">
                  {[
                    { name: '임신 정보', icon: '🤰', color: 'purple', count: 342 },
                    { name: '신생아', icon: '👶', color: 'pink', count: 567 },
                    { name: '이유식', icon: '🥄', color: 'green', count: 234 },
                    { name: '수면교육', icon: '😴', color: 'indigo', count: 189 }
                  ].map((category, index) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name === '전체' ? 'all' : category.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                        selectedCategory === category.name
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">{category.count}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Post Box */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">필요한 정보를 찾는 가장 빠른 방법</h3>
                <div className="text-sm text-gray-600 mb-4">인육 정보를 찾을 수 있는 가장 스마트한 태도로 원하는 것을 찾아보세요</div>
                
                <div className="space-y-3 mb-4">
                  <button
                    onClick={() => {}}
                    className="w-full p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-pink-300 transition-colors"
                  >
                    <span className="text-gray-500">예: 육아용품, 병원, 전문가</span>
                  </button>
                  
                  <div className="text-xs text-gray-600">🎯 맞춤 정보 예시:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span>💝 전용 육아 후기: <span className="text-pink-600">324건 발견</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>🎯 단계별 자료 24건: <span className="text-blue-600">3.2K 공유</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>🏆 맞춤 요청 55건: <span className="text-green-600">15분 평균</span></span>
                    </div>
                  </div>
                </div>
                
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                    검색
                  </Button>
                </Link>
              </div>
            </div>

            {/* Main Content - Social Feed */}
            <div className="flex-1">
              <SocialFeed
                selectedCategory={selectedCategory === 'all' ? undefined : selectedCategory}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Final CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            12,000+ 엄마들이 선택한 신뢰할 수 있는 육아 커뮤니티
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 font-semibold text-lg px-8 py-4"
              >
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/community">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900 font-semibold text-lg px-8 py-4"
              >
                커뮤니티 둘러보기
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            💳 카드 등록 없음 · 📧 이메일만으로 간편 가입 · 🎯 맞춤 추천 즉시 시작
          </div>
        </div>
      </section>
    </div>
  )
}

export default CustomerCentricPage