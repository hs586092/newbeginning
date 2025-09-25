import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types/database.types'

const supabase = createClient()

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  message_notifications: boolean
  comment_notifications: boolean
  reaction_notifications: boolean
  follow_notifications: boolean
  group_notifications: boolean
  event_notifications: boolean
  marketing_emails: boolean
}

export interface EmailNotificationData {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export class NotificationsService {
  // Get user notifications
  static async getUserNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
          *,
          from_profile:profiles!notifications_from_user_id_fkey(username, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return notifications || []
    } catch (error) {
      console.error('알림 조회 오류:', error)
      return []
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      return !error
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
      return false
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

      return !error
    } catch (error) {
      console.error('전체 알림 읽음 처리 오류:', error)
      return false
    }
  }

  // Get unread notification count
  static async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 오류:', error)
      return 0
    }
  }

  // Create notification
  static async createNotification(data: {
    userId: string
    fromUserId?: string
    type: 'message' | 'comment' | 'reaction' | 'follow' | 'group_invite' | 'event_invite' | 'system'
    title: string
    message: string
    relatedId?: string
    relatedType?: string
  }): Promise<string | null> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          from_user_id: data.fromUserId,
          type: data.type,
          title: data.title,
          message: data.message,
          related_id: data.relatedId,
          related_type: data.relatedType
        })
        .select()
        .single()

      if (error) throw error

      // Send real-time notification if user is online
      await this.sendRealtimeNotification(data.userId, notification)

      return notification.id
    } catch (error) {
      console.error('알림 생성 오류:', error)
      return null
    }
  }

  // Send real-time notification
  private static async sendRealtimeNotification(userId: string, notification: any): Promise<void> {
    try {
      await supabase.channel(`notifications:${userId}`).send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      })
    } catch (error) {
      console.error('실시간 알림 전송 오류:', error)
    }
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const channel = supabase.channel(`notifications:${userId}`)

    channel
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        callback(payload.payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Get notification preferences
  static async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Return default preferences if none exist
      return preferences || {
        email_notifications: true,
        push_notifications: true,
        message_notifications: true,
        comment_notifications: true,
        reaction_notifications: true,
        follow_notifications: true,
        group_notifications: true,
        event_notifications: true,
        marketing_emails: false
      }
    } catch (error) {
      console.error('알림 설정 조회 오류:', error)
      return null
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })

      return !error
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error)
      return false
    }
  }

  // Send email notification (would integrate with email service)
  static async sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      // In a real implementation, you would integrate with an email service like:
      // - Supabase Edge Functions
      // - SendGrid
      // - Resend
      // - AWS SES

      console.log('Sending email notification:', data)

      // Placeholder implementation - would call your email service API
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      //
      // return response.ok

      return true
    } catch (error) {
      console.error('이메일 알림 전송 오류:', error)
      return false
    }
  }

  // Register for push notifications
  static async registerPushNotifications(): Promise<string | null> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported')
        return null
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn('Notification permission denied')
        return null
      }

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription: JSON.stringify(subscription),
            updated_at: new Date().toISOString()
          })
      }

      return JSON.stringify(subscription)
    } catch (error) {
      console.error('푸시 알림 등록 오류:', error)
      return null
    }
  }

  // Send push notification (would be handled by backend)
  static async sendPushNotification(data: {
    userId: string
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    data?: Record<string, any>
  }): Promise<boolean> {
    try {
      // This would typically be handled by your backend service
      // that has access to push notification credentials

      console.log('Sending push notification:', data)

      // Placeholder - would call your push notification API
      // const response = await fetch('/api/send-push', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      //
      // return response.ok

      return true
    } catch (error) {
      console.error('푸시 알림 전송 오류:', error)
      return false
    }
  }

  // Delete old notifications
  static async cleanupOldNotifications(daysOld: number = 30): Promise<boolean> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .lt('created_at', cutoffDate.toISOString())

      return !error
    } catch (error) {
      console.error('오래된 알림 삭제 오류:', error)
      return false
    }
  }

  // Notification helper methods for common use cases
  static async notifyNewMessage(recipientId: string, senderId: string, senderName: string, conversationId: string): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      fromUserId: senderId,
      type: 'message',
      title: '새 메시지',
      message: `${senderName}님이 메시지를 보냈습니다`,
      relatedId: conversationId,
      relatedType: 'conversation'
    })

    // Send email if preferences allow
    const preferences = await this.getNotificationPreferences()
    if (preferences?.email_notifications && preferences?.message_notifications) {
      // Would implement email sending here
    }
  }

  static async notifyNewComment(postOwnerId: string, commenterId: string, commenterName: string, postId: string): Promise<void> {
    if (postOwnerId === commenterId) return // Don't notify self

    await this.createNotification({
      userId: postOwnerId,
      fromUserId: commenterId,
      type: 'comment',
      title: '새 댓글',
      message: `${commenterName}님이 게시글에 댓글을 달았습니다`,
      relatedId: postId,
      relatedType: 'post'
    })
  }

  static async notifyNewFollower(userId: string, followerId: string, followerName: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      fromUserId: followerId,
      type: 'follow',
      title: '새 팔로워',
      message: `${followerName}님이 회원님을 팔로우했습니다`,
      relatedId: followerId,
      relatedType: 'user'
    })
  }

  static async notifyGroupInvite(userId: string, inviterId: string, inviterName: string, groupId: string, groupName: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      fromUserId: inviterId,
      type: 'group_invite',
      title: '그룹 초대',
      message: `${inviterName}님이 "${groupName}" 그룹에 초대했습니다`,
      relatedId: groupId,
      relatedType: 'group'
    })
  }

  static async notifyEventInvite(userId: string, inviterId: string, inviterName: string, eventId: string, eventTitle: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      fromUserId: inviterId,
      type: 'event_invite',
      title: '이벤트 초대',
      message: `${inviterName}님이 "${eventTitle}" 이벤트에 초대했습니다`,
      relatedId: eventId,
      relatedType: 'event'
    })
  }
}