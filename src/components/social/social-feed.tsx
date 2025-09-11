'use client'

import { useState, useEffect } from 'react'
import { MoreVertical, Baby, Clock } from 'lucide-react'
import Image from 'next/image'
import { PostInteractionsV2 } from '@/components/posts/post-interactions-v2'
import { GlobalCommentSystem } from '@/components/comments/global-comment-system'

interface PostAuthor {
  id: string
  username: string
  avatar_url?: string
  baby_birth_date?: string
  baby_name?: string
  is_pregnant?: boolean
  pregnancy_week?: number
}

interface Post {
  id: string
  content: string
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  baby_month?: number
  images?: string[]
  poll?: {
    question: string
    options: Array<{
      text: string
      votes: number
    }>
  }
  hugs: number
  views: number
  is_question: boolean
  tags?: string[]
  mood?: string
  created_at: string
  author: PostAuthor
  is_hugged_by_me: boolean
  is_bookmarked_by_me: boolean
}

interface SocialFeedProps {
  selectedCategory?: string
  selectedBabyMonth?: number
  activeFilter?: string
  smartFilter?: string
  isLoading?: boolean
}

const CATEGORY_COLORS = {
  pregnancy: 'bg-violet-100 text-violet-700',    // accent 색상 
  newborn: 'bg-pink-100 text-pink-700',         // primary 색상
  infant: 'bg-blue-100 text-blue-700',          // secondary 색상
  babyfood: 'bg-blue-100 text-blue-700',        // secondary 색상
  sleep: 'bg-violet-100 text-violet-700',       // accent 색상
  health: 'bg-pink-100 text-pink-700',          // primary 색상
  daily: 'bg-gray-100 text-gray-700',           // neutral 색상
  emergency: 'bg-pink-100 text-pink-700'        // primary 색상
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const postTime = new Date(timestamp)
  const diff = now.getTime() - postTime.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  return `${days}일 전`
}

const getBabyAgeText = (author: PostAuthor) => {
  if (author.is_pregnant && author.pregnancy_week) {
    return `임신 ${author.pregnancy_week}주`
  }
  if (author.baby_birth_date) {
    const birthDate = new Date(author.baby_birth_date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birthDate.getTime())
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30))
    
    if (diffMonths === 0) {
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return `생후 ${diffDays}일`
    }
    return `생후 ${diffMonths}개월`
  }
  return null
}

