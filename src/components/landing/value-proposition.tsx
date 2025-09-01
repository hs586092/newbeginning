'use client'

import { Target, DollarSign, TrendingUp, Clock, Shield, Users } from 'lucide-react'

type UserType = 'seeker' | 'recruiter' | 'community' | null

const VALUE_PROPOSITIONS = {
  seeker: [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "맞춤 AI 추천",
      description: "내 경력과 관심 기술에 딱 맞는 채용공고를 AI가 자동으로 선별해드려요",
      benefit: "시간 절약 90%",
      stats: "평균 3.2개 관련 공고 발견"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      title: "투명한 연봉 정보",
      description: "실제 연봉 범위와 복리혜택까지 상세하게 공개된 채용정보",
      benefit: "협상력 40% 향상",
      stats: "평균 연봉 상승률 23%"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: "성장 가능성 분석",
      description: "회사의 기술 스택, 문화, 성장성까지 종합적으로 분석해드려요",
      benefit: "만족도 95%",
      stats: "1년 후 재직률 87%"
    }
  ],
  
  recruiter: [
    {
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      title: "3일 내 빠른 채용",
      description: "검증된 개발자 풀에서 우리 조건에 맞는 후보자를 빠르게 매칭",
      benefit: "채용 기간 70% 단축",
      stats: "평균 3일 내 첫 면접"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "검증된 인재 풀",
      description: "코딩 테스트와 포트폴리오 검증을 거친 신뢰할 수 있는 개발자들",
      benefit: "채용 성공률 85%",
      stats: "90% 이상 1년 이상 근속"
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: "전담 컨설팅",
      description: "채용 전문가가 채용 전략부터 온보딩까지 전 과정을 지원",
      benefit: "만족도 92%",
      stats: "재이용률 78%"
    }
  ],

  community: [
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "최신 기술 트렌드",
      description: "업계 선배들이 공유하는 생생한 기술 트렌드와 실무 인사이트",
      benefit: "학습 효율 2배 향상",
      stats: "월 평균 150+ 기술 포스팅"
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: "활발한 네트워킹",
      description: "같은 관심사를 가진 개발자들과 프로젝트, 스터디 그룹 형성",
      benefit: "인맥 확장 300%",
      stats: "월 평균 50+ 모임 성사"
    },
    {
      icon: <Target className="w-8 h-8 text-indigo-600" />,
      title: "커리어 멘토링",
      description: "시니어 개발자들의 커리어 조언과 개인 맞춤형 성장 가이드",
      benefit: "성장 속도 2.5배",
      stats: "평균 승진 기간 1.2년 단축"
    }
  ]
}

interface ValuePropositionProps {
  userType?: UserType
}

export function ValueProposition({ userType = 'seeker' }: ValuePropositionProps) {
  const propositions = VALUE_PROPOSITIONS[userType || 'seeker']
  
  const getSectionTitle = (type: UserType) => {
    switch (type) {
      case 'seeker':
        return {
          title: "왜 5,000+ 개발자들이 선택했을까요?",
          subtitle: "당신의 커리어 성장을 위한 모든 것이 준비되어 있습니다"
        }
      case 'recruiter':
        return {
          title: "500+ 기업이 신뢰하는 채용 솔루션",
          subtitle: "최고의 개발자를 가장 효율적으로 채용하는 방법"
        }
      case 'community':
        return {
          title: "함께 성장하는 개발자 커뮤니티",
          subtitle: "혼자 공부하지 마세요. 동료와 함께 더 빠르게 성장하세요"
        }
      default:
        return {
          title: "개발자 생태계의 모든 것",
          subtitle: "구인구직부터 커뮤니티까지, 한 곳에서 해결하세요"
        }
    }
  }

  const sectionContent = getSectionTitle(userType)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {sectionContent.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {propositions.map((prop, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {prop.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {prop.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {prop.description}
                </p>

                {/* Benefits */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">
                      {prop.benefit}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{prop.stats}</span>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-6">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 delay-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>실시간으로 업데이트되는 데이터 기반 서비스</span>
          </div>
        </div>
      </div>
    </section>
  )
}