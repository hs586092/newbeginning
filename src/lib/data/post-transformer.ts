/**
 * Post Data Transformation Layer
 * Converts database schema to UnifiedPost format for sustainable architecture
 */

import { ValidatedPost, validateAndCleanPosts } from '@/lib/types/post-validation'

// Database schema (actual Supabase structure)
export interface DatabasePost {
  id: string
  user_id: string
  title: string
  content: string
  author_name: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

// UnifiedPost interface (for component compatibility)
export interface UnifiedPost {
  id: string
  content: string
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  baby_month?: number
  images?: string[]
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

// Default category mapping for existing posts
const DEFAULT_CATEGORIES = {
  '1': { name: '육아고민', icon: '😰', color: '#ef4444' },
  '2': { name: '제품추천', icon: '🛒', color: '#10b981' },
  '3': { name: '이유식/육아정보', icon: '🍼', color: '#3b82f6' },
  '4': { name: '놀이/교육', icon: '🎨', color: '#f59e0b' },
  '5': { name: '신생아케어', icon: '👶', color: '#ec4899' },
}

/**
 * Transform database post to UnifiedPost format
 * Provides default values for missing fields while maintaining data integrity
 */
export function transformDatabasePost(dbPost: DatabasePost): UnifiedPost {
  // Determine category based on content analysis or use default
  let categoryId = '1' // Default to '육아고민'
  let categoryData = DEFAULT_CATEGORIES[categoryId]

  // Simple content-based category detection
  const content = (dbPost.content || '').toLowerCase()
  if (content.includes('추천') || content.includes('제품') || content.includes('브랜드')) {
    categoryId = '2'
    categoryData = DEFAULT_CATEGORIES[categoryId]
  } else if (content.includes('이유식') || content.includes('정보') || content.includes('꿀팁')) {
    categoryId = '3'
    categoryData = DEFAULT_CATEGORIES[categoryId]
  } else if (content.includes('놀이') || content.includes('교육') || content.includes('어린이집')) {
    categoryId = '4'
    categoryData = DEFAULT_CATEGORIES[categoryId]
  } else if (content.includes('신생아') || content.includes('목욕') || content.includes('케어')) {
    categoryId = '5'
    categoryData = DEFAULT_CATEGORIES[categoryId]
  }

  // Calculate approximate baby age from content or use random for demo
  let babyMonth: number | undefined
  const monthMatch = content.match(/(\d+)개월/)
  if (monthMatch) {
    babyMonth = parseInt(monthMatch[1])
  } else if (content.includes('신생아')) {
    babyMonth = 0
  } else {
    // Assign random month for existing posts (1-24 months)
    babyMonth = Math.floor(Math.random() * 24) + 1
  }

  return {
    id: dbPost.id,
    content: dbPost.content || '',
    category_id: categoryId,
    category_name: categoryData.name,
    category_icon: categoryData.icon,
    category_color: categoryData.color,
    baby_month: babyMonth,
    hugs: Math.floor(Math.random() * 100), // Random for demo, will be replaced with actual data
    views: Math.floor(Math.random() * 300), // Random for demo, will be replaced with actual data
    is_question: (dbPost.content || '').includes('?') || (dbPost.title || '').includes('?'),
    created_at: dbPost.created_at,
    author: {
      id: dbPost.user_id,
      username: dbPost.author_name || '익명',
      avatar_url: undefined, // Will be populated when user profiles are available
      baby_birth_date: undefined, // Will be populated when user profiles are available
      is_pregnant: false, // Default value
      pregnancy_week: undefined
    },
    is_hugged_by_me: false, // Default for non-authenticated users
    is_bookmarked_by_me: false, // Default for non-authenticated users
    comments_count: Math.floor(Math.random() * 50) // Random for demo, will be replaced with actual data
  }
}

/**
 * Transform array of database posts to UnifiedPost array
 * Includes validation and error handling for production reliability
 */
export function transformDatabasePosts(dbPosts: DatabasePost[]): UnifiedPost[] {
  try {
    console.log(`🔄 Transforming ${dbPosts.length} database posts...`)

    // Validate raw data first
    const validatedPosts = validateAndCleanPosts(dbPosts)

    // Transform each valid post
    const transformedPosts = validatedPosts.map(post => {
      try {
        return transformDatabasePost(post as DatabasePost)
      } catch (error) {
        console.error('🚨 Post transformation error:', {
          postId: post.id,
          error: error instanceof Error ? error.message : error
        })
        return null
      }
    }).filter((post): post is UnifiedPost => post !== null)

    console.log(`✅ Successfully transformed ${transformedPosts.length} posts`)
    return transformedPosts

  } catch (error) {
    console.error('🚨 Database posts transformation failed:', error)
    return []
  }
}

/**
 * Get fallback posts when database is unavailable
 * Maintains app functionality during database issues
 */
export function getFallbackPosts(): UnifiedPost[] {
  console.log('🔄 Using fallback posts due to database unavailability')

  const fallbackData: DatabasePost[] = [
    {
      id: 'fallback-1',
      user_id: 'fallback-user-1',
      title: '데이터베이스 연결 중',
      content: '데이터를 불러오는 중입니다. 잠시만 기다려주세요.',
      author_name: '시스템',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false
    }
  ]

  return transformDatabasePosts(fallbackData)
}