export default function SocialFeed({ activeFilter, smartFilter, isLoading: filterLoading }: SocialFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])

  // Load posts data (try from database, fallback to mock data)
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        
        // Try to fetch from database first
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
          
        if (postsData && !error && postsData.length > 0) {
          // Transform database posts to match our Post interface
          const transformedPosts: Post[] = postsData.map((post: any) => ({
            id: post.id,
            content: post.content || post.title || '내용을 불러올 수 없습니다',
            category_id: post.category || 'community',
            category_name: post.category === 'community' ? '커뮤니티' : 
                           post.category === 'expecting' ? '예비양육자' :
                           post.category === 'newborn' ? '신생아 양육자' :
                           post.category === 'toddler' ? '성장기 양육자' :
                           post.category === 'expert' ? '선배 양육자' : '커뮤니티',
            category_icon: post.category === 'community' ? '💬' :
                          post.category === 'expecting' ? '🤰' :
                          post.category === 'newborn' ? '👶' :
                          post.category === 'toddler' ? '🧒' :
                          post.category === 'expert' ? '👩‍👧‍👦' : '📝',
            category_color: 'blue',
            hugs: 0,
            views: post.view_count || 0,
            is_question: false,
            created_at: post.created_at,
            author: {
              id: post.user_id,
              username: post.profiles?.username || post.author_name || '익명',
              avatar_url: post.profiles?.avatar_url
            },
            is_hugged_by_me: false,
            is_bookmarked_by_me: false
          }))
          
          setPosts(transformedPosts)
          setLoading(false)
          return
        }
        
        // If error occurred or no data found, continue to fallback
        if (error) {
          console.log('Supabase query error:', error)
        }
      } catch (error) {
        console.log('Database connection failed, using mock data:', error)
        // Continue to fallback mock data
      }
      
      // Fallback to mock data with category-specific content
      const mockPosts: Post[] = [
      // 예비양육자 카테고리
      {
        id: '1',
        content: '29주 정기검진 다녀왔어요~ 아기가 건강하게 잘 자라고 있다고 하네요 💕',
        category_id: 'pregnant',
        category_name: '예비양육자',
        category_icon: '🤰',
        category_color: 'purple',
        images: [],
        hugs: 156,
        views: 445,
        is_question: false,
        tags: ['임신', '검진', '예비양육자'],
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user1',
          username: '29주차양육준비자🤰',
          avatar_url: '/avatars/pregnant.jpg',
          is_pregnant: true,
          pregnancy_week: 29
        },
        is_hugged_by_me: false,
        is_bookmarked_by_me: false
      },
      {
        id: '2',
        content: '태교음악 추천해주세요! 클래식이 좋을까요? 아니면 자연의 소리가 좋을까요? 🎵',
        category_id: 'pregnant',
        category_name: '예비양육자',
        category_icon: '🤰',
        category_color: 'purple',
        images: [],
        hugs: 89,
        views: 234,
        is_question: true,
        tags: ['태교', '음악', '예비양육자'],
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user2',
          username: '첫임신24주💕',
          avatar_url: '/avatars/pregnant2.jpg',
          is_pregnant: true,
          pregnancy_week: 24
        },
        is_hugged_by_me: true,
        is_bookmarked_by_me: true
      },
      // 신생아 양육자 카테고리
      {
        id: '3',
        content: '첫 이유식 시작했는데 아기가 잘 안 먹어요 😭 다른 양육자분들은 어떻게 하셨나요?',
        category_id: 'newborn',
        category_name: '신생아 양육자',
        category_icon: '👶',
        category_color: 'pink',
        baby_month: 6,
        images: [],
        hugs: 124,
        views: 356,
        is_question: true,
        tags: ['이유식', '신생아', '수유'],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user3',
          username: '신생아양육자6개월🍼',
          avatar_url: '/avatars/mom1.jpg',
          baby_birth_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '도윤이'
        },
        is_hugged_by_me: false,
        is_bookmarked_by_me: false
      },
      {
        id: '4',
        content: '밤수유 언제까지 해야 할까요? 이제 10개월인데 아직도 밤에 2-3번 깨요 💤',
        category_id: 'newborn',
        category_name: '신생아 양육자',
        category_icon: '👶',
        category_color: 'pink',
        baby_month: 10,
        images: [],
        hugs: 67,
        views: 189,
        is_question: true,
        tags: ['수유', '밤수유', '신생아'],
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user4',
          username: '졸린양육자😴',
          avatar_url: '/avatars/mom2.jpg',
          baby_birth_date: new Date(Date.now() - 10 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '서준이'
        },
        is_hugged_by_me: true,
        is_bookmarked_by_me: false
      },
      // 성장기 양육자 카테고리
      {
        id: '5',
        content: '3살 아이 말 늦어서 걱정이에요. 언어치료 받아야 할까요? 조언 부탁드려요 🗣️',
        category_id: 'toddler',
        category_name: '성장기 양육자',
        category_icon: '🧒',
        category_color: 'blue',
        images: [],
        hugs: 203,
        views: 512,
        is_question: true,
        tags: ['언어발달', '성장기', '3세'],
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user5',
          username: '성장기양육자3세👦',
          avatar_url: '/avatars/mom3.jpg',
          baby_birth_date: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '민준이'
        },
        is_hugged_by_me: false,
        is_bookmarked_by_me: true
      },
      {
        id: '6',
        content: '유치원 적응 완료! 처음엔 울었는데 이제 친구들과 신나게 놀아요 🎉',
        category_id: 'toddler',
        category_name: '성장기 양육자',
        category_icon: '🧒',
        category_color: 'blue',
        images: [],
        hugs: 145,
        views: 298,
        is_question: false,
        mood: '행복',
        tags: ['유치원', '적응', '성장기'],
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user6',
          username: '유치원양육자5세🎒',
          avatar_url: '/avatars/mom4.jpg',
          baby_birth_date: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '지우'
        },
        is_hugged_by_me: true,
        is_bookmarked_by_me: false
      },
      // 선배 양육자 카테고리
      {
        id: '7',
        content: '둘째 육아 팁 공유해요! 첫째와는 정말 다르더라구요 👶👦 경험담 들려드릴게요',
        category_id: 'expert',
        category_name: '선배 양육자',
        category_icon: '👩‍👧‍👦',
        category_color: 'green',
        images: [],
        hugs: 234,
        views: 678,
        is_question: false,
        tags: ['둘째육아', '경험담', '선배양육자'],
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user7',
          username: '두아이양육자💪',
          avatar_url: '/avatars/expert1.jpg',
          baby_birth_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '첫째7세, 둘째2세'
        },
        is_hugged_by_me: false,
        is_bookmarked_by_me: true
      },
      {
        id: '8',
        content: '10년 육아 경험으로 말씀드리는 시기별 꿀팁들! 신생아부터 초등까지 정리해봤어요 📚',
        category_id: 'expert',
        category_name: '선배 양육자',
        category_icon: '👩‍👧‍👦',
        category_color: 'green',
        images: [],
        hugs: 567,
        views: 1234,
        is_question: false,
        tags: ['육아팁', '경험담', '선배양육자'],
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user8',
          username: '10년차베테랑양육자🏆',
          avatar_url: '/avatars/expert2.jpg',
          baby_birth_date: new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '초등3학년'
        },
        is_hugged_by_me: true,
        is_bookmarked_by_me: true
      }
    ]
    
      // Shorter timeout for better user experience
      setTimeout(() => {
        setPosts(mockPosts)
        setLoading(false)
      }, 500)
    }
    
    loadPosts()
  }, [])

  // 스마트 필터 적용 함수
  const applySmartFilter = (postsToFilter: Post[], filter?: string) => {
    if (!filter || filter === 'latest') {
      // 최신글: 생성 시간 기준 내림차순 (기본값)
      return [...postsToFilter].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    
    if (filter === 'popular') {
      // 인기글: 좋아요(hugs) + 조회수 기준 내림차순
      return [...postsToFilter].sort((a, b) => {
        const scoreA = a.hugs * 2 + Math.floor(a.views / 10) // hugs에 더 높은 가중치
        const scoreB = b.hugs * 2 + Math.floor(b.views / 10)
        return scoreB - scoreA
      })
    }
    
    if (filter === 'comments') {
      // 댓글많은글: 현재는 hugs를 기준으로 정렬 (댓글 수 데이터가 없으므로)
      // 실제로는 댓글 수를 기준으로 정렬해야 함
      return [...postsToFilter].sort((a, b) => b.hugs - a.hugs)
    }
    
    if (filter === 'expert') {
      // 전문가글: expert 카테고리 우선, 그 다음 hugs 높은 순
      return [...postsToFilter].sort((a, b) => {
        // expert 카테고리인 글을 우선 배치
        if (a.category_id === 'expert' && b.category_id !== 'expert') return -1
        if (a.category_id !== 'expert' && b.category_id === 'expert') return 1
        // 같은 카테고리면 hugs 기준으로 정렬
        return b.hugs - a.hugs
      })
    }
    
    return postsToFilter
  }

  // 카테고리 필터링 및 스마트 필터 적용 로직
  useEffect(() => {
    let filtered = posts
    
    // 1단계: 카테고리 필터 적용
    if (activeFilter && activeFilter !== 'all') {
      filtered = posts.filter(post => {
        // 카테고리 매핑
        const categoryMapping: { [key: string]: string } = {
          'pregnant': 'pregnant',
          'newborn': 'newborn', 
          'toddler': 'toddler',
          'expert': 'expert'
        }
        
        return post.category_id === categoryMapping[activeFilter] || 
               post.tags?.includes(activeFilter) ||
               post.tags?.some(tag => tag.includes(activeFilter))
      })
    }
    
    // 2단계: 스마트 필터 적용
    const finalFiltered = applySmartFilter(filtered, smartFilter)
    
    setFilteredPosts(finalFiltered)
  }, [posts, activeFilter, smartFilter])


  if (loading || filterLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state when no filtered posts found
  if (filteredPosts.length === 0 && !loading && !filterLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          해당 카테고리의 콘텐츠가 없습니다
        </h3>
        <p className="text-gray-500">
          다른 카테고리를 선택하거나 잠시 후 다시 확인해보세요.
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6">
      {filteredPosts.map(post => (
        <article key={post.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          {/* Post Header */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full flex items-center justify-center">
                <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{post.author.username}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mt-1 sm:mt-0 self-start ${CATEGORY_COLORS[post.category_id as keyof typeof CATEGORY_COLORS]}`}>
                    {post.category_icon} {post.category_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(post.created_at)}</span>
                  {getBabyAgeText(post.author) && (
                    <>
                      <span>•</span>
                      <span>{getBabyAgeText(post.author)}</span>
                    </>
                  )}
                  {post.baby_month && (
                    <>
                      <span>•</span>
                      <span>육아 {post.baby_month}개월</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] touch-manipulation">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </header>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-900 leading-relaxed text-sm sm:text-base">{post.content}</p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-1 gap-2 rounded-lg overflow-hidden">
                {post.images.map((image, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100">
                    <Image
                      src={image}
                      alt="게시글 이미지"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.jpg'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Actions */}
          <PostInteractionsV2 
            postId={post.id}
            initialLiked={post.is_hugged_by_me}
            initialBookmarked={post.is_bookmarked_by_me}
            likesCount={post.hugs}
            commentsCount={0}
            viewsCount={post.views}
            isLoggedIn={true}
          />
        </article>
      ))}
    </div>
    
    {/* Global Comment System Portal */}
    <GlobalCommentSystem currentUserId="anonymous" />
  </>
  )
}