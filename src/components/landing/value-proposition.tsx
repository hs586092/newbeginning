'use client'

import { Target, TrendingUp, Clock, Shield, Users } from 'lucide-react'

type UserType = 'pregnant' | 'newMom' | 'growingMom' | 'experienced' | null

const VALUE_PROPOSITIONS = {
  pregnant: [
    {
      icon: <Target className="w-8 h-8 text-pink-600" />,
      title: "주차별 맞춤 정보",
      description: "임신 주수에 맞는 검사 일정, 주의사항, 태아 발달 정보를 제공해드려요",
      benefit: "정보 정확도 95%",
      stats: "주차별 체크리스트 40개"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "전문의 상담",
      description: "산부인과 전문의와 직접 연결되어 궁금한 점을 바로 해결하세요",
      benefit: "24시간 상담 가능",
      stats: "평균 답변시간 2시간"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "예비맘 커뮤니티",
      description: "같은 예정일을 가진 예비맘들과 정보를 나누고 함께 성장하세요",
      benefit: "불안감 해소 80%",
      stats: "월 평균 소통 500건"
    }
  ],
  
  newMom: [
    {
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      title: "신생아 케어 가이드",
      description: "수유, 기저귀 갈기, 수면 패턴 등 신생아 케어의 모든 것을 단계별로 안내",
      benefit: "육아 스트레스 60% 감소",
      stats: "일일 케어 체크리스트 15개"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "응급상황 대처법",
      description: "신생아 응급상황 판단 기준과 대처법, 병원 방문 타이밍 안내",
      benefit: "안전한 육아 환경",
      stats: "응급처치 가이드 25개"
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: "신생아맘 네트워킹",
      description: "같은 시기 출산한 엄마들과 정보 공유하고 서로 응원하는 커뮤니티",
      benefit: "육아 고립감 해소",
      stats: "월 평균 정보 교환 300건"
    }
  ],

  growingMom: [
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "월령별 발달 정보",
      description: "4-12개월 아기의 신체, 인지, 언어 발달 단계와 놀이법 제공",
      benefit: "발달 이해도 90% 향상",
      stats: "월령별 발달 지표 120개"
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: "이유식 완전정복",
      description: "초기부터 완료기까지 단계별 이유식 레시피와 식재료 정보",
      benefit: "이유식 성공률 85%",
      stats: "월령별 레시피 150개"
    },
    {
      icon: <Target className="w-8 h-8 text-indigo-600" />,
      title: "육아용품 추천",
      description: "월령에 맞는 필수 육아용품과 장난감 추천으로 현명한 육아 소비",
      benefit: "육아비용 30% 절약",
      stats: "검증된 제품 리뷰 500개"
    }
  ],

  experienced: [
    {
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      title: "첫돌 준비 가이드",
      description: "돌잔치 준비부터 첫돌 이후 육아까지 경험이 풍부한 선배맘들의 조언",
      benefit: "완벽한 첫돌 준비",
      stats: "돌잔치 체크리스트 50개"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "육아 멘토링",
      description: "후배맘들에게 실전 육아 노하우를 전수하고 함께 성장하는 선순환",
      benefit: "멘토링 만족도 95%",
      stats: "월 평균 상담 200건"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "워킹맘 네트워크",
      description: "육아와 일의 균형을 찾는 워킹맘들의 경험 공유와 정보 교환",
      benefit: "워라밸 만족도 80% 향상",
      stats: "워킹맘 모임 월 30회"
    }
  ]
}

interface ValuePropositionProps {
  userType?: UserType
}

export function ValueProposition({ userType = null }: ValuePropositionProps) {
  const propositions = VALUE_PROPOSITIONS[userType || 'pregnant'] || VALUE_PROPOSITIONS.pregnant
  
  const getSectionTitle = (type: UserType) => {
    switch (type) {
      case 'pregnant':
        return {
          title: "왜 2,500+ 예비맘들이 선택했을까요?",
          subtitle: "임신부터 출산까지, 소중한 여정을 함께 걸어갑니다"
        }
      case 'newMom':
        return {
          title: "1,800+ 신생아맘들이 신뢰하는 케어 가이드",
          subtitle: "생애 첫 육아, 혼자가 아니에요. 든든한 동반자가 되어드릴게요"
        }
      case 'growingMom':
        return {
          title: "3,200+ 성장기맘들과 함께하는 발달 여정",
          subtitle: "우리 아기 성장하는 모든 순간이 특별하고 소중합니다"
        }
      case 'experienced':
        return {
          title: "4,500+ 선배맘들의 소중한 경험과 조언",
          subtitle: "첫돌까지의 완주, 이제 후배맘들에게 따뜻한 안내자가 되어주세요"
        }
      default:
        return {
          title: "임신부터 첫돌까지, 모든 순간을 함께",
          subtitle: "21개월의 소중한 여정을 혼자 걸어가지 마세요. 따뜻한 엄마들의 커뮤니티가 함께합니다"
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