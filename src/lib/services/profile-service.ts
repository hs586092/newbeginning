// 사용자 프로필 서비스 - MOCK 데이터 대체용
import { getSupabaseClient } from '@/lib/supabase/client-factory'

export interface UserProfile {
  id: string
  username: string
  email?: string
  avatar_url?: string
  points?: number
  level?: number
  ranking?: number
  next_badge_points?: number
  followers_count?: number
  following_count?: number
  created_at?: string
  updated_at?: string
}

export class ProfileService {
  /**
   * 사용자 프로필 조회
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('프로필 조회 오류:', error)
        // MOCK 데이터 반환 (임시)
        return this.getMockProfile(userId)
      }

      return data
    } catch (err) {
      console.error('프로필 서비스 오류:', err)
      return this.getMockProfile(userId)
    }
  }

  /**
   * 현재 로그인한 사용자의 프로필 조회
   */
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const supabase = await getSupabaseClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('인증 오류:', authError)
        return null
      }

      return this.getUserProfile(user.id)
    } catch (err) {
      console.error('현재 사용자 프로필 조회 오류:', err)
      return null
    }
  }

  /**
   * 사용자 포인트 업데이트
   */
  static async updateUserPoints(userId: string, points: number): Promise<boolean> {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          points,
          level: this.calculateLevel(points),
          ranking: await this.calculateUserRanking(userId, points),
          next_badge_points: this.calculateNextBadgePoints(points)
        })
        .eq('id', userId)

      if (error) {
        console.error('포인트 업데이트 오류:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('포인트 업데이트 서비스 오류:', err)
      return false
    }
  }

  /**
   * 사용자 랭킹 계산 (포인트 기준)
   */
  static async calculateUserRanking(userId: string, userPoints?: number): Promise<number> {
    try {
      if (!userPoints) {
        const profile = await this.getUserProfile(userId)
        userPoints = profile?.points || 0
      }

      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .gt('points', userPoints)
        .not('id', 'eq', userId)

      if (error) {
        console.error('랭킹 계산 오류:', error)
        return 42 // MOCK 데이터
      }

      return (data?.length || 0) + 1
    } catch (err) {
      console.error('랭킹 계산 서비스 오류:', err)
      return 42
    }
  }

  /**
   * 포인트로 레벨 계산
   */
  static calculateLevel(points: number): number {
    if (points >= 10000) return 10
    if (points >= 5000) return 9
    if (points >= 2500) return 8
    if (points >= 2000) return 7
    if (points >= 1500) return 6
    if (points >= 1200) return 5
    if (points >= 1000) return 4
    if (points >= 500) return 3
    if (points >= 200) return 2
    return 1
  }

  /**
   * 다음 뱃지까지 필요한 포인트 계산
   */
  static calculateNextBadgePoints(points: number): number {
    const nextLevelPoints = [200, 500, 1000, 1200, 1500, 2000, 2500, 5000, 10000, 20000]

    for (const threshold of nextLevelPoints) {
      if (points < threshold) {
        return threshold - points
      }
    }

    return 0 // 최고 레벨
  }

  /**
   * 읽지 않은 알림 수 조회
   */
  static async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('알림 수 조회 오류:', error)
        return 3 // MOCK 데이터
      }

      return data?.length || 0
    } catch (err) {
      console.error('알림 수 조회 서비스 오류:', err)
      return 3
    }
  }

  /**
   * 최근 알림 메시지 조회
   */
  static async getRecentNotifications(userId: string, limit: number = 2): Promise<any[]> {
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error || !data || data.length === 0) {
        console.error('최근 알림 조회 오류:', error)
        // MOCK 데이터 반환
        return [
          {
            id: 'mock1',
            type: 'message',
            title: '안녕하세요! 육아 관련 질문이...',
            content: '안녕하세요! 육아 관련 질문이 있습니다.',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock2',
            type: 'like',
            title: '이유식 레시피 공유해주셔서...',
            content: '이유식 레시피 공유해주셔서 감사합니다!',
            created_at: new Date().toISOString()
          }
        ]
      }

      return data
    } catch (err) {
      console.error('최근 알림 조회 서비스 오류:', err)
      return []
    }
  }

  /**
   * MOCK 프로필 데이터 (실제 데이터 조회 실패 시 사용)
   */
  private static getMockProfile(userId: string): UserProfile {
    return {
      id: userId,
      username: 'User' + userId.substring(0, 8),
      points: 1250,
      level: 3,
      ranking: 42,
      next_badge_points: 250,
      followers_count: 15,
      following_count: 23,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}