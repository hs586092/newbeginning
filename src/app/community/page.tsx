'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Heart, Users, TrendingUp, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UnifiedFeed } from '@/components/feed/unified-feed'
import CategoryFilter from '@/components/social/category-filter'
import PostForm from '@/components/social/post-form'
import { createClient } from '@/lib/supabase/client'

// 통합된 Post 타입 정의
interface UnifiedPost {
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
  author: {
    id: string
    username: string
    avatar_url?: string
    baby_birth_date?: string
    baby_name?: string
    is_pregnant?: boolean
    pregnancy_week?: number
  }
  is_hugged_by_me: boolean
  is_bookmarked_by_me: boolean
  comments_count?: number
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBabyMonth, setSelectedBabyMonth] = useState<number | undefined>()
  const [showPostForm, setShowPostForm] = useState(false)
  const [posts, setPosts] = useState<UnifiedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // 데이터 로딩 로직 (UnifiedHomepage와 동일)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)
          
        if (postsData && !error && postsData.length > 0) {
          // Transform database posts to match our Post interface
          const transformedPosts: UnifiedPost[] = postsData.map((post: any) => ({
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
            category_color: 'bg-blue-100',
            hugs: 0,
            views: post.view_count || 0,
            is_question: false,
            tags: [],
            created_at: post.created_at,
            author: {
              id: post.user_id,
              username: post.profiles?.username || post.author_name || '익명',
              avatar_url: post.profiles?.avatar_url
            },
            is_hugged_by_me: false,
            is_bookmarked_by_me: false,
            comments_count: 0
          }))
          
          setPosts(transformedPosts)
          setIsLoading(false)
          return
        }
        
        // Fallback to mock data if no database data
        console.log('Supabase query returned no data or error:', error)
      } catch (error) {
        console.log('Database connection failed, using mock data:', error)
      }
      
      // Fallback mock data with improved variety
      const mockPosts: UnifiedPost[] = [
        {
          id: '1',
          content: '4개월 아기 아빠입니다. 밤잠 수업할 때 정말이 어떻게 하고, 말을 최소화하라고 아기가 다시 잠들어요.',
          category_id: 'newborn',
          category_name: '신생아 양육자',
          category_icon: '👶',
          category_color: 'bg-pink-100',
          baby_month: 4,
          hugs: 67,
          views: 127,
          is_question: true,
          tags: ['신성아', '왕왕치'],
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user1',
            username: '재현파파',
            avatar_url: '/avatars/dad1.jpg'
          },
          is_hugged_by_me: false,
          is_bookmarked_by_me: false,
          comments_count: 0
        },
        {
          id: '2',
          content: '임신 6주부터 시작된 입덧으로 고생하고 있어요. 생강차와 비타민 B6가 도움이 된다고 하네요. 다른 예비맘들은 어떻게 극복하셨나요?',
          category_id: 'pregnancy',
          category_name: 'Pregnancy',
          category_icon: '🤰',
          category_color: 'bg-violet-100',
          hugs: 15,
          views: 89,
          is_question: true,
          tags: ['임신', '입덧', 'Pregnancy'],
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            username: '예비맘7주',
            avatar_url: '/avatars/mom1.jpg',
            is_pregnant: true,
            pregnancy_week: 7
          },
          is_hugged_by_me: false,
          is_bookmarked_by_me: false,
          comments_count: 0
        }
      ]
      
      setTimeout(() => {
        setPosts(mockPosts)
        setIsLoading(false)
      }, 500)
    }
    
    fetchPosts()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Users className="w-4 h-4 mr-2" />
            👶 대한민국 부모들의 커뮤니티
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
              육아 커뮤니티
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            임신부터 육아까지, 경험을 나누고 조언을 구하며 서로를 지지해 주세요.
          </p>
        </div>

        {/* Community Stats - Enhanced Magic Integration */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card variant="interactive" className="text-center group">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">2,847</div>
              <div className="text-sm font-medium text-gray-700">활동 중인 부모</div>
            </CardContent>
          </Card>
          
          <Card variant="interactive" className="text-center group">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">12,456</div>
              <div className="text-sm font-medium text-gray-700">공유된 이야기</div>
            </CardContent>
          </Card>
          
          <Card variant="interactive" className="text-center group">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">89,234</div>
              <div className="text-sm font-medium text-gray-700">따뜻한 마음</div>
            </CardContent>
          </Card>
          
          <Card variant="interactive" className="text-center group">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">94%</div>
              <div className="text-sm font-medium text-gray-700">만족도</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Category Filter */}
          <div className="lg:w-80">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            {/* Quick Actions - Premium Magic Style */}
            <Card variant="gradient" className="mb-6 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">✨ 빠른 작업</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowPostForm(true)}
                  className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  새 글 쓰기
                </Button>
                <Button 
                  onClick={() => setShowPostForm(true)}
                  variant="outline" 
                  className="w-full justify-start border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  질문하기
                </Button>
              </CardContent>
            </Card>

            {/* Baby Month Filter - Premium Style */}
            <Card variant="premium">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">아기 나이</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: undefined, label: '전체' },
                    { value: 0, label: '신생아' },
                    { value: 1, label: '1개월' },
                    { value: 3, label: '3개월' },
                    { value: 6, label: '6개월' },
                    { value: 9, label: '9개월' },
                    { value: 12, label: '12개월' }
                  ].map(month => (
                    <Button
                      key={month.value || 'all'}
                      onClick={() => setSelectedBabyMonth(month.value)}
                      variant={selectedBabyMonth === month.value ? 'default' : 'outline'}
                      size="sm"
                      className="text-sm"
                    >
                      {month.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Social Feed */}
          <div className="flex-1">
            <UnifiedFeed
              posts={posts}
              isLoading={isLoading}
              isAuthenticated={true}
              currentUserId="community_user"
              variant="dashboard"
              selectedCategory={selectedCategory === 'all' ? 'all' : selectedCategory}
              selectedBabyMonth={selectedBabyMonth}
              activeFilter="all"
              smartFilter="latest"
              showSearch={false}
              showAdvancedFilters={false}
            />
          </div>
        </div>
      </div>
      
      {/* Post Form Modal */}
      {showPostForm && (
        <PostForm
          onClose={() => setShowPostForm(false)}
          onSubmit={(postData) => {
            console.log('New post:', postData)
            // TODO: Submit to database
            setShowPostForm(false)
          }}
        />
      )}
    </div>
  )
}