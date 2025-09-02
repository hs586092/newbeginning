'use client'

import { useState } from 'react'
import { HeroSection } from './hero-section'
import { DashboardStats } from './dashboard-stats'
import { ValueProposition } from './value-proposition'
import { SocialProof } from './social-proof'
import { SearchBarEnhanced } from '@/components/ui/search-bar-enhanced'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

type UserType = 'pregnant' | 'newMom' | 'growingMom' | 'experienced' | null

interface CustomerCentricPageProps {
  initialUserType?: UserType
}

export function CustomerCentricPage({ initialUserType = null }: CustomerCentricPageProps) {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(initialUserType)
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)

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
              완벽한 매칭을 찾는 가장 빠른 방법
            </h2>
            <p className="text-xl text-gray-600">
              AI 추천으로 시간을 절약하고, 더 나은 기회를 발견하세요
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

      {/* Social Proof */}
      <SocialProof />

      {/* Final CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            5,000+ 개발자들이 선택한 신뢰할 수 있는 플랫폼
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