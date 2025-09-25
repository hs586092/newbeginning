import { createClient } from '@/lib/supabase/client'
import { Notification, NotificationWithProfile } from '@/types/database.types'

const supabase = createClient()

export class NotificationService {
  // 알림 목록 조회
  static async getNotifications(limit = 20, offset = 0): Promise<NotificationWithProfile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:profiles(username, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('알림 조회 오류:', error)
      return []
    }
  }

  // 읽지 않은 알림 수
  static async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return 0

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      return count || 0
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 오류:', error)
      return 0
    }
  }

  // 알림 읽음 처리
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      return !error
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
      return false
    }
  }

  // 모든 알림 읽음 처리
  static async markAllAsRead(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      return !error
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error)
      return false
    }
  }

  // 알림 생성 (내부 사용)
  static async createNotification({
    userId,
    type,
    title,
    message,
    data
  }: {
    userId: string
    type: 'follow' | 'like' | 'comment' | 'reply' | 'mention'
    title: string
    message: string
    data?: any
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data
        })

      return !error
    } catch (error) {
      console.error('알림 생성 오류:', error)
      return false
    }
  }

  // 실시간 알림 구독
  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }

  // 알림 삭제
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      return !error
    } catch (error) {
      console.error('알림 삭제 오류:', error)
      return false
    }
  }
}