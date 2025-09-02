'use client'

import { useState } from 'react'
import { HeroSection } from './hero-section'
import { DashboardStats } from './dashboard-stats'
import { ValueProposition } from './value-proposition'
import { SocialProof } from './social-proof'
import { SearchBarEnhanced } from '@/components/ui/search-bar-enhanced'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Heart, MessageCircle, Users, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import SocialFeed from '@/components/social/social-feed'
import HorizontalCategoryFilter from '@/components/social/horizontal-category-filter'

type UserType = 'pregnant' | 'newMom' | 'growingMom' | 'experienced' | null

interface CustomerCentricPageProps {
  initialUserType?: UserType
}

export function CustomerCentricPage({ initialUserType = null }: CustomerCentricPageProps) {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(initialUserType)
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
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

      {/* Dashboard-style Stats (inspired by your reference) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <DashboardStats />
        </div>
      </section>

      {/* Value Propositions */}
      <ValueProposition userType={selectedUserType} />

      {/* Quick Action Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
              <Sparkles className="w-4 h-4" />
              <span>지금 바로 시작해보세요</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              필요한 정보를 찾는 가장 빠른 방법
            </h2>
            <p className="text-xl text-gray-600">
              맞춤 정보로 시간을 절약하고, 더 나은 육아 방법을 발견하세요
            </p>
          </div>

          {/* Smart Search Demo */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto mb-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                어떤 기회를 찾고 계신가요?
              </label>
              <SearchBarEnhanced 
                size="lg"
                placeholder={
                  selectedUserType === 'pregnant' 
                    ? "예: 임신 초기 증상, 산부인과 추천, 태교법" 
                    : selectedUserType === 'newMom'
                    ? "예: 신생아 수유, 기저귀, 수면패턴"
                    : selectedUserType === 'growingMom'
                    ? "예: 이유식 시작, 아기 발달, 예방접종"
                    : "예: 육아용품, 병원, 전문가"
                }
              />
            </div>
            
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-3">🎯 맞춤 정보 예시:</div>
              <div className="space-y-2">
                {selectedUserType === 'pregnant' ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span>임신 초기 필수 검사 정보 <span className="text-pink-600">12건 발견</span></span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>근처 산부인과 추천 <span className="text-purple-600">8곳 매칭</span></span>
                    </div>
                  </>
                ) : selectedUserType === 'newMom' ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>신생아 수유 가이드 <span className="text-blue-600">24개 정보</span></span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      <span>수면 패턴 도움 팁 <span className="text-teal-600">18개 발견</span></span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>이유식 시작 가이드 <span className="text-green-600">32개 레시피</span></span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>아기 발달 체크리스트 <span className="text-yellow-600">15개 항목</span></span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={
              selectedUserType === 'pregnant' ? '/pregnancy' : 
              selectedUserType === 'newMom' ? '/newborn' : 
              selectedUserType === 'growingMom' ? '/development' : 
              '/community'
            }>
              <Button size="lg" className="w-full sm:w-auto font-semibold text-lg px-8 py-4">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5" />
                  <span>
                    {selectedUserType === 'pregnant' 
                      ? '임신 정보 보기' 
                      : selectedUserType === 'newMom'
                      ? '신생아 케어 가이드'
                      : selectedUserType === 'growingMom'
                      ? '성장 발달 정보'
                      : '커뮤니티 참여하기'
                    }
                  </span>
                </div>
              </Button>
            </Link>
            
            <button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              고급 기능 살펴보기
            </button>
          </div>

          {/* Advanced Features (expandable) */}
          {showAdvancedFeatures && (
            <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <Link href="/matching" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="font-semibold text-gray-800 mb-2">🎯 스마트 매칭</div>
                  <div className="text-gray-600">AI가 경력, 기술스택, 선호도를 분석해 최적 매칭</div>
                </Link>
                <Link href="/analytics" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="font-semibold text-gray-800 mb-2">📊 실시간 분석</div>
                  <div className="text-gray-600">시장 트렌드와 연봉 데이터를 실시간 제공</div>
                </Link>
                <Link href="/consulting" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="font-semibold text-gray-800 mb-2">🤝 1:1 컨설팅</div>
                  <div className="text-gray-600">전문 컨설턴트의 개인 맞춤형 커리어 조언</div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Live Community Feed */}
      <section className="py-16 bg-gradient-to-b from-pink-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Community Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full text-pink-700 font-medium mb-4">
              <Users className="w-5 h-5" />
              <span>👶 실시간 엄마들의 이야기</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
                지금 이 순간 나누는 진솔한 경험들
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              임신부터 첫돌까지, 2,847명의 엄마들이 실시간으로 나누는 생생한 육아 이야기를 확인해보세요
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">89,234</div>
              <div className="text-xs text-gray-600">포근한 응원</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">12,456</div>
              <div className="text-xs text-gray-600">공유된 이야기</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">2,847</div>
              <div className="text-xs text-gray-600">활성 엄마들</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <PlusCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">156</div>
              <div className="text-xs text-gray-600">오늘 새 글</div>
            </div>
          </div>

          {/* Category Filter - Horizontal Scroll */}
          <div className="mb-8">
            <HorizontalCategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              compact={true}
            />
          </div>

          {/* Quick Post Box */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🤱</span>
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => {}}
                    className="w-full p-4 text-left bg-white rounded-xl border border-gray-200 hover:border-pink-300 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <span className="text-gray-500">오늘은 어떤 육아 이야기를 나누고 싶으신가요?</span>
                  </button>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button className="flex items-center space-x-1 hover:text-pink-600 transition-colors">
                        <span>📷</span>
                        <span>사진</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                        <span>😊</span>
                        <span>기분</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <span>🏷️</span>
                        <span>태그</span>
                      </button>
                    </div>
                    <Link href="/login">
                      <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                        포근 공유하기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              💝 <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">무료 가입</Link>으로 포스트 작성하고 2,847명의 엄마들과 소통하세요
            </p>
          </div>

          {/* Social Feed Preview */}
          <div className="max-w-4xl mx-auto">
            <SocialFeed
              selectedCategory={selectedCategory === 'all' ? undefined : selectedCategory}
            />
          </div>

          {/* View More CTA */}
          <div className="text-center mt-12">
            <Link href="/community">
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-8 py-4">
                <Users className="w-5 h-5 mr-2" />
                전체 커뮤니티 보기
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              무료 가입으로 포스트 작성하고 더 많은 엄마들과 소통하세요
            </p>
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