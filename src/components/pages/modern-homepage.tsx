'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageCircle,
  Users,
  Sparkles,
  Baby,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Globe,
  Shield,
  Zap
} from 'lucide-react'

interface ModernHomepageProps {
  searchParams: { [key: string]: string | undefined }
}

export function ModernHomepage({ searchParams }: ModernHomepageProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 animate-pulse" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">전 세계 부모들과 함께하는 커뮤니티</span>
              <Badge variant="secondary" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none">NEW</Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                ParentWise
              </span>
              <br />
              <span className="text-gray-800">육아의 모든 순간</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              임신부터 육아까지, 전 세계 부모들과 경험을 나누고
              <br className="hidden md:block" />
              <span className="text-purple-700 font-semibold">AI 기반 맞춤 조언</span>으로 함께 성장해요 ✨
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <div className="flex gap-4">
                  <Link href="/community">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      커뮤니티 보기
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/write">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg"
                    >
                      <Baby className="w-5 h-5 mr-2" />
                      경험 공유하기
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
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
                      className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      둘러보기
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-center">
              <div className="bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                <div className="text-2xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600">활성 부모들</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                <div className="text-2xl font-bold text-gray-900">50,000+</div>
                <div className="text-sm text-gray-600">공유된 경험</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">실시간 지원</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-purple-200 text-purple-700">
              주요 기능
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              왜 <span className="text-purple-600">ParentWise</span>를 선택할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI 기술과 전 세계 부모들의 경험이 만나 최고의 육아 지원을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">개인 맞춤 조언</h3>
              <p className="text-gray-600 leading-relaxed">
                아기의 월령과 발달 단계에 맞는 전문적인 조언을 AI가 실시간으로 제공합니다.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">글로벌 커뮤니티</h3>
              <p className="text-gray-600 leading-relaxed">
                전 세계 부모들과 소통하며 다양한 육아 문화와 경험을 나눌 수 있습니다.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">안전한 환경</h3>
              <p className="text-gray-600 leading-relaxed">
                전문가 검증을 거친 정보만 제공하며, 안전하고 신뢰할 수 있는 소통 공간입니다.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-orange-50 to-red-50">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 알림</h3>
              <p className="text-gray-600 leading-relaxed">
                중요한 육아 정보와 커뮤니티 소식을 실시간으로 받아보세요.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">성장 추적</h3>
              <p className="text-gray-600 leading-relaxed">
                아기의 성장 과정을 체계적으로 기록하고 분석할 수 있습니다.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-indigo-50 to-blue-50">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">전문가 지원</h3>
              <p className="text-gray-600 leading-relaxed">
                소아과 의사, 육아 전문가들의 검증된 조언을 언제든 받아볼 수 있습니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-purple-200 text-purple-700">
              후기
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              부모들의 <span className="text-purple-600">진짜 후기</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "첫 아이 키우는 초보맘인데, 여기서 받은 조언들이 정말 실용적이었어요.
                특히 밤새 울던 아이 달래는 방법을 배워서 정말 도움되었습니다!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  김
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">김수민님</div>
                  <div className="text-sm text-gray-600">7개월 아기 엄마</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "전 세계 부모들과 소통할 수 있다는 게 너무 좋아요.
                다양한 육아 방식을 배우고 우리 가족에 맞는 방법을 찾을 수 있었어요."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                  박
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">박지영님</div>
                  <div className="text-sm text-gray-600">2세 쌍둥이 엄마</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "아빠로서 육아에 참여하고 싶었는데, 여기서 많은 아빠들과 소통하며
                좋은 아빠가 되는 방법을 배우고 있어요."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  이
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">이준호님</div>
                  <div className="text-sm text-gray-600">3세 아이 아빠</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-pink-100 mb-10 leading-relaxed">
            수만 명의 부모들이 이미 ParentWise와 함께 성장하고 있습니다.
            <br className="hidden md:block" />
            당신도 지금 바로 참여해보세요!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  무료 회원가입
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-8 text-pink-100 text-sm">
            ✨ 가입비 무료 · 언제든 탈퇴 가능 · 개인정보 보호
          </div>
        </div>
      </section>
    </div>
  )
}