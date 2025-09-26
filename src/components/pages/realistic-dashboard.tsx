'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/simple-auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Heart,
  MessageCircle,
  Users,
  Clock,
  Bookmark,
  TrendingUp,
  Bell,
  Edit3,
  Search,
  MoreHorizontal,
  Baby
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface RealisticDashboardProps {
  user?: SupabaseUser | null
  isAuthenticated?: boolean
  searchParams?: { [key: string]: string | undefined }
}

// 실제 사용자 데이터처럼 보이는 피드 데이터
const realFeedData = [
  {
    id: 1,
    author: {
      name: "윤서맘❤",
      avatar: "👩‍💼",
      badge: "11개월 맘",
      timeAgo: "방금 전"
    },
    content: "윤서가 드디어 혼자 서기 시작했어요!!! 😭😭 감동 ㅠㅠ 몇 초 정도만 서 있지만 그래도 너무 대견해요. 다들 언제 첫 발걸음 떼셨나요?",
    likes: 23,
    comments: 12,
    timeAgo: "2분 전",
    category: "성장발달",
    hasImage: true
  },
  {
    id: 2,
    author: {
      name: "쌍둥이엄마",
      avatar: "👱‍♀️",
      badge: "8개월 맘",
      timeAgo: "15분 전"
    },
    content: "쌍둥이 이유식 너무 힘들어요 ㅠㅠ 한 명은 잘 먹는데 다른 한 명은 거부해서... 혹시 비슷한 경험 있으신 분 조언 부탁드려요!",
    likes: 45,
    comments: 28,
    timeAgo: "15분 전",
    category: "이유식",
    isHot: true
  },
  {
    id: 3,
    author: {
      name: "행복한지우맘",
      avatar: "🤰",
      badge: "임신 32주",
      timeAgo: "1시간 전"
    },
    content: "출산 준비물 리스트 공유해요~ 첫째 때 경험으로 정말 필요한 것들만 정리했어요. 도움 되셨으면 좋겠네요!",
    likes: 89,
    comments: 34,
    timeAgo: "1시간 전",
    category: "출산준비",
    hasImage: true,
    isPinned: true
  },
  {
    id: 4,
    author: {
      name: "육아초보맘",
      avatar: "👩",
      badge: "신생아 맘",
      timeAgo: "3시간 전"
    },
    content: "2주된 아기인데 밤에 너무 안 자서 체력이 한계에요... 언제쯤 밤잠을 잘까요? 다들 어떻게 버티셨나요 ㅜㅜ",
    likes: 67,
    comments: 52,
    timeAgo: "3시간 전",
    category: "신생아케어"
  },
  {
    id: 5,
    author: {
      name: "튼튼이아빠",
      avatar: "👨",
      badge: "15개월 아빠",
      timeAgo: "어제"
    },
    content: "아빠들도 육아 고민 많죠 ㅎㅎ 어린이집 보낼 때 울던 모습 보고 마음이 아파서... 적응 기간 어느 정도 걸리나요?",
    likes: 123,
    comments: 78,
    timeAgo: "어제",
    category: "어린이집"
  }
]

const sidebarData = {
  myStats: {
    posts: 12,
    comments: 45,
    likes: 189,
    followers: 23
  },
  quickActions: [
    { icon: Edit3, label: "새 글 쓰기", href: "/write", color: "text-blue-600" },
    { icon: Bookmark, label: "북마크한 글", href: "/bookmarks", color: "text-yellow-600" },
    { icon: Bell, label: "알림", href: "/notifications", color: "text-red-600", badge: 3 },
    { icon: Users, label: "내 댓글", href: "/my-comments", color: "text-green-600" }
  ],
  recentActivity: [
    { action: "댓글", target: "\"밤잠 교육 방법 문의\"", time: "10분 전" },
    { action: "좋아요", target: "\"이유식 레시피 공유\"", time: "1시간 전" },
    { action: "글 작성", target: "\"기저귀 추천 부탁해요\"", time: "2시간 전" }
  ]
}

export function RealisticDashboard({ user, isAuthenticated, searchParams }: RealisticDashboardProps) {
  const { profile } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('전체')

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

  const filters = ['전체', '육아고민', '이유식', '제품추천', '놀이교육', '건강정보']
  const username = profile?.username || user?.email?.split('@')[0] || '육아맘'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">내 피드</h2>
              </div>
              <span className="text-sm text-gray-500 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                온라인 중
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="피드 검색..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500"
                />
              </div>
              <Link href="/write">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Edit3 className="w-4 h-4 mr-2" />
                  글쓰기
                </Button>
              </Link>
            </div>
          </div>

          {/* 필터 탭 */}
          <div className="flex gap-1 overflow-x-auto pb-1 mt-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 피드 */}
          <div className="lg:col-span-3">
            {/* 웰컴 카드 */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    👋
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      안녕하세요, {username}님!
                    </h3>
                    <p className="text-gray-600">
                      오늘도 육아 여정에서 함께해요. 새로운 소식이 12개 있어요!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 피드 게시글 */}
            <div className="space-y-4">
              {realFeedData.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{post.author.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">{post.author.name}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {post.author.badge}
                          </span>
                          <span className="text-xs text-gray-500">• {post.timeAgo}</span>
                          {post.isPinned && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              📌 고정됨
                            </span>
                          )}
                          {post.isHot && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              🔥 HOT
                            </span>
                          )}
                        </div>

                        <div className="mb-2">
                          <span className="text-xs text-blue-600 font-medium">
                            #{post.category}
                          </span>
                        </div>

                        <p className="text-gray-800 mb-4 leading-relaxed">
                          {post.content}
                        </p>

                        {post.hasImage && (
                          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-500">
                            📷 이미지가 포함된 게시글입니다
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            좋아요 {post.likes}
                          </button>
                          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            댓글 {post.comments}
                          </button>
                          <button className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                            <Bookmark className="w-4 h-4" />
                            북마크
                          </button>
                          <button className="ml-auto">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 더 보기 버튼 */}
            <div className="text-center mt-6">
              <Button variant="outline" className="w-full sm:w-auto">
                더 많은 게시글 보기
              </Button>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 내 활동 현황 */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 mb-3">📊 내 활동</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{sidebarData.myStats.posts}</div>
                    <div className="text-gray-600">내 글</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{sidebarData.myStats.comments}</div>
                    <div className="text-gray-600">댓글</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-pink-600">{sidebarData.myStats.likes}</div>
                    <div className="text-gray-600">받은 좋아요</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{sidebarData.myStats.followers}</div>
                    <div className="text-gray-600">팔로워</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 빠른 실행 */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 mb-3">⚡ 빠른 실행</h4>
                <div className="space-y-2">
                  {sidebarData.quickActions.map((action) => (
                    <Link key={action.label} href={action.href}>
                      <button className="w-full flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <action.icon className={`w-4 h-4 ${action.color}`} />
                          {action.label}
                        </div>
                        {action.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {action.badge}
                          </span>
                        )}
                      </button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 최근 활동 */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 mb-3">🕐 최근 활동</h4>
                <div className="space-y-3">
                  {sidebarData.recentActivity.map((activity, index) => (
                    <div key={index} className="text-sm">
                      <div className="text-gray-700">
                        <span className="font-medium text-blue-600">{activity.action}</span>
                        {' '}on {activity.target}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 추천 커뮤니티 */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-bold text-green-900 mb-2">🌱 추천 그룹</h4>
                <p className="text-sm text-green-800 mb-3">
                  비슷한 월령의 엄마들과 더 깊이 소통해보세요!
                </p>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  그룹 둘러보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}