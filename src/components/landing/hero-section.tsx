'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Briefcase, Users, TrendingUp, Star } from 'lucide-react'

type UserType = 'seeker' | 'recruiter' | 'community' | null

const HERO_CONTENT = {
  seeker: {
    headline: "당신의 꿈의 직장이 여기 있습니다",
    subtext: "5,000+ 개발자들이 선택한 신뢰할 수 있는 채용 플랫폼에서 완벽한 기회를 찾아보세요",
    cta: "내 조건에 맞는 채용공고 찾기",
    ctaIcon: <Briefcase className="w-5 h-5" />,
    bgGradient: "from-blue-600 to-purple-600",
    stats: { label: "성공 취업", value: "2,847명" }
  },
  recruiter: {
    headline: "최고의 개발 인재를 3일 만에 찾으세요",
    subtext: "평균 지원율 40% 높은 검증된 개발자 풀에서 우리 회사에 딱 맞는 인재를 만나보세요",
    cta: "인재 채용 시작하기",
    ctaIcon: <Users className="w-5 h-5" />,
    bgGradient: "from-emerald-600 to-teal-600",
    stats: { label: "평균 채용기간", value: "3일" }
  },
  community: {
    headline: "개발자들과 함께 성장하는 커뮤니티",
    subtext: "최신 기술 트렌드부터 실무 팁까지, 5,000+ 동료 개발자들과 지식을 나누고 함께 성장하세요",
    cta: "커뮤니티 둘러보기",
    ctaIcon: <TrendingUp className="w-5 h-5" />,
    bgGradient: "from-orange-600 to-pink-600",
    stats: { label: "월간 활동", value: "12,500+" }
  },
  default: {
    headline: "개발자 커리어의 새로운 시작",
    subtext: "구인구직부터 커뮤니티까지, 개발자 생태계의 모든 것을 한 곳에서 경험하세요",
    cta: "시작하기",
    ctaIcon: <ArrowRight className="w-5 h-5" />,
    bgGradient: "from-indigo-600 to-blue-600",
    stats: { label: "총 사용자", value: "5,000+" }
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
        <div className="flex justify-center mb-12">
          <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1">
            {[
              { key: 'seeker', label: '구직자', icon: <Briefcase className="w-4 h-4" /> },
              { key: 'recruiter', label: '채용담당자', icon: <Users className="w-4 h-4" /> },
              { key: 'community', label: '커뮤니티', icon: <TrendingUp className="w-4 h-4" /> }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleTypeSelect(key as UserType)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedType === key
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className={`text-center transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {content.headline}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
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

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={selectedType === 'community' ? '/community' : selectedType === 'recruiter' ? '/write' : '/jobs'}>
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  {content.ctaIcon}
                  <span>{content.cta}</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/community">
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300"
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