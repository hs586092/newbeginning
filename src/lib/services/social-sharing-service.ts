import { createClient } from '@/lib/supabase/client'
import { Bookmark, SocialShare, BookmarkWithPost, ShareStats } from '@/types/database.types'

const supabase = createClient()

export class SocialSharingService {
  // Bookmarking functions
  static async bookmarkPost(postId: string, category?: string, notes?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          post_id: postId,
          category,
          notes
        })

      return !error
    } catch (error) {
      console.error('북마크 추가 오류:', error)
      return false
    }
  }

  static async removeBookmark(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)

      return !error
    } catch (error) {
      console.error('북마크 제거 오류:', error)
      return false
    }
  }

  static async isBookmarked(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  static async getUserBookmarks(category?: string): Promise<BookmarkWithPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      let query = supabase
        .from('bookmarks')
        .select(`
          *,
          posts(
            *,
            profiles!inner(username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('북마크 조회 오류:', error)
      return []
    }
  }

  static async getBookmarkCategories(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('bookmarks')
        .select('category')
        .eq('user_id', user.id)
        .not('category', 'is', null)

      if (error) throw error

      const categories = [...new Set(data?.map(b => b.category).filter(Boolean) as string[])]
      return categories
    } catch (error) {
      console.error('북마크 카테고리 조회 오류:', error)
      return []
    }
  }

  // Social sharing functions
  static async sharePost(
    postId: string,
    platform: 'facebook' | 'twitter' | 'instagram' | 'kakaotalk' | 'line' | 'link_copy'
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Get post details for sharing
      const { data: post } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(username, full_name)
        `)
        .eq('id', postId)
        .single()

      if (!post) return null

      // Record the share
      await supabase
        .from('social_shares')
        .upsert({
          post_id: postId,
          user_id: user.id,
          platform,
          share_count: 1
        }, {
          onConflict: 'post_id,user_id,platform',
          ignoreDuplicates: false
        })

      // Generate share URL and content
      const shareUrl = `${window.location.origin}/post/${postId}`
      const shareText = `${post.title} - ${post.profiles.full_name || post.profiles.username}님의 육아 이야기`

      switch (platform) {
        case 'facebook':
          return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`

        case 'twitter':
          return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`

        case 'line':
          return `https://line.me/R/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`

        case 'kakaotalk':
          // KakaoTalk sharing requires KakaoTalk SDK
          return shareUrl

        case 'link_copy':
          // Copy to clipboard
          try {
            await navigator.clipboard.writeText(shareUrl)
            return shareUrl
          } catch (error) {
            console.error('클립보드 복사 실패:', error)
            return shareUrl
          }

        default:
          return shareUrl
      }
    } catch (error) {
      console.error('게시글 공유 오류:', error)
      return null
    }
  }

  static async getShareStats(postId: string): Promise<ShareStats[]> {
    try {
      const { data, error } = await supabase
        .from('social_shares')
        .select('platform, share_count')
        .eq('post_id', postId)

      if (error) throw error

      // Aggregate share counts by platform
      const platformCounts = (data || []).reduce((acc, share) => {
        acc[share.platform] = (acc[share.platform] || 0) + share.share_count
        return acc
      }, {} as Record<string, number>)

      return Object.entries(platformCounts).map(([platform, count]) => ({
        platform,
        count
      }))
    } catch (error) {
      console.error('공유 통계 조회 오류:', error)
      return []
    }
  }

  static async getTotalShares(postId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('social_shares')
        .select('share_count')
        .eq('post_id', postId)

      if (error) throw error

      return (data || []).reduce((total, share) => total + share.share_count, 0)
    } catch (error) {
      console.error('총 공유 수 조회 오류:', error)
      return 0
    }
  }

  // Advanced bookmarking functions
  static async updateBookmarkNotes(postId: string, notes: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('bookmarks')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('post_id', postId)

      return !error
    } catch (error) {
      console.error('북마크 메모 업데이트 오류:', error)
      return false
    }
  }

  static async updateBookmarkCategory(postId: string, category: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('bookmarks')
        .update({ category })
        .eq('user_id', user.id)
        .eq('post_id', postId)

      return !error
    } catch (error) {
      console.error('북마크 카테고리 업데이트 오류:', error)
      return false
    }
  }

  static async searchBookmarks(query: string): Promise<BookmarkWithPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          posts!inner(
            *,
            profiles!inner(username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .or(`notes.ilike.%${query}%,posts.title.ilike.%${query}%,posts.content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('북마크 검색 오류:', error)
      return []
    }
  }

  // Export bookmarks
  static async exportBookmarks(format: 'json' | 'csv' = 'json'): Promise<string | null> {
    try {
      const bookmarks = await this.getUserBookmarks()

      if (format === 'json') {
        return JSON.stringify(bookmarks, null, 2)
      }

      if (format === 'csv') {
        const headers = ['제목', '작성자', '카테고리', '메모', '북마크 날짜', 'URL']
        const rows = bookmarks.map(bookmark => [
          bookmark.posts.title,
          bookmark.posts.profiles.full_name || bookmark.posts.profiles.username,
          bookmark.category || '',
          bookmark.notes || '',
          new Date(bookmark.created_at).toLocaleDateString('ko-KR'),
          `${window.location.origin}/post/${bookmark.post_id}`
        ])

        const csvContent = [headers, ...rows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n')

        return csvContent
      }

      return null
    } catch (error) {
      console.error('북마크 내보내기 오류:', error)
      return null
    }
  }

  // Social sharing with native APIs
  static async nativeShare(postId: string, title: string, text?: string): Promise<boolean> {
    try {
      if (!navigator.share) {
        return false
      }

      const shareUrl = `${window.location.origin}/post/${postId}`

      await navigator.share({
        title,
        text: text || title,
        url: shareUrl
      })

      // Record the share
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('social_shares')
          .upsert({
            post_id: postId,
            user_id: user.id,
            platform: 'link_copy', // Use as generic native share
            share_count: 1
          })
      }

      return true
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('네이티브 공유 오류:', error)
      }
      return false
    }
  }
}