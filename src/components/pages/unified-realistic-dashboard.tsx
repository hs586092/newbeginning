'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  Heart,
  MessageCircle,
  Users,
  Clock,
  Search,
  Bookmark,
  TrendingUp,
  Edit3,
  Bell,
  Plus
} from 'lucide-react'
import { SearchBar } from '@/components/search/search-bar'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UnifiedRealisticDashboardProps {
  user?: SupabaseUser | null
  isAuthenticated?: boolean
  searchParams?: { [key: string]: string | undefined }
}

// 로그인 후 개인화된 피드 데이터
const personalizedFeedData = [
  {
    id: 1,
    title: "📌 [공지] 첫돌까지 커뮤니티 운영정책 안내",
    content: "안전하고 건전한 커뮤니티 운영을 위한 가이드라인입니다. 서로 배려하며 소통해주세요!",
    author: "운영진",
    time: "1일 전",
    replies: 89,
    likes: 234,
    category: "공지사항",
    isPinned: true,
    isOfficial: true
  },
  {
    id: 2,
    title: "어제 첫 이유식 도전했는데 대박 성공! 🥕✨",
    content: "6개월 된 우리 아기 첫 당근 퓨레 도전했는데 완전 잘 먹어서 감동... 사진 보세요! 입 주변이 온통 주황색 ㅋㅋ",
    author: "당근맘❤",
    time: "3분 전",
    replies: 8,
    likes: 45,
    category: "이유식",
    hasImage: true,
    isHot: true
  },
  {
    id: 3,
    title: "혹시 9개월 아기 밤에 몇 번 깨시나요?",
    content: "우리 아기는 아직도 2-3시간마다 깨서 수유를 요구해요 ㅠㅠ 언제쯤 통잠을 잘까요? 다른 맘들은 어떠신지 궁금해요",
    author: "밤잠고민맘",
    time: "15분 전",
    replies: 23,
    likes: 67,
    category: "수면교육"
  },
  {
    id: 4,
    title: "[후기] 베이비페어 다녀온 후기 & 꿀정보 공유",
    content: "코엑스 베이비페어 다녀왔어요! 기저귀, 분유, 장난감 할인 정보랑 무료체험 정보 공유드려요~ 다음주까지 하니까 참고하세요!",
    author: "정보맘",
    time: "1시간 전",
    replies: 56,
    likes: 189,
    category: "정보공유",
    hasImage: true
  },
  {
    id: 5,
    title: "아기 열 38.5도... 응급실 가야할까요? 급함",
    content: "7개월 아기인데 갑자기 열이 나면서 칭얼대요. 해열제 먹였는데 안 떨어져서 걱정돼요. 경험 있으신 분들 조언 부탁드려요",
    author: "걱정많은신규맘",
    time: "2시간 전",
    replies: 34,
    likes: 12,
    category: "건강관리",
    isUrgent: true
  },
  {
    id: 6,
    title: "첫돌 준비 체크리스트 공유해요 📝",
    content: "다음달 첫돌인데 준비할게 너무 많아서 정리했어요! 돌잔치 준비하시는 맘들께 도움되길 바라요~",
    author: "곧첫돌맘",
    time: "5시간 전",
    replies: 78,
    likes: 156,
    category: "돌잔치준비",
    hasImage: true
  }
]

const sidebarQuickLinks = [
  { icon: Edit3, label: "글 쓰기", href: "/write", color: "text-blue-600", isMain: true },
  { icon: Bookmark, label: "북마크", href: "/bookmarks", color: "text-yellow-600" },
  { icon: Bell, label: "알림", href: "/notifications", color: "text-red-600", badge: 5 },
  { icon: Users, label: "내 활동", href: "/my-activity", color: "text-green-600" }
]

const hotTopics = [
  "신생아 수유텀",
  "이유식 거부 해결법",
  "어린이집 적응기간",
  "기저귀 발진 치료",
  "아기 감기 대처법",
  "유축기 추천",
  "육아휴직 복직준비",
  "아기 장난감 추천"
]

export function UnifiedRealisticDashboard({ user, isAuthenticated, searchParams }: UnifiedRealisticDashboardProps) {
  const { profile } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('전체')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">피드 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const categories = ['전체', '육아고민', '이유식', '제품추천', '놀이교육', '건강정보', '정보공유']
  const username = profile?.username || user?.email?.split('@')[0] || '육아맘'

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 피드 영역 - 랜딩페이지와 동일한 구조 */}
          <div className="lg:col-span-3">
            {/* 환영 인사 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👋</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    안녕하세요, {username}님!
                  </h2>
                  <p className="text-gray-600 text-sm">
                    오늘도 함께 육아해요. 새로운 이야기 12개가 기다리고 있어요!
                  </p>
                </div>
              </div>
            </div>

            {/* 검색 기능 */}
            <div className="mb-6">
              <SearchBar
                totalPosts={personalizedFeedData.length}
                showFilters={true}
                className=""
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    나를 위한 맞춤 피드
                  </h2>
                  <span className="text-sm text-gray-500">실시간 업데이트</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {personalizedFeedData.map((post) => (
                  <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                              📌 고정
                            </span>
                          )}
                          {post.isOfficial && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                              공식
                            </span>
                          )}
                          {post.isHot && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                              HOT
                            </span>
                          )}
                          {post.isUrgent && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                              🚨 긴급
                            </span>
                          )}
                          <span className="text-xs text-blue-600 font-medium">
                            #{post.category}
                          </span>
                          {post.hasImage && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              사진
                            </span>
                          )}
                        </div>

                        <h3 className="font-medium text-gray-900 mb-2 leading-tight">
                          {post.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{post.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.time}
                          </span>
                          <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-3 h-3" />
                            {post.replies}
                          </button>
                          <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
                            <Bookmark className="w-3 h-3" />
                            북마크
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  더 많은 게시글 보기
                </Button>
              </div>
            </div>
          </div>

          {/* 사이드바 - 랜딩페이지와 동일한 구조 */}
          <div className="space-y-6">
            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-bold text-gray-900 mb-3">⚡ 빠른 실행</h4>
              <div className="space-y-2">
                {sidebarQuickLinks.map((link) => (
                  <Link key={link.label} href={link.href}>
                    <button className={`w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ${
                      link.isMain ? 'bg-blue-50 border border-blue-200' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <link.icon className={`w-4 h-4 ${link.color}`} />
                        {link.label}
                      </div>
                      {link.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* 인기 검색어 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                🔥 실시간 인기 키워드
              </h4>
              <div className="space-y-2">
                {hotTopics.slice(0, 8).map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between py-1">
                    <button className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer text-left">
                      {index + 1}. {topic}
                    </button>
                    {index < 3 && (
                      <span className="text-xs text-red-500 font-medium">HOT</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 내 활동 요약 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-2">📊 나의 활동</h4>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">12</div>
                  <div className="text-green-800">내 글</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">45</div>
                  <div className="text-green-800">댓글</div>
                </div>
              </div>
              <Link href="/my-posts">
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  내 활동 보기
                </Button>
              </Link>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-bold text-gray-900 mb-3">🕐 최근 활동</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium text-blue-600">댓글</span> on "밤잠 교육 방법"
                  <span className="text-xs text-gray-400 block">10분전</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium text-red-600">좋아요</span> on "이유식 레시피"
                  <span className="text-xs text-gray-400 block">1시간전</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium text-green-600">글작성</span> "기저귀 추천"
                  <span className="text-xs text-gray-400 block">2시간전</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}