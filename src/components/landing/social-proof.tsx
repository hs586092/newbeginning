'use client'

import { Star, Users, Building, TrendingUp, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: "김소아",
    role: "예비맘",
    company: "생후 3개월",
    avatar: "KS",
    rating: 5,
    content: "초보맘이라 너무 많은 게 궁금했는데, 여기서 꽤 많은 도움을 받았어요. 신생아 케어부터 수유까지 매일 겁나던 일들을 선배맘들이 친절하게 알려주셔서 많이 편해졌어요.",
    highlight: "육아 스트레스 80% 감소",
    tags: ["수유", "신생아케어", "초보맘"]
  },
  {
    id: 2,
    name: "박지은",
    role: "성장기맘",
    company: "둘째 아기 8개월",
    avatar: "PJ",
    rating: 5,
    content: "첫째와 달리 둘째는 이유식을 너무 안 먹어서 고민이 많았는데, 여기서 만난 선배맘들 덕분에 단계별로 차근차근 시도해서 결국 성공했어요! 같은 고민하는 엄마들에게 정말 도움이 되는 커뮤니티예요.",
    highlight: "이유식 성공 달성",
    tags: ["이유식", "편식개선", "둑째아이"]
  },
  {
    id: 3,
    name: "이미영",
    role: "선배맘",
    company: "세듸맘 (첫째 5세, 둘째 3세)",
    avatar: "LM",
    rating: 5,
    content: "초보맘일 때의 기억을 떠올리며 후배맘들에게 도움을 주고 싶어 가입했어요. 제 경험이 누군가에게 도움이 되고, 저도 다른 엄마들의 새로운 아이디어를 배울 수 있어서 보람있어요.",
    highlight: "경험 공유를 통한 성장",
    tags: ["뒤늹생활", "유치원", "멘토링"]
  }
]


const TRUST_METRICS = [
  {
    icon: <Users className="w-8 h-8 text-pink-600" />,
    value: "12,000+",
    label: "전체 맘버",
    description: "임신부터 첫돌까지 함께하는 엄마들"
  },
  {
    icon: <Building className="w-8 h-8 text-blue-600" />,
    value: "21개월",
    label: "완전한 여정",
    description: "임신부터 첫돌까지 모든 단계 지원"
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
    value: "94%",
    label: "도움이 되었어요",
    description: "지난 6개월 엄마들의 만족도"
  },
  {
    icon: <Star className="w-8 h-8 text-orange-600" />,
    value: "4.9/5",
    label: "커뮤니티 평점",
    description: "3,200+ 엄마들의 진심 평가"
  }
]

export function SocialProof() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Trust Metrics */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            엄마들이 신뢰하는 이유
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            진심 어린 마음으로 만든 따뜻한 커뮤니티
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


        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              엄마들의 진심 어린 후기
            </h3>
            <p className="text-xl text-gray-600">
              같은 길을 걸어온 선배맘들의 이야기
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
              당신도 행복한 엄마가 되어보세요
            </h3>
            <p className="text-white mb-6">
              매주 200+ 새로운 엄마들이 우리와 함께 여정을 시작하고 있습니다
            </p>
            <div className="flex justify-center items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>실시간으로 공유되는 엄마들의 소중한 경험들</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}