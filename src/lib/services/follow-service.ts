import { createClient } from '@/lib/supabase/client'
import { Follow, UserProfile, NotificationWithProfile } from '@/types/database.types'

// Promise-based Supabase client for consistent initialization
let supabasePromise: Promise<any> | null = null

const getSupabaseClient = async () => {
  if (!supabasePromise) {
    supabasePromise = createClient()
  }
  return supabasePromise
}

export class FollowService {
  // 사용자 팔로우
  static async followUser(followingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = await getSupabaseClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('인증이 필요합니다.')
      }

      if (user.id === followingId) {
        return { success: false, message: '자기 자신을 팔로우할 수 없습니다.' }
      }

      // 이미 팔로우 중인지 확인
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single()

      if (existingFollow) {
        return { success: false, message: '이미 팔로우 중입니다.' }
      }

      // 팔로우 관계 생성
      const { error: followError } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: followingId
        })

      if (followError) throw followError

      // 활동 기록 생성
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'user_followed',
          target_id: followingId,
          target_type: 'user'
        })

      // 팔로우 알림 생성
      const { data: followingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', followingId)
        .single()

      const { data: followerUser } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single()

      if (followingUser && followerUser) {
        await supabase
          .from('notifications')
          .insert({
            user_id: followingId,
            type: 'follow',
            title: '새로운 팔로워',
            message: `${followerUser.full_name || followerUser.username}님이 회원님을 팔로우했습니다.`,
            data: {
              follower_id: user.id,
              follower_username: followerUser.username
            }
          })
      }

      return { success: true, message: '팔로우했습니다.' }
    } catch (error) {
      console.error('팔로우 중 오류:', error)
      return { success: false, message: '팔로우 중 오류가 발생했습니다.' }
    }
  }

  // 사용자 언팔로우
  static async unfollowUser(followingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('인증이 필요합니다.')
      }

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId)

      if (error) throw error

      return { success: true, message: '언팔로우했습니다.' }
    } catch (error) {
      console.error('언팔로우 중 오류:', error)
      return { success: false, message: '언팔로우 중 오류가 발생했습니다.' }
    }
  }

  // 팔로우 상태 확인
  static async checkFollowStatus(targetUserId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return false

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

      return !!data
    } catch {
      return false
    }
  }

  // 사용자 프로필 (팔로워/팔로잉 수 포함)
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) return null

      // 팔로워 수
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      // 팔로잉 수
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      // 현재 사용자와의 팔로우 관계 확인
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      let isFollowing = false
      let isFollowedBy = false

      if (currentUser && currentUser.id !== userId) {
        isFollowing = await this.checkFollowStatus(userId)

        const { data: followedBy } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', currentUser.id)
          .single()

        isFollowedBy = !!followedBy
      }

      return {
        ...profile,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        is_following: isFollowing,
        is_followed_by: isFollowedBy
      }
    } catch (error) {
      console.error('사용자 프로필 조회 오류:', error)
      return null
    }
  }

  // 팔로워 목록
  static async getFollowers(userId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          follower_profile:profiles!follows_follower_id_fkey(
            id, username, full_name, avatar_url, parenting_stage
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('팔로워 목록 조회 오류:', error)
      return []
    }
  }

  // 팔로잉 목록
  static async getFollowing(userId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          following_profile:profiles!follows_following_id_fkey(
            id, username, full_name, avatar_url, parenting_stage
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('팔로잉 목록 조회 오류:', error)
      return []
    }
  }

  // 추천 사용자 (같은 육아 단계의 사용자들)
  static async getRecommendedUsers(limit = 10) {
    try {
      const supabase = await getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      // 현재 사용자 프로필 조회
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('parenting_stage')
        .eq('id', user.id)
        .single()

      if (!currentProfile) return []

      // 이미 팔로우 중인 사용자들 목록
      const { data: followingList } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const excludeIds = [user.id, ...(followingList?.map(f => f.following_id) || [])]

      // 같은 육아 단계 사용자들 추천
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, parenting_stage, location')
        .eq('parenting_stage', currentProfile.parenting_stage)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('추천 사용자 조회 오류:', error)
      return []
    }
  }
}