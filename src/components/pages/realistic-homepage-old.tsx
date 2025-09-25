'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { UnifiedFeed } from '@/components/feed/unified-feed'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Heart,
  MessageCircle,
  Users,
  Clock,
  Search,
  Bookmark,
  TrendingUp
} from 'lucide-react'
import { SearchBar } from '@/components/search/search-bar'

interface RealisticHomepageProps {
  searchParams: { [key: string]: string | undefined }
}

// UnifiedFeed 형식으로 변환된 게시글 데이터
const mockPosts = [
  {
    id: '1',
    content: "13개월 아기 밤잠이 너무 힘들어요 ㅠㅠ\n\n밤에 2-3시간마다 깨서 우는데 어쩌죠? 이유식도 잘 안먹고... 첫째라 모르겠네요",
    created_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(), // 32분 전
    author: {
      id: 'user-1',
      username: '새내기엄마23',
      avatar_url: null,
      is_pregnant: false,
      pregnancy_week: null,
      baby_birth_date: new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000).toISOString() // 13개월 전
    },
    category_id: 1,
    category_name: '육아고민',
    category_icon: '😰',
    baby_month: 13,
    hugs: 8,
    views: 156,
    is_hugged_by_me: false,
    is_bookmarked_by_me: false,
    comments_count: 24
  },
  {
    id: 2,
    title: "기저귀 추천 부탁드려요! (대형 사이즈)",
    content: "팸퍼스 쓰고 있는데 흡수력이 좀... 혹시 좋은 브랜드 있나요? 예산은 월 15만원 정도",
    author: "코니맘",
    time: "1시간 전",
    replies: 15,
    likes: 12,
    category: "제품추천"
  },
  {
    id: 3,
    title: "[공유] 아기 이유식 냉동보관 꿀팁!",
    content: "100일부터 지금 10개월까지 쭉 써온 방법이에요. 사진으로 정리해봤습니다~",
    author: "요리하는엄마",
    time: "3시간 전",
    replies: 41,
    likes: 89,
    category: "이유식/육아정보",
    isHot: true,
    hasImage: true
  },
  {
    id: 4,
    title: "오늘 첫 어린이집 적응... 울면서 떨어져서 마음이 ㅠㅠ",
    content: "25개월 둘째인데 첫째 때보다 더 힘드네요. 다들 어떻게 하셨나요?",
    author: "두아이엄마",
    time: "5시간 전",
    replies: 31,
    likes: 67,
    category: "육아고민"
  },
  {
    id: 5,
    title: "신생아 목욕 이렇게 하면 되나요? (초보맘 질문)",
    content: "태어난지 2주된 딸 목욕시키는데 너무 무서워요... 혹시 유튜브 좋은 영상 있나요?",
    author: "떨리는첫맘",
    time: "어제",
    replies: 18,
    likes: 23,
    category: "신생아케어"
  },
  {
    id: 6,
    title: "10개월 아기 손가락음식 레시피 공유해요!",
    content: "아기가 스스로 먹을 수 있는 핑거푸드 만들기 너무 고민되시죠? 저희 아기가 정말 좋아하는 바나나 팬케이크, 단호박 스틱 만드는 법 올려요!",
    author: "요리하는맘",
    time: "2시간 전",
    replies: 67,
    likes: 234,
    category: "이유식/육아정보",
    hasImage: true
  },
  {
    id: 7,
    title: "모유수유 중 감기약 복용해도 괜찮을까요?",
    content: "목감기가 심해져서 약을 먹고 싶은데 수유 중이라 고민이에요. 경험 있으신 분들 조언 부탁드려요. 병원에서는 괜찮다고 하는데 불안해서요...",
    author: "건강한맘",
    time: "5시간 전",
    replies: 89,
    likes: 156,
    category: "수유/모유"
  }
]

// 추가 게시글 데이터 (무한 스크롤용)
const additionalPosts = [
  {
    id: 8,
    title: "첫돌 케이크 어디서 주문하셨나요?",
    content: "다음달이 첫돌인데 케이크를 어디서 주문해야 할지 고민이에요. 아기용 케이크 추천 부탁드려요!",
    author: "돌잔치준비맘",
    time: "6시간 전",
    replies: 34,
    likes: 78,
    category: "돌잔치준비"
  },
  {
    id: 9,
    title: "8개월 아기 변비 어떻게 해결하셨나요?",
    content: "이유식 시작하고 나서 변비가 심해졌어요. 3일째 변을 못봐서 걱정이에요 ㅠㅠ",
    author: "걱정맘",
    time: "7시간 전",
    replies: 42,
    likes: 23,
    category: "건강관리",
    isUrgent: true
  },
  {
    id: 10,
    title: "[후기] 아기띠 추천 - 에르고베이비 vs 만다리나덕",
    content: "두 제품 다 써본 후기 올려요. 각각 장단점이 있더라구요. 상세 비교 후기입니다!",
    author: "비교맘",
    time: "8시간 전",
    replies: 67,
    likes: 145,
    category: "제품추천",
    hasImage: true
  },
  {
    id: 11,
    title: "신생아 수면패턴 언제 자리잡나요?",
    content: "태어난지 3주된 아기인데 밤낮이 바뀐 것 같아요. 언제쯤 패턴이 잡힐까요?",
    author: "신규맘",
    time: "10시간 전",
    replies: 28,
    likes: 15,
    category: "신생아케어"
  },
  {
    id: 12,
    title: "육아휴직 복직 앞두고 불안해요",
    content: "12개월 육아휴직 끝나고 다음주 복직인데 아기 맡기기가 너무 걱정되네요. 다들 어떻게 극복하셨나요?",
    author: "복직앞둔맘",
    time: "12시간 전",
    replies: 89,
    likes: 234,
    category: "육아고민",
    isHot: true
  }
]

