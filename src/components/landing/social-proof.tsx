'use client'

import { Star, Users, Building, TrendingUp, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: "김민수",
    role: "프론트엔드 개발자",
    company: "네이버",
    avatar: "KM",
    rating: 5,
    content: "3개월 동안 구직활동을 했는데, 여기서 딱 2주 만에 원하던 회사에 합격했어요. 맞춤 추천이 정말 정확해서 시간을 많이 절약했습니다.",
    highlight: "2주 만에 합격",
    tags: ["React", "TypeScript", "Next.js"]
  },
  {
    id: 2,
    name: "박지영",
    role: "인사팀장",
    company: "토스",
    avatar: "PJ",
    rating: 5,
    content: "개발자 채용이 이렇게 쉬울 줄 몰랐어요. 검증된 후보자들만 추천받아서 면접 진행이 훨씬 수월했습니다. 1주일 만에 팀에 딱 맞는 개발자를 찾았어요.",
    highlight: "1주일 만에 채용완료",
    tags: ["백엔드", "Node.js", "팀핏"]
  },
  {
    id: 3,
    name: "이현우",
    role: "백엔드 개발자",
    company: "카카오",
    avatar: "LH",
    rating: 5,
    content: "커뮤니티에서 시니어 개발자들의 조언을 듣고 커리어 방향을 잡을 수 있었어요. 덕분에 더 좋은 조건으로 이직에 성공했습니다.",
    highlight: "연봉 30% 상승",
    tags: ["Spring", "AWS", "커리어전환"]
  }
]

const COMPANY_LOGOS = [
  { name: "네이버", employees: "850+", logo: "N" },
  { name: "카카오", employees: "420+", logo: "K" },
  { name: "토스", employees: "280+", logo: "T" },
  { name: "쿠팡", employees: "190+", logo: "C" },
  { name: "당근마켓", employees: "150+", logo: "🥕" },
  { name: "라인", employees: "320+", logo: "L" }
]

const TRUST_METRICS = [
  {
    icon: <Users className="w-8 h-8 text-blue-600" />,
    value: "5,000+",
    label: "활성 사용자",
    description: "매월 새로운 기회를 찾는 개발자들"
  },
  {
    icon: <Building className="w-8 h-8 text-green-600" />,
    value: "500+",
    label: "파트너 기업",
    description: "스타트업부터 대기업까지"
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
    value: "85%",
    label: "매칭 성공률",
    description: "지난 6개월 평균 성과"
  },
  {
    icon: <Star className="w-8 h-8 text-orange-600" />,
    value: "4.8/5",
    label: "만족도 평점",
    description: "2,500+ 실제 이용자 평가"
  }
]

export function SocialProof() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Trust Metrics */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            개발자들이 신뢰하는 이유
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            실제 데이터로 증명되는 성과와 만족도
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_METRICS.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {metric.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {metric.value}
                </div>
                <div className="font-semibold text-gray-800 mb-1">
                  {metric.label}
                </div>
                <div className="text-sm text-gray-600">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Logos */}
        <div className="mb-16">
          <p className="text-center text-gray-600 mb-8">
            이미 많은 유명 기업들이 함께하고 있습니다
          </p>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
            {COMPANY_LOGOS.map((company, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-3 mx-auto group-hover:shadow-md transition-shadow duration-300">
                  <span className="text-2xl font-bold text-gray-700">
                    {company.logo}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {company.name}
                </div>
                <div className="text-xs text-gray-500">
                  {company.employees} 개발자
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              실제 이용자들의 생생한 후기
            </h3>
            <p className="text-xl text-gray-600">
              진짜 경험담을 들어보세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-blue-200" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                {/* Highlight */}
                <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {testimonial.highlight}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {testimonial.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-700 font-semibold">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              당신도 성공 스토리의 주인공이 되어보세요
            </h3>
            <p className="text-white/90 mb-6">
              매주 100+ 새로운 성공 사례가 만들어지고 있습니다
            </p>
            <div className="flex justify-center items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>실시간으로 업데이트되는 새로운 기회들</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}