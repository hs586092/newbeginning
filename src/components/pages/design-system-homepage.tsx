'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageCircle,
  Users,
  Baby,
  Search,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  BookOpen,
  HelpCircle,
  Star,
  ChevronRight,
  Play,
  Smile
} from 'lucide-react'

interface DesignSystemHomepageProps {
  searchParams: { [key: string]: string | undefined }
}

export function DesignSystemHomepage({ searchParams }: DesignSystemHomepageProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">ParentWise 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-blue-50">
      {/* Hero Section - 사용자 중심 설계 */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: 메인 메시지 - 명확하고 직관적 */}
            <div>
              <Badge className="mb-6 bg-rose-100 text-rose-700 border-rose-200 px-4 py-2">
                🌟 전 세계 12,000+ 부모들과 함께
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-rose-600">육아</span>가 더 이상<br />
                <span className="text-blue-600">혼자</span>가 아니에요
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                임신부터 육아까지, 언제든 도움받을 수 있는 안전하고 따뜻한 커뮤니티입니다.
                <br className="hidden md:block" />
                <strong className="text-gray-900">24시간 언제든지 질문하고 답변받으세요.</strong>
              </p>

              {/* 즉시 액션 버튼들 - 사용자 니즈 기반 */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isAuthenticated ? (
                  <>
                    <Link href="/community">
                      <Button
                        size="lg"
                        className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        지금 질문하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/search">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        검색으로 찾기
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        size="lg"
                        className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        무료로 시작하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/community">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl"
                      >
                        <Users className="w-5 h-5 mr-2" />
                        둘러보기
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* 신뢰성 지표 - 간단하고 명확 */}
              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>전문가 검증</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>24시간 응답</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>평점 4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right: 실제 사용 예시 - 구체적이고 현실적 */}
            <div className="relative">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 p-6 rounded-2xl">
                <div className="mb-6">
                  <Badge className="bg-green-100 text-green-700 mb-3">실시간 질답</Badge>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">방금 전 질문</h3>
                </div>

                <div className="space-y-4">
                  {/* 질문 예시 */}
                  <div className="bg-rose-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold">김</div>
                      <div>
                        <div className="font-medium text-gray-900">김수민님</div>
                        <div className="text-sm text-gray-500">7개월 아기 엄마</div>
                      </div>
                    </div>
                    <p className="text-gray-800">"아기가 밤에 자꾸 깨요. 수면교육 어떻게 시작하면 좋을까요? 😭"</p>
                  </div>

                  {/* 답변 예시 */}
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">전</div>
                      <div>
                        <div className="font-medium text-gray-900">전문가 이수진</div>
                        <div className="text-sm text-gray-500">소아과 전문의</div>
                      </div>
                    </div>
                    <p className="text-gray-800 text-sm">
                      "7개월이면 수면패턴이 잡히기 시작하는 시기예요. 먼저 낮잠 시간을 조절해보시고...
                      <span className="text-blue-600 cursor-pointer hover:underline"> 더 보기</span>
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <div className="text-sm text-gray-500">💬 5분 만에 전문가 답변</div>
                  </div>
                </div>
              </Card>

              {/* 부가 요소들 */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full opacity-60 blur-xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-60 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 기능 - 사용자 니즈 우선 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 12,000명의 부모들이 선택했을까요?
            </h2>
            <p className="text-xl text-gray-600">실제로 도움이 되는 기능들만 모았습니다</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: HelpCircle,
                title: "즉시 질문하기",
                description: "궁금한 건 언제든지! 평균 5분 내 전문가나 경험자의 답변을 받아보세요.",
                action: "지금 질문하기",
                color: "from-rose-500 to-pink-500",
                bgColor: "bg-rose-50",
                link: isAuthenticated ? "/community" : "/login"
              },
              {
                icon: Search,
                title: "똑똑한 검색",
                description: "아기 월령, 증상, 상황별로 정확한 정보를 빠르게 찾을 수 있어요.",
                action: "검색해보기",
                color: "from-blue-500 to-indigo-500",
                bgColor: "bg-blue-50",
                link: "/search"
              },
              {
                icon: Users,
                title: "안전한 커뮤니티",
                description: "비슷한 상황의 부모들과 소통하며 서로 응원하고 정보를 나눠요.",
                action: "둘러보기",
                color: "from-emerald-500 to-green-500",
                bgColor: "bg-emerald-50",
                link: "/community"
              }
            ].map((feature, index) => (
              <Card key={index} className={`${feature.bgColor} border-0 p-8 hover:shadow-lg transition-all duration-300 group cursor-pointer`}>
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>

                <Link href={feature.link}>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900 p-0 font-semibold group-hover:translate-x-1 transition-transform"
                  >
                    {feature.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 실제 후기 - 신뢰성 있는 증거 */}
      <section className="py-16 px-4 bg-gradient-to-r from-rose-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              실제 부모들의 이야기
            </h2>
            <p className="text-xl text-gray-600">진짜 도움이 되었다는 후기들이에요</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "김수민",
                role: "7개월 아기 엄마",
                text: "밤잠 못 이뤄서 정말 힘들었는데, 여기서 받은 조언으로 아기가 통잠을 자기 시작했어요! 정말 감사해요.",
                rating: 5
              },
              {
                name: "박지영",
                role: "쌍둥이 엄마",
                text: "쌍둥이 키우기 너무 힘들어서 우울했는데, 비슷한 상황의 엄마들과 이야기하며 많은 위로를 받았어요.",
                rating: 5
              },
              {
                name: "이준호",
                role: "3세 아이 아빠",
                text: "아빠로서 어떻게 육아에 참여해야 할지 몰랐는데, 여기서 많은 아빠들의 경험을 들을 수 있어서 좋았어요.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{testimonial.rating}.0</span>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">"{testimonial.text}"</p>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 간단한 통계 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "12,000+", label: "활성 부모들" },
              { number: "45,000+", label: "해결된 질문들" },
              { number: "평균 5분", label: "답변 속도" },
              { number: "4.9/5", label: "만족도 평점" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 명확한 행동 유도 */}
      <section className="py-16 px-4 bg-gradient-to-r from-rose-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Baby className="w-16 h-16 mx-auto mb-6 opacity-90" />

          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            육아, 혼자 하지 마세요
          </h2>

          <p className="text-xl mb-10 leading-relaxed opacity-90">
            지금 바로 시작해서 12,000명의 부모들과 함께
            <br className="hidden md:block" />
            더 행복한 육아를 경험해보세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-white text-rose-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-xl shadow-lg"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    무료로 시작하기
                  </Button>
                </Link>
                <Link href="/community">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-bold rounded-xl"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    둘러보기
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 text-sm opacity-75">
            ✨ 100% 무료 • 광고 없음 • 안전한 커뮤니티
          </div>
        </div>
      </section>
    </div>
  )
}