const hotTopics = [
  "아기 수족구 증상",
  "이유식 거부",
  "밤잠 교육",
  "기저귀 발진",
  "어린이집 적응",
  "돌잔치 준비",
  "육아휴직 복직",
  "모유수유 노하우"
]

export function RealisticHomepage({ searchParams }: RealisticHomepageProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('전체')
  const [displayedPosts, setDisplayedPosts] = useState(realPosts)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAuthRequired = (action: string) => {
    if (!isAuthenticated) {
      toast.error(`${action}을 위해 로그인이 필요합니다.`)
      router.push('/login')
      return false
    }
    return true
  }

  const handleLike = (postId: number) => {
    if (handleAuthRequired('좋아요')) {
      toast.success('좋아요를 눌렀습니다!')
    }
  }

  const handleComment = (postId: number) => {
    if (handleAuthRequired('댓글 작성')) {
      // 게시글 상세 페이지로 이동하거나 댓글 작성 모달 열기
      router.push(`/post/${postId}`)
    }
  }

  const handleBookmark = (postId: number) => {
    if (handleAuthRequired('북마크')) {
      toast.success('북마크에 저장되었습니다!')
    }
  }

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMorePosts) return

    setIsLoadingMore(true)

    // 실제 API 호출을 시뮬레이션 (0.5초 지연)
    setTimeout(() => {
      const currentLength = displayedPosts.length
      const remainingPosts = [...additionalPosts].slice(currentLength - realPosts.length)

      if (remainingPosts.length === 0) {
        setHasMorePosts(false)
      } else {
        const newPosts = remainingPosts.slice(0, 3) // 한번에 3개씩 로드
        setDisplayedPosts(prev => [...prev, ...newPosts])

        if (currentLength - realPosts.length + newPosts.length >= additionalPosts.length) {
          setHasMorePosts(false)
        }
      }

      setIsLoadingMore(false)
    }, 500)
  }

  // 무한 스크롤 구현
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) {
        return
      }
      loadMorePosts()
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoadingMore, hasMorePosts, displayedPosts])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">로딩중...</p>
        </div>
      </div>
    )
  }

  const categories = ['전체', '육아고민', '제품추천', '이유식/육아정보', '신생아케어', '놀이/교육', '맘카페']

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 게시글 영역 */}
          <div className="lg:col-span-3">
            {/* 검색 기능 */}
            <div className="mb-6">
              <SearchBar
                totalPosts={realPosts.length}
                showFilters={true}
                className=""
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    인기 게시글
                  </h2>
                  <span className="text-sm text-gray-500">실시간 업데이트</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {displayedPosts.map((post) => (
                  <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isHot && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                              HOT
                            </span>
                          )}
                          <span className="text-xs text-blue-600 font-medium">
                            {post.category}
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
                          <button
                            onClick={() => handleComment(post.id)}
                            className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {post.replies}
                          </button>
                          <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </button>
                          <button
                            onClick={() => handleBookmark(post.id)}
                            className="flex items-center gap-1 hover:text-yellow-500 transition-colors cursor-pointer"
                          >
                            <Bookmark className="w-3 h-3" />
                            북마크
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 무한 스크롤 로딩 인디케이터 */}
              {isLoadingMore && (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">더 많은 게시글을 불러오는 중...</p>
                </div>
              )}

              {!hasMorePosts && !isLoadingMore && (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">모든 게시글을 확인했습니다!</p>
                  {!isAuthenticated && (
                    <Link href="/login" className="mt-2 inline-block">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        로그인하고 더 많은 콘텐츠 보기
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 인기 검색어 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                🔥 지금 뜨는 육아 키워드
              </h4>
              <div className="space-y-2">
                {hotTopics.slice(0, 8).map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                      {index + 1}. {topic}
                    </span>
                    {index < 3 && (
                      <span className="text-xs text-red-500 font-medium">HOT</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 커뮤니티 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2">👋 처음 오셨나요?</h4>
              <p className="text-sm text-blue-800 mb-3 leading-relaxed">
                첫돌까지는 초보엄마부터 베테랑맘까지 모든 육아맘들이 소통하는 공간이에요!
              </p>
              <Link href={isAuthenticated ? "/write" : "/login"}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {isAuthenticated ? "첫 글 써보기" : "로그인하고 시작하기"}
                </Button>
              </Link>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-bold text-gray-900 mb-3">📢 최근 활동</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">행복한엄마</span>님이 댓글을 남겼어요
                  <span className="text-xs text-gray-400 block">2분전</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">튼튼이맘</span>님이 새 글을 올렸어요
                  <span className="text-xs text-gray-400 block">15분전</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">웃는아이</span>님이 좋아요를 눌렀어요
                  <span className="text-xs text-gray-400 block">1시간전</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}