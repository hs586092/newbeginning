'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Bookmark, MoreVertical, Baby, Clock } from 'lucide-react'
import Image from 'next/image'

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
}

const CATEGORY_COLORS = {
  pregnancy: 'bg-purple-100 text-purple-700',
  newborn: 'bg-pink-100 text-pink-700', 
  infant: 'bg-blue-100 text-blue-700',
  babyfood: 'bg-green-100 text-green-700',
  sleep: 'bg-indigo-100 text-indigo-700',
  health: 'bg-red-100 text-red-700',
  daily: 'bg-yellow-100 text-yellow-700',
  emergency: 'bg-red-100 text-red-700'
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

export default function SocialFeed({ selectedCategory, selectedBabyMonth }: SocialFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

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
          .select(`
            *,
            profiles!posts_user_id_fkey (
              username,
              avatar_url
            ),
            likes (id),
            comments (id)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
          
        if (postsData && !error && postsData.length > 0) {
          // Transform database posts to match our Post interface
          const transformedPosts: Post[] = postsData.map((post: any) => ({
            id: post.id,
            content: post.content || post.title || '내용을 불러올 수 없습니다',
            category_id: post.category || 'daily',
            category_name: post.category || '일상',
            category_icon: '📝',
            category_color: 'blue',
            hugs: post.likes?.length || 0,
            views: post.views || 0,
            is_question: post.category === 'job_seek',
            created_at: post.created_at,
            author: {
              id: post.user_id,
              username: post.profiles?.username || '익명',
              avatar_url: post.profiles?.avatar_url
            },
            is_hugged_by_me: false,
            is_bookmarked_by_me: false
          }))
          
          setPosts(transformedPosts)
          setLoading(false)
          return
        }
      } catch (error) {
        console.log('Database connection failed, using mock data')
      }
      
      // Fallback to mock data
      const mockPosts: Post[] = [
      {
        id: '1',
        content: '첫 이유식 시작했는데 아기가 잘 안 먹어요 😭 다른 엄마들은 어떻게 하셨나요?',
        category_id: 'babyfood',
        category_name: '이유식',
        category_icon: '🥄',
        category_color: 'green',
        baby_month: 6,
        images: [],
        hugs: 24,
        views: 156,
        is_question: true,
        tags: ['이유식시작', '초보맘'],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user1',
          username: '새내기엄마🥄',
          avatar_url: '/avatars/mom1.jpg',
          baby_birth_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '도윤이'
        },
        is_hugged_by_me: false,
        is_bookmarked_by_me: false
      },
      {
        id: '2', 
        content: '드디어 밤잠을 통잠으로 자기 시작했어요! 3개월 동안 정말 힘들었는데 드디어... 🥺✨',
        category_id: 'sleep',
        category_name: '수면',
        category_icon: '😴',
        category_color: 'indigo',
        baby_month: 3,
        images: ['/posts/sleeping-baby.jpg'],
        hugs: 89,
        views: 234,
        is_question: false,
        mood: '행복',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user2',
          username: '수면교육성공맘💤',
          avatar_url: '/avatars/mom2.jpg',
          baby_birth_date: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          baby_name: '서준이'
        },
        is_hugged_by_me: true,
        is_bookmarked_by_me: true
      },
      {
        id: '3',
        content: '29주 정기검진 다녀왔어요~ 아기가 건강하게 잘 자라고 있다고 하네요 💕',
        category_id: 'pregnancy',
        category_name: '임신',
        category_icon: '🤰',
        category_color: 'purple',
        images: ['/posts/ultrasound.jpg'],
        hugs: 156,
        views: 445,
        is_question: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user3',
          username: '예비맘29주🤰',
          avatar_url: '/avatars/pregnant.jpg',
          is_pregnant: true,
          pregnancy_week: 29
        },
        is_hugged_by_me: false,
        is_bookmarked_by_me: false
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

  const handleHug = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            is_hugged_by_me: !post.is_hugged_by_me,
            hugs: post.is_hugged_by_me ? post.hugs - 1 : post.hugs + 1
          }
        : post
    ))
  }

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, is_bookmarked_by_me: !post.is_bookmarked_by_me }
        : post
    ))
  }

  if (loading) {
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

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <article key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          {/* Post Header */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full flex items-center justify-center">
                <Baby className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{post.author.username}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category_id as keyof typeof CATEGORY_COLORS]}`}>
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
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </header>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-900 leading-relaxed">{post.content}</p>
            
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
          <footer className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleHug(post.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
                  post.is_hugged_by_me
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.is_hugged_by_me ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{post.hugs}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">댓글</span>
              </button>
              
              <button
                onClick={() => handleBookmark(post.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
                  post.is_bookmarked_by_me
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${post.is_bookmarked_by_me ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              조회 {post.views.toLocaleString()}
            </div>
          </footer>
        </article>
      ))}
    </div>
  )
}