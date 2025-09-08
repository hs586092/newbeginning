import { getEducationalPosts } from '@/lib/posts/actions'
import { PostList } from '@/components/posts/post-list'
import { getUser } from '@/lib/supabase/server'
import type { PostWithDetails } from '@/types/database.types'

// Category configurations with Korean labels and descriptions
const EDUCATIONAL_CATEGORIES = [
  {
    id: 'expecting',
    label: '예비맘',
    description: '임신 중 알아야 할 중요한 정보들',
    icon: '🤰',
    color: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'newborn', 
    label: '신생아맘',
    description: '0-6개월 신생아 육아 정보',
    icon: '👶',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'toddler',
    label: '성장기맘',
    description: '7개월-5세 성장기 육아 가이드',
    icon: '🧒',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'expert',
    label: '선배맘',
    description: '경험 많은 선배맘들의 노하우',
    icon: '👩‍👧‍👦',
    color: 'bg-orange-50 border-orange-200'
  }
] as const

interface EducationalPageProps {
  searchParams: {
    category?: string
    audience?: string
  }
}

async function getFilteredEducationalPosts(category?: string, audience?: string) {
  try {
    const result = await getEducationalPosts({
      category,
      target_audience: audience as any,
      featured_only: false,
      limit: 50
    })
    return result.posts as PostWithDetails[]
  } catch (error) {
    console.error('Failed to fetch educational posts:', error)
    return []
  }
}

export default async function EducationalPage({ searchParams }: EducationalPageProps) {
  const { user } = await getUser()
  const { category, audience } = searchParams
  
  const posts = await getFilteredEducationalPosts(category, audience)
  
  // Group posts by category for overview
  const postsByCategory = EDUCATIONAL_CATEGORIES.map(cat => ({
    ...cat,
    posts: posts.filter(post => post.category === cat.id),
    count: posts.filter(post => post.category === cat.id).length
  }))

  const selectedCategory = category ? EDUCATIONAL_CATEGORIES.find(c => c.id === category) : null
  const filteredPosts = category ? posts.filter(post => post.category === category) : posts

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 육아 정보 센터
          </h1>
          <p className="text-gray-600">
            전문가가 검증한 신뢰할 수 있는 육아 정보를 한곳에서 만나보세요
          </p>
        </div>

        {/* Audience Filter */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          <a 
            href="/educational" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !audience 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            전체
          </a>
          <a 
            href="/educational?audience=expecting_parents" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              audience === 'expecting_parents' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            예비 부모
          </a>
          <a 
            href="/educational?audience=new_parents" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              audience === 'new_parents' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            신생아 부모
          </a>
          <a 
            href="/educational?audience=toddler_parents" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              audience === 'toddler_parents' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            유아 부모
          </a>
        </div>

        {/* Category Selection or Overview */}
        {!selectedCategory ? (
          <>
            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {postsByCategory.map((category) => (
                <a 
                  key={category.id}
                  href={`/educational?category=${category.id}${audience ? `&audience=${audience}` : ''}`}
                  className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${category.color}`}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {category.label}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {category.description}
                  </p>
                  <div className="text-blue-600 text-sm font-medium">
                    {category.count}개의 글 →
                  </div>
                </a>
              ))}
            </div>

            {/* Featured Posts */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⭐ 추천 정보
              </h2>
              <PostList 
                posts={posts.filter(post => post.educational_metadata?.is_featured).slice(0, 6)}
                currentUserId={user?.id}
                emptyMessage="추천 정보가 없습니다."
              />
            </div>
          </>
        ) : (
          <>
            {/* Category Header */}
            <div className="mb-6">
              <a 
                href="/educational" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block"
              >
                ← 전체 카테고리로 돌아가기
              </a>
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-4">{selectedCategory.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory.label}
                </h2>
              </div>
              <p className="text-gray-600">
                {selectedCategory.description}
              </p>
            </div>
          </>
        )}

        {/* Posts List */}
        {(selectedCategory || (!selectedCategory && posts.length > 0)) && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedCategory ? `${selectedCategory.label} 정보` : '최신 정보'}
            </h2>
            <PostList 
              posts={filteredPosts}
              currentUserId={user?.id}
              emptyMessage={
                selectedCategory 
                  ? `${selectedCategory.label} 카테고리에 정보가 없습니다.`
                  : "아직 정보 컨텐츠가 없습니다."
              }
            />
          </div>
        )}

        {/* Empty State for All Categories */}
        {!selectedCategory && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              아직 정보 컨텐츠가 없습니다
            </h3>
            <p className="text-gray-600">
              전문가들이 준비한 유용한 정보들이 곧 업데이트될 예정입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}