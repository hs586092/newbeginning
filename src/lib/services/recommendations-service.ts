import { createClient } from '@/lib/supabase/client'
import { Post, Profile, GroupWithDetails } from '@/types/database.types'

const supabase = createClient()

export class RecommendationsService {
  // Get recommended users based on interests, activity, and connections
  static async getRecommendedUsers(limit: number = 10): Promise<Profile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get user's current profile and interests
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!currentProfile) return []

      // Get users the current user is already following
      const { data: following } = await supabase
        .from('user_follows')
        .select('followed_id')
        .eq('follower_id', user.id)

      const followingIds = following?.map(f => f.followed_id) || []
      const excludeIds = [user.id, ...followingIds]

      // Recommendation algorithm based on multiple factors
      let query = supabase
        .from('profiles')
        .select(`
          *,
          posts!inner(id, created_at),
          user_points!inner(total_points)
        `)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .eq('is_active', true)

      // Filter by similar parenting stage if available
      if (currentProfile.parenting_stage) {
        query = query.eq('parenting_stage', currentProfile.parenting_stage)
      }

      const { data: candidates, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit * 3) // Get more candidates to filter from

      if (error) throw error

      // Score and rank candidates
      const scoredUsers = (candidates || []).map(candidate => {
        let score = 0

        // Activity score (recent posts)
        const recentPosts = candidate.posts.filter((post: any) => {
          const postDate = new Date(post.created_at)
          const daysSince = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysSince <= 30
        })
        score += Math.min(recentPosts.length * 2, 20)

        // Points score (engagement)
        const totalPoints = candidate.user_points?.[0]?.total_points || 0
        score += Math.min(totalPoints / 10, 30)

        // Profile completeness
        if (candidate.full_name) score += 5
        if (candidate.bio) score += 5
        if (candidate.avatar_url) score += 5
        if (candidate.location) score += 5

        return { ...candidate, recommendation_score: score }
      })

      // Sort by score and return top results
      return scoredUsers
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit)
    } catch (error) {
      console.error('추천 사용자 조회 오류:', error)
      return []
    }
  }

  // Get recommended posts based on user interests and activity
  static async getRecommendedPosts(limit: number = 20): Promise<Post[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get user's interaction history for personalization
      const { data: userActivity } = await supabase
        .from('post_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      const interactedPostIds = userActivity?.map(a => a.post_id) || []

      // Get recommended posts
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url),
          post_reactions(id, reaction_type),
          post_comments(id)
        `)
        .eq('is_published', true)
        .neq('created_by', user.id)

      // Exclude already interacted posts
      if (interactedPostIds.length > 0) {
        query = query.not('id', 'in', `(${interactedPostIds.join(',')})`)
      }

      const { data: posts, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit * 2)

      if (error) throw error

      // Score posts based on engagement and recency
      const scoredPosts = (posts || []).map(post => {
        let score = 0

        // Reaction score
        const reactions = post.post_reactions || []
        score += reactions.length * 3

        // Comment score
        const comments = post.post_comments || []
        score += comments.length * 5

        // Recency score
        const daysSince = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)
        score += Math.max(0, 14 - daysSince) * 2

        // Content quality indicators
        if (post.image_url) score += 5
        if (post.title && post.title.length > 20) score += 3
        if (post.content && post.content.length > 100) score += 3

        return { ...post, recommendation_score: score }
      })

      return scoredPosts
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit)
    } catch (error) {
      console.error('추천 게시글 조회 오류:', error)
      return []
    }
  }

  // Get recommended groups based on user interests
  static async getRecommendedGroups(limit: number = 10): Promise<GroupWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get user's current groups
      const { data: userGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      const joinedGroupIds = userGroups?.map(g => g.group_id) || []

      // Get recommended groups
      let query = supabase
        .from('groups')
        .select(`
          *,
          group_members(id, user_id),
          group_posts(id)
        `)
        .eq('is_active', true)

      // Exclude already joined groups
      if (joinedGroupIds.length > 0) {
        query = query.not('id', 'in', `(${joinedGroupIds.join(',')})`)
      }

      // Only public groups for recommendations
      query = query.eq('privacy_level', 'public')

      const { data: groups, error } = await query.limit(limit * 2)

      if (error) throw error

      // Score groups based on activity and size
      const scoredGroups = (groups || []).map(group => {
        let score = 0

        // Member count score (sweet spot around 50-200 members)
        const memberCount = group.group_members?.length || 0
        if (memberCount >= 10 && memberCount <= 200) {
          score += Math.min(memberCount / 4, 50)
        }

        // Activity score (recent posts)
        const recentPosts = (group.group_posts || []).filter((post: any) => {
          const postDate = new Date(post.created_at)
          const daysSince = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysSince <= 7
        })
        score += recentPosts.length * 5

        // Group quality indicators
        if (group.description && group.description.length > 50) score += 10
        if (group.cover_image) score += 5
        if (group.rules && group.rules.length > 20) score += 5

        return {
          ...group,
          member_count: memberCount,
          recent_activity: recentPosts.length,
          recommendation_score: score
        } as GroupWithDetails
      })

      return scoredGroups
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit)
    } catch (error) {
      console.error('추천 그룹 조회 오류:', error)
      return []
    }
  }

  // Get trending content based on recent activity
  static async getTrendingContent(timeframe: 'day' | 'week' | 'month' = 'week', limit: number = 10): Promise<Post[]> {
    try {
      const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url),
          post_reactions(id, reaction_type, created_at),
          post_comments(id, created_at)
        `)
        .eq('is_published', true)
        .gte('created_at', cutoffDate.toISOString())

      if (error) throw error

      // Calculate trending score based on engagement velocity
      const trendingPosts = (posts || []).map(post => {
        const reactions = post.post_reactions || []
        const comments = post.post_comments || []

        // Recent reactions/comments get higher weight
        const recentReactions = reactions.filter((r: any) =>
          new Date(r.created_at) >= cutoffDate
        ).length

        const recentComments = comments.filter((c: any) =>
          new Date(c.created_at) >= cutoffDate
        ).length

        // Calculate engagement per day since creation
        const daysSinceCreation = Math.max(1, (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24))
        const engagementVelocity = (recentReactions * 2 + recentComments * 3) / daysSinceCreation

        return {
          ...post,
          trending_score: engagementVelocity,
          recent_reactions: recentReactions,
          recent_comments: recentComments
        }
      })

      return trendingPosts
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, limit)
    } catch (error) {
      console.error('트렌딩 콘텐츠 조회 오류:', error)
      return []
    }
  }

  // Smart search with personalization
  static async smartSearch(query: string, options: {
    type?: 'posts' | 'users' | 'groups' | 'all'
    limit?: number
  } = {}): Promise<{
    posts: Post[]
    users: Profile[]
    groups: GroupWithDetails[]
  }> {
    try {
      const { type = 'all', limit = 10 } = options
      const { data: { user } } = await supabase.auth.getUser()

      const results = {
        posts: [] as Post[],
        users: [] as Profile[],
        groups: [] as GroupWithDetails[]
      }

      // Search posts
      if (type === 'posts' || type === 'all') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!inner(username, full_name, avatar_url)
          `)
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(limit)

        results.posts = posts || []
      }

      // Search users
      if (type === 'users' || type === 'all') {
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_active', true)
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
          .limit(limit)

        results.users = users || []
      }

      // Search groups
      if (type === 'groups' || type === 'all') {
        const { data: groups } = await supabase
          .from('groups')
          .select(`
            *,
            group_members(id),
            group_posts(id)
          `)
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit)

        results.groups = (groups || []).map(group => ({
          ...group,
          member_count: group.group_members?.length || 0,
          recent_activity: group.group_posts?.length || 0
        })) as GroupWithDetails[]
      }

      return results
    } catch (error) {
      console.error('스마트 검색 오류:', error)
      return { posts: [], users: [], groups: [] }
    }
  }

  // Get personalized feed with smart filtering
  static async getPersonalizedFeed(options: {
    includeFollowing?: boolean
    includeRecommended?: boolean
    limit?: number
  } = {}): Promise<Post[]> {
    try {
      const { includeFollowing = true, includeRecommended = true, limit = 20 } = options
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      let allPosts: Post[] = []

      // Get posts from followed users
      if (includeFollowing) {
        const { data: following } = await supabase
          .from('user_follows')
          .select('followed_id')
          .eq('follower_id', user.id)

        if (following && following.length > 0) {
          const followingIds = following.map(f => f.followed_id)

          const { data: followingPosts } = await supabase
            .from('posts')
            .select(`
              *,
              profiles!inner(username, full_name, avatar_url)
            `)
            .eq('is_published', true)
            .in('created_by', followingIds)
            .order('created_at', { ascending: false })
            .limit(Math.floor(limit * 0.6))

          allPosts.push(...(followingPosts || []))
        }
      }

      // Get recommended posts
      if (includeRecommended) {
        const recommendedPosts = await this.getRecommendedPosts(Math.floor(limit * 0.4))
        allPosts.push(...recommendedPosts)
      }

      // Remove duplicates and sort by relevance
      const uniquePosts = allPosts.filter((post, index, self) =>
        index === self.findIndex(p => p.id === post.id)
      )

      // Mix and sort posts for optimal engagement
      return uniquePosts
        .sort((a, b) => {
          // Prioritize recent posts from followed users
          const aIsFollowing = includeFollowing && a.profiles
          const bIsFollowing = includeFollowing && b.profiles

          if (aIsFollowing && !bIsFollowing) return -1
          if (!aIsFollowing && bIsFollowing) return 1

          // Then sort by recommendation score or recency
          const aScore = (a as any).recommendation_score || 0
          const bScore = (b as any).recommendation_score || 0

          if (aScore !== bScore) return bScore - aScore

          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        .slice(0, limit)
    } catch (error) {
      console.error('개인화 피드 조회 오류:', error)
      return []
    }
  }
}