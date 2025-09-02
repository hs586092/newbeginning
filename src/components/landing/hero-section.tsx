'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchBarEnhanced } from '@/components/ui/search-bar-enhanced'
import { ArrowRight, Heart, Baby, Users, Star } from 'lucide-react'

type UserType = 'pregnant' | 'newMom' | 'growingMom' | 'experienced' | null

const HERO_CONTENT = {
  pregnant: {
    headline: "소중한 생명과 함께하는 특별한 시작",
    subtext: "임신부터 출산까지, 매 순간이 소중한 예비맘들을 위한 전문 정보와 따뜻한 커뮤니티",
    cta: "임신 정보 보기",
    ctaIcon: <Heart className="w-5 h-5" />,
    bgGradient: "from-pink-400 to-purple-400",
    stats: { label: "예비맘", value: "2,500+" }
  },
  newMom: {
    headline: "생애 첫 육아, 혼자가 아니에요",
    subtext: "신생아와의 첫 만남부터 3개월까지, 초보맘들의 모든 궁금증과 불안을 함께 해결해요",
    cta: "신생아 케어 가이드",
    ctaIcon: <Baby className="w-5 h-5" />,
    bgGradient: "from-blue-400 to-teal-400",
    stats: { label: "신생아맘", value: "1,800+" }
  },
  growingMom: {
    headline: "우리 아기 성장하는 모든 순간이 특별해요",
    subtext: "이유식부터 첫 걸음까지, 4-12개월 아기와 함께하는 성장 여정을 응원합니다",
    cta: "성장 발달 정보",
    ctaIcon: <Baby className="w-5 h-5" />,
    bgGradient: "from-green-400 to-blue-400",
    stats: { label: "성장기맘", value: "3,200+" }
  },
  experienced: {
    headline: "경험이 쌓인 선배맘들의 소중한 조언",
    subtext: "육아 경험을 나누고, 후배맘들에게 도움을 주며 함께 성장하는 따뜻한 커뮤니티",
    cta: "경험 공유하기",
    ctaIcon: <Users className="w-5 h-5" />,
    bgGradient: "from-orange-400 to-pink-400",
    stats: { label: "선배맘", value: "4,500+" }
  },
  default: {
    headline: "임신부터 첫돌까지, 모든 순간을 함께",
    subtext: "21개월의 소중한 여정을 혼자 걸어가지 마세요. 따뜻한 엄마들의 커뮤니티가 함께합니다",
    cta: "여정 시작하기",
    ctaIcon: <ArrowRight className="w-5 h-5" />,
    bgGradient: "from-pink-500 to-blue-500",
    stats: { label: "전체 회원", value: "12,000+" }
  }
}

interface HeroSectionProps {
  userType?: UserType
  onUserTypeSelect?: (type: UserType) => void
}

export function HeroSection({ userType = null, onUserTypeSelect }: HeroSectionProps) {
  const [selectedType, setSelectedType] = useState<UserType>(userType)
  const [isAnimating, setIsAnimating] = useState(false)

  const content = HERO_CONTENT[selectedType || 'default']

  const handleTypeSelect = (type: UserType) => {
    if (type === selectedType) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setSelectedType(type)
      onUserTypeSelect?.(type)
      setIsAnimating(false)
    }, 150)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${content.bgGradient} transition-all duration-500`}>
        <div className="absolute inset-0 bg-black/20" />
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        {/* User Type Selector */}
        <div className="flex justify-center mb-8 md:mb-12 px-4">
          <div className="inline-flex flex-col sm:flex-row gap-1 sm:gap-2 bg-black/10 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 border border-white/20 shadow-2xl max-w-fit">
            {[
              { key: 'pregnant', label: '예비맘', icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" /> },
              { key: 'newMom', label: '신생아맘', icon: <Baby className="w-4 h-4 sm:w-5 sm:h-5" /> },
              { key: 'growingMom', label: '성장기맘', icon: <Baby className="w-4 h-4 sm:w-5 sm:h-5" /> },
              { key: 'experienced', label: '선배맘', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleTypeSelect(key as UserType)}
                className={`group relative flex items-center justify-center space-x-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform min-w-0 whitespace-nowrap ${
                  selectedType === key
                    ? 'bg-white text-blue-600 shadow-xl scale-[1.02] sm:scale-105 ring-2 ring-white/30'
                    : 'text-white/90 hover:text-white hover:bg-white/20 hover:scale-[1.01] sm:hover:scale-102 hover:shadow-lg active:scale-[0.98] sm:active:scale-95'
                }`}
              >
                <div className={`transition-transform duration-300 ${selectedType === key ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {icon}
                </div>
                <span className="text-sm sm:text-base">{label}</span>
                
                {/* Subtle glow effect for active button */}
                {selectedType === key && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-sm -z-10" />
                )}
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className={`text-center px-4 transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {content.headline}
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
            {content.subtext}
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center mb-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="flex items-center space-x-2 text-white">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">{content.stats.value}</span>
                <span className="text-white/80">{content.stats.label}</span>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          {selectedType && (
            <div className="mb-8">
              <SearchBarEnhanced 
                size="lg"
                placeholder={
                  selectedType === 'pregnant' 
                    ? "임신 정보, 병원, 검사 검색..." 
                    : selectedType === 'newMom'
                    ? "신생아 케어, 수유, 수면 정보..."
                    : selectedType === 'growingMom'
                    ? "이유식, 발달, 놀이 정보..."
                    : "육아 정보, 병원, 전문가 검색..."
                }
                className="max-w-lg"
              />
            </div>
          )}

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 max-w-lg sm:max-w-none mx-auto">
            <Link href={
              selectedType === 'pregnant' ? '/pregnancy' : 
              selectedType === 'newMom' ? '/newborn' : 
              selectedType === 'growingMom' ? '/development' : 
              selectedType === 'experienced' ? '/community' : 
              '/community'
            } className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-gray-900 hover:bg-white/90 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-h-[48px]"
              >
                <div className="flex items-center justify-center space-x-2">
                  {content.ctaIcon}
                  <span>{content.cta}</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/community" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 min-h-[48px]"
              >
                커뮤니티 둘러보기
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-white/60 text-sm mb-6">5,000+ 개발자들이 신뢰하는 플랫폼</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {['네이버', '카카오', '쿠팡', '토스', '당근마켓'].map((company) => (
              <div key={company} className="text-white font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}