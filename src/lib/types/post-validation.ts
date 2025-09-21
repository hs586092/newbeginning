/**
 * Post data validation utilities
 * Long-term approach: Type-safe runtime validation
 */

import { isValidForSupabase } from '@/lib/utils/uuid-validation'

export interface ValidatedPost {
  id: string
  title?: string
  content?: string
  user_id?: string
  category?: string
  created_at?: string
  [key: string]: any
}

/**
 * Validate post data at runtime
 * Ensures critical fields are properly formatted
 */
export function validatePostData(post: any): post is ValidatedPost {
  if (!post || typeof post !== 'object') {
    console.error('🚨 Post Validation: Invalid post object', { post })
    return false
  }

  if (!post.id) {
    console.error('🚨 Post Validation: Missing post.id', { post })
    return false
  }

  if (typeof post.id !== 'string') {
    console.error('🚨 Post Validation: post.id is not a string', {
      id: post.id,
      type: typeof post.id,
      post
    })
    return false
  }

  if (!isValidForSupabase(post.id)) {
    console.error('🚨 Post Validation: Invalid UUID format for post.id', {
      id: post.id,
      length: post.id.length,
      post
    })
    return false
  }

  return true
}

/**
 * Clean and validate post array
 * Filter out invalid posts and log issues
 */
export function validateAndCleanPosts(posts: any[]): ValidatedPost[] {
  if (!Array.isArray(posts)) {
    console.error('🚨 Post Validation: Posts is not an array', { posts })
    return []
  }

  const validPosts: ValidatedPost[] = []
  const invalidPosts: any[] = []

  posts.forEach((post, index) => {
    if (validatePostData(post)) {
      validPosts.push(post as ValidatedPost)
    } else {
      invalidPosts.push({ index, post })
    }
  })

  if (invalidPosts.length > 0) {
    console.warn(`🚨 Post Validation: Found ${invalidPosts.length} invalid posts out of ${posts.length}`, {
      invalidPosts,
      validCount: validPosts.length
    })
  }

  console.log(`✅ Post Validation: ${validPosts.length} valid posts processed`)
  return validPosts
}

/**
 * Safe post ID extraction
 * Always returns a valid UUID string or null
 */
export function extractPostId(post: any): string | null {
  if (!validatePostData(post)) {
    return null
  }
  return post.id
}