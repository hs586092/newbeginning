import { createClient } from '@/lib/supabase/client'
import { Badge, UserBadge, UserPoints, PointTransaction, BadgeWithProgress, LeaderboardEntry, PointsEarned } from '@/types/database.types'

const supabase = createClient()

export class GamificationService {
  // Points system
  static readonly POINT_VALUES = {
    post_created: 10,
    comment_added: 5,
    post_liked: 2,
    comment_liked: 1,
    user_followed: 3,
    daily_login: 1,
    profile_completed: 15,
    helpful_answer: 25,
    badge_earned: 50
  }

  // Award points for user actions
  static async awardPoints({
    userId,
    action,
    referenceId,
    referenceType,
    customPoints
  }: {
    userId: string
    action: keyof typeof GamificationService.POINT_VALUES
    referenceId?: string
    referenceType?: 'post' | 'comment' | 'user' | 'badge'
    customPoints?: number
  }): Promise<PointsEarned | null> {
    try {
      const points = customPoints || this.POINT_VALUES[action]
      const description = this.getActionDescription(action)

      // Insert point transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: userId,
          points,
          action_type: action,
          reference_id: referenceId,
          reference_type: referenceType,
          description
        })

      if (transactionError) throw transactionError

      // Update user total points
      const { data: currentPoints } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single()

      if (currentPoints) {
        await supabase
          .from('user_points')
          .update({
            total_points: currentPoints.total_points + points,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      } else {
        await supabase
          .from('user_points')
          .insert({
            user_id: userId,
            total_points: points
          })
      }

      // Check for badge achievements
      const badgeEarned = await this.checkBadgeAchievements(userId, action)

      return {
        points,
        action,
        description,
        badge_earned: badgeEarned
      }
    } catch (error) {
      console.error('포인트 지급 오류:', error)
      return null
    }
  }

