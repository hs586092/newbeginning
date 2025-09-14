/**
 * 통합 오른쪽 사이드바 컴포넌트
 * 로그인 상태에 관계없이 일관된 정보 제공
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  Heart, 
  TrendingUp,
  Star,
  Award,
  Calendar,
  Target,
  Sparkles,
  Crown,
  Gift,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UnifiedRightSidebarProps {
  isAuthenticated: boolean
  user?: SupabaseUser | null
  className?: string
}

// 커뮤니티 통계 데이터
const STATS_DATA = [
  { 
    icon: Users, 
    label: '활성 회원', 
    value: '12,500+', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100' 
  },
  { 
    icon: MessageCircle, 
    label: '총 게시글', 
    value: '8,230+', 
    color: 'text-green-600',
    bgColor: 'bg-green-100' 
  },
  { 
    icon: Heart, 
    label: '오늘 댓글', 
    value: '340+', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100' 
  },
  { 
    icon: TrendingUp, 
    label: '주간 좋아요', 
    value: '1,820+', 
    color: 'text-pink-600',
    bgColor: 'bg-pink-100' 
  }
]

// 추천 기능 데이터 (비로그인용)
const FEATURED_BENEFITS = [
  {
    icon: Calendar,
    title: '주차별 맞춤 정보',
    description: '정확도 95% 의료진 검수',
    highlight: true
  },
  {
    icon: Users,
    title: '실시간 커뮤니티',
    description: '24시간 언제든 소통'
  },
  {
    icon: Award,
    title: '전문의 상담',
    description: '평균 답변시간 2시간'
  },
  {
    icon: Target,
    title: '성장 기록',
    description: 'AI 기반 발달 분석'
  }
]

// 인기 주제 데이터
const TRENDING_TOPICS = [
  { tag: '신생아케어', count: 245, color: 'bg-blue-100 text-blue-700' },
  { tag: '이유식시작', count: 189, color: 'bg-green-100 text-green-700' },
  { tag: '수면패턴', count: 156, color: 'bg-purple-100 text-purple-700' },
  { tag: '예방접종', count: 134, color: 'bg-orange-100 text-orange-700' },
  { tag: '육아용품', count: 98, color: 'bg-pink-100 text-pink-700' }
]

// 사용자 후기 데이터
const USER_TESTIMONIALS = [
  {
    text: "첫 아이라 모든게 걱정이었는데, 여기서 많은 도움을 받았어요.",
    author: "29주차 예비맘 김○○님",
    rating: 5
  },
  {
    text: "같은 월령 아기 키우는 맘들과 이야기하니 마음이 든든해졌어요.",
    author: "6개월 아기맘 이○○님", 
    rating: 5
  }
]

export function UnifiedRightSidebar({ 
  isAuthenticated, 
  user, 
  className 
}: UnifiedRightSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    // 후기 자동 로테이션
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % USER_TESTIMONIALS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <aside className={cn("w-full space-y-4", className)}>
      {isAuthenticated ? (
        /* 로그인 상태: 커뮤니티 통계 + 추천 */
        <>
          {/* 커뮤니티 통계 */}
          <Card variant="gradient" className="overflow-hidden">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                커뮤니티 현황
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {STATS_DATA.map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className={cn("w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2", stat.bgColor)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div className={cn("text-lg font-bold", stat.color)}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 인기 주제 */}
          <Card variant="interactive">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-600" />
                인기 주제
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {TRENDING_TOPICS.map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <span className="text-sm text-gray-700">#{topic.tag}</span>
                    <Badge variant="secondary" className={topic.color}>
                      {topic.count}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                더 많은 주제 보기
              </Button>
            </CardContent>
          </Card>

          {/* 프리미엄 혜택 */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex justify-center items-center mb-2">
                  <Crown className="w-6 h-6 text-yellow-600 mr-1" />
                  <Gift className="w-5 h-5 text-orange-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">특별 혜택</h4>
                <p className="text-xs text-gray-600 mb-3">
                  이번 주 한정! 프리미엄 50% 할인
                </p>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <Zap className="w-3 h-3 mr-1 text-yellow-600" />
                    <span>전문의 무제한 상담</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Target className="w-3 h-3 mr-1 text-orange-600" />
                    <span>맞춤 발달 가이드</span>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  7일 무료 체험
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* 비로그인 상태: 기능 소개 + CTA */
        <>
          {/* 주요 기능 소개 */}
          <Card variant="gradient" className="overflow-hidden">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                주요 기능
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {FEATURED_BENEFITS.map((benefit, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg transition-colors",
                      benefit.highlight 
                        ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      benefit.highlight 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                        : "bg-gray-100"
                    )}>
                      <benefit.icon className={cn(
                        "w-4 h-4",
                        benefit.highlight ? "text-white" : "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm mb-1">
                        {benefit.title}
                        {benefit.highlight && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-700">
                            인기
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {benefit.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 사용자 후기 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">4.9/5.0</span>
                </div>
                <p className="text-gray-700 text-sm mb-3 italic leading-relaxed">
                  &ldquo;{USER_TESTIMONIALS[currentTestimonial].text}&rdquo;
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  - {USER_TESTIMONIALS[currentTestimonial].author}
                </div>
                <div className="flex justify-center space-x-1">
                  {USER_TESTIMONIALS.map((_, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentTestimonial ? "bg-blue-500" : "bg-blue-200"
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 빠른 가입 CTA */}
          <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  지금 바로 시작! 🚀
                </h3>
                <p className="text-pink-100 text-sm mb-4">
                  2분만에 가입하고 소중한 양육 여정을 함께해요
                </p>
                <Link href="/signup" className="block">
                  <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold mb-2">
                    무료 회원가입
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-pink-100 hover:bg-white/10"
                  >
                    이미 회원이신가요?
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </aside>
  )
}

export default UnifiedRightSidebar