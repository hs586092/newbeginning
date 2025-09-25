import { createClient } from '@/lib/supabase/client'
import { ActivityFeedItem } from '@/types/database.types'

const supabase = createClient()

export class ActivityService {
  // 활동 기록 생성
  static async createActivity({
    activityType,
    targetId,
    targetType
  }: {
    activityType: 'post_created' | 'comment_added' | 'post_liked' | 'user_followed'
    targetId?: string
    targetType?: 'post' | 'comment' | 'user'
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          target_id: targetId,
          target_type: targetType
        })

      return !error
    } catch (error) {
      console.error('활동 기록 생성 오류:', error)
      return false
    }
  }

  // 팔로우하는 사용자들의 활동 피드
  static async getFollowingActivityFeed(limit = 20, offset = 0): Promise<ActivityFeedItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      // 사용자가 팔로우하는 사람들의 ID 가져오기
      const { data: followingList } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (!followingList || followingList.length === 0) {
        return []
      }

      const followingIds = followingList.map(f => f.following_id)

      // 팔로우하는 사람들의 활동 가져오기
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          user_profile:profiles!user_activities_user_id_fkey(
            username, full_name, avatar_url
          ),
          target_post:posts(title, category),
          target_user:profiles!user_activities_target_id_fkey(
            username, full_name
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('활동 피드 조회 오류:', error)
      return []
    }
  }

  // 전체 활동 피드 (공개)
  static async getPublicActivityFeed(limit = 20, offset = 0): Promise<ActivityFeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          user_profile:profiles!user_activities_user_id_fkey(
            username, full_name, avatar_url
          ),
          target_post:posts(title, category),
          target_user:profiles!user_activities_target_id_fkey(
            username, full_name
          )
        `)
        .in('activity_type', ['post_created', 'user_followed'])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('공개 활동 피드 조회 오류:', error)
      return []
    }
  }

  // 사용자별 활동 히스토리
  static async getUserActivityHistory(userId: string, limit = 20, offset = 0): Promise<ActivityFeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          user_profile:profiles!user_activities_user_id_fkey(
            username, full_name, avatar_url
          ),
          target_post:posts(title, category),
          target_user:profiles!user_activities_target_id_fkey(
            username, full_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('사용자 활동 히스토리 조회 오류:', error)
      return []
    }
  }

  // 활동 통계
  static async getActivityStats(userId: string) {
    try {
      const { data: stats, error } = await supabase
        .from('user_activities')
        .select('activity_type')
        .eq('user_id', userId)

      if (error) throw error

      const activityCounts = stats.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total: stats.length,
        posts_created: activityCounts.post_created || 0,
        comments_added: activityCounts.comment_added || 0,
        posts_liked: activityCounts.post_liked || 0,
        users_followed: activityCounts.user_followed || 0
      }
    } catch (error) {
      console.error('활동 통계 조회 오류:', error)
      return {
        total: 0,
        posts_created: 0,
        comments_added: 0,
        posts_liked: 0,
        users_followed: 0
      }
    }
  }

  // 최근 활동 (간단한 버전)
  static async getRecentActivity(limit = 10): Promise<{ type: string; count: number; description: string }[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      // 팔로우하는 사람들의 최근 활동
      const { data: followingList } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (!followingList || followingList.length === 0) {
        return []
      }

      const followingIds = followingList.map(f => f.following_id)

      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('activity_type, created_at')
        .in('user_id', followingIds)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 최근 24시간
        .order('created_at', { ascending: false })

      if (error) throw error

      // 활동 타입별 집계
      const activityCounts = activities.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const activityDescriptions = {
        post_created: '새 게시글 작성',
        comment_added: '댓글 작성',
        post_liked: '좋아요',
        user_followed: '새 팔로우'
      }

      return Object.entries(activityCounts).map(([type, count]) => ({
        type,
        count,
        description: activityDescriptions[type as keyof typeof activityDescriptions] || type
      })).sort((a, b) => b.count - a.count)
    } catch (error) {
      console.error('최근 활동 조회 오류:', error)
      return []
    }
  }
}