  // Get user's total points and rank
  static async getUserPoints(userId: string): Promise<{ points: number; rank: number } | null> {
    try {
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single()

      if (!userPoints) {
        // Initialize user points if not exists
        await supabase
          .from('user_points')
          .insert({
            user_id: userId,
            total_points: 0
          })
        return { points: 0, rank: 0 }
      }

      // Calculate user's rank
      const { count } = await supabase
        .from('user_points')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', userPoints.total_points)

      return {
        points: userPoints.total_points,
        rank: (count || 0) + 1
      }
    } catch (error) {
      console.error('사용자 포인트 조회 오류:', error)
      return null
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit = 10, period: 'all' | 'week' | 'month' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          profiles!inner(username, full_name, avatar_url)
        `)
        .order('total_points', { ascending: false })
        .limit(limit)

      const { data, error } = await query

      if (error) throw error

      // Get badge counts for each user
      const userIds = data.map(entry => entry.user_id)
      const { data: badgeCounts } = await supabase
        .from('user_badges')
        .select('user_id')
        .in('user_id', userIds)

      const badgeCountMap = badgeCounts?.reduce((acc, badge) => {
        acc[badge.user_id] = (acc[badge.user_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return data.map((entry, index) => ({
        user_id: entry.user_id,
        username: entry.profiles.username,
        full_name: entry.profiles.full_name,
        avatar_url: entry.profiles.avatar_url,
        total_points: entry.total_points,
        badges_count: badgeCountMap[entry.user_id] || 0,
        rank: index + 1
      }))
    } catch (error) {
      console.error('리더보드 조회 오류:', error)
      return []
    }
  }

  // Badge system
  static async getUserBadges(userId: string): Promise<BadgeWithProgress[]> {
    try {
      // Get earned badges
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          earned_at,
          progress,
          badges(*)
        `)
        .eq('user_id', userId)

      // Get all available badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('category')

      if (!allBadges) return []

      const earnedBadgeIds = new Set(earnedBadges?.map(eb => eb.badge_id) || [])
      const earnedBadgeMap = new Map(earnedBadges?.map(eb => [eb.badge_id, eb]) || [])

      return allBadges.map(badge => {
        const earned = earnedBadgeIds.has(badge.id)
        const userBadge = earnedBadgeMap.get(badge.id)

        return {
          ...badge,
          earned,
          progress: userBadge?.progress || 0,
          earned_at: userBadge?.earned_at
        }
      })
    } catch (error) {
      console.error('사용자 뱃지 조회 오류:', error)
      return []
    }
  }

  // Check and award badge achievements
  static async checkBadgeAchievements(userId: string, action: string): Promise<Badge | null> {
    try {
      // Get relevant badges for this action
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .eq('requirement_action', action)

      if (!badges || badges.length === 0) return null

      for (const badge of badges) {
        const qualified = await this.checkBadgeQualification(userId, badge)
        if (qualified) {
          // Award the badge
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id,
              progress: badge.requirement_value
            })

          if (!error) {
            // Award bonus points for earning badge
            await this.awardPoints({
              userId,
              action: 'badge_earned',
              referenceId: badge.id,
              referenceType: 'badge',
              customPoints: badge.points_reward
            })

            return badge
          }
        }
      }

      return null
    } catch (error) {
      console.error('뱃지 성취 확인 오류:', error)
      return null
    }
  }

  // Check if user qualifies for a specific badge
  private static async checkBadgeQualification(userId: string, badge: Badge): Promise<boolean> {
    try {
      // Check if user already has this badge
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .single()

      if (existingBadge) return false

      switch (badge.requirement_type) {
        case 'count':
          return this.checkCountRequirement(userId, badge)
        case 'streak':
          return this.checkStreakRequirement(userId, badge)
        case 'achievement':
          return this.checkAchievementRequirement(userId, badge)
        default:
          return false
      }
    } catch (error) {
      console.error('뱃지 자격 확인 오류:', error)
      return false
    }
  }

  private static async checkCountRequirement(userId: string, badge: Badge): Promise<boolean> {
    try {
      const { count } = await supabase
        .from('point_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', badge.requirement_action)

      return (count || 0) >= badge.requirement_value
    } catch (error) {
      return false
    }
  }

  private static async checkStreakRequirement(userId: string, badge: Badge): Promise<boolean> {
    // Implementation for streak-based badges (e.g., daily login streaks)
    return false // Placeholder
  }

  private static async checkAchievementRequirement(userId: string, badge: Badge): Promise<boolean> {
    // Implementation for special achievement badges
    return false // Placeholder
  }

  private static getActionDescription(action: string): string {
    const descriptions = {
      post_created: '게시글 작성',
      comment_added: '댓글 작성',
      post_liked: '게시글 좋아요',
      comment_liked: '댓글 좋아요',
      user_followed: '사용자 팔로우',
      daily_login: '일일 접속',
      profile_completed: '프로필 완성',
      helpful_answer: '도움되는 답변',
      badge_earned: '뱃지 획득'
    }
    return descriptions[action as keyof typeof descriptions] || action
  }

  // Initialize default badges
  static async initializeDefaultBadges(): Promise<void> {
    const defaultBadges: Omit<Badge, 'id' | 'created_at'>[] = [
      // Posting badges
      {
        name: '첫 게시글',
        description: '첫 번째 게시글을 작성했습니다',
        icon: '📝',
        category: 'posting',
        requirement_type: 'count',
        requirement_value: 1,
        requirement_action: 'post_created',
        points_reward: 20,
        rarity: 'common',
        is_active: true
      },
      {
        name: '글쓰기 마니아',
        description: '10개의 게시글을 작성했습니다',
        icon: '✍️',
        category: 'posting',
        requirement_type: 'count',
        requirement_value: 10,
        requirement_action: 'post_created',
        points_reward: 100,
        rarity: 'rare',
        is_active: true
      },
      // Engagement badges
      {
        name: '첫 댓글',
        description: '첫 번째 댓글을 작성했습니다',
        icon: '💬',
        category: 'engagement',
        requirement_type: 'count',
        requirement_value: 1,
        requirement_action: 'comment_added',
        points_reward: 15,
        rarity: 'common',
        is_active: true
      },
      {
        name: '소통왕',
        description: '50개의 댓글을 작성했습니다',
        icon: '🗣️',
        category: 'engagement',
        requirement_type: 'count',
        requirement_value: 50,
        requirement_action: 'comment_added',
        points_reward: 150,
        rarity: 'epic',
        is_active: true
      },
      // Social badges
      {
        name: '친구 만들기',
        description: '첫 번째 사용자를 팔로우했습니다',
        icon: '👥',
        category: 'social',
        requirement_type: 'count',
        requirement_value: 1,
        requirement_action: 'user_followed',
        points_reward: 25,
        rarity: 'common',
        is_active: true
      },
      {
        name: '네트워커',
        description: '20명의 사용자를 팔로우했습니다',
        icon: '🌐',
        category: 'social',
        requirement_type: 'count',
        requirement_value: 20,
        requirement_action: 'user_followed',
        points_reward: 200,
        rarity: 'rare',
        is_active: true
      }
    ]

    try {
      const { error } = await supabase
        .from('badges')
        .upsert(defaultBadges, { onConflict: 'name' })

      if (error) throw error
      console.log('기본 뱃지가 초기화되었습니다')
    } catch (error) {
      console.error('뱃지 초기화 오류:', error)
    }
  }
}