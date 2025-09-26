/**
 * 실시간 알림 시스템
 * Supabase Realtime을 활용한 실시간 알림 처리
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { toast } from 'sonner'
import { Bell, Heart, MessageCircle, UserPlus, Award } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'system'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  expires_at?: string
}

interface NotificationToast {
  id: string
  title: string
  message: string
  type: Notification['type']
  action?: () => void
}

export function RealtimeNotificationSystem() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  // Show notification toast
  const showNotificationToast = useCallback((notification: Notification) => {
    const icons = {
      like: '💕',
      comment: '💬',
      follow: '👥',
      mention: '📢',
      achievement: '🏆',
      system: '🔔'
    }

    const icon = icons[notification.type] || '🔔'

    toast(`${icon} ${notification.title}`, {
      description: notification.message,
      duration: 5000,
      action: notification.data?.post_id ? {
        label: '보기',
        onClick: () => {
          // Navigate to post
          window.location.href = `/post/${notification.data?.post_id}`
        }
      } : undefined
    })
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id)

      if (error) {
        logger.error('Failed to mark notification as read', error, { notificationId })
        return
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      )

      setUnreadCount(prev => Math.max(0, prev - 1))

      logger.log('Notification marked as read', { notificationId })
    } catch (error) {
      logger.error('Error marking notification as read', error, { notificationId })
    }
  }, [supabase, user?.id])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        logger.error('Failed to mark all notifications as read', error)
        return
      }

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      )
      setUnreadCount(0)

      logger.log('All notifications marked as read')
      toast.success('모든 알림을 읽음 처리했습니다')
    } catch (error) {
      logger.error('Error marking all notifications as read', error)
      toast.error('알림 처리 중 오류가 발생했습니다')
    }
  }, [supabase, user?.id])

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        logger.error('Failed to load notifications', error)
        return
      }

      const notifications = data || []
      setNotifications(notifications)
      setUnreadCount(notifications.filter(n => !n.read).length)

      logger.log('Notifications loaded', {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length
      })
    } catch (error) {
      logger.error('Error loading notifications', error)
    }
  }, [supabase, user?.id])

  // Setup realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    logger.log('Setting up realtime notification subscription', { userId: user.id })

    // Load initial notifications
    loadNotifications()

    // Setup realtime subscription with error handling
    let subscription: any = null

    try {
      subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
        const newNotification = payload.new as Notification

        logger.log('New notification received', {
          id: newNotification.id,
          type: newNotification.type,
          title: newNotification.title
        })

        // Add to notifications list
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)

        // Show toast notification
        showNotificationToast(newNotification)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const updatedNotification = payload.new as Notification

        setNotifications(prev =>
          prev.map(notif =>
            notif.id === updatedNotification.id
              ? updatedNotification
              : notif
          )
        )

        logger.log('Notification updated', { id: updatedNotification.id })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.log('Realtime notification subscription active')
        } else if (status === 'CLOSED') {
          logger.log('Realtime notification subscription closed')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          logger.error('Realtime notification subscription error:', status)
        } else {
          logger.warn('Realtime notification subscription status:', status)
        }
      })

    } catch (error) {
      logger.error('Error setting up realtime notification subscription:', error)
    }

    return () => {
      try {
        logger.log('Cleaning up realtime notification subscription')
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe()
        }
      } catch (error) {
        logger.error('Error cleaning up notification subscription:', error)
      }
    }
  }, [isAuthenticated, user?.id, supabase, loadNotifications, showNotificationToast])

  // Cleanup expired notifications
  useEffect(() => {
    const cleanupExpired = () => {
      const now = new Date()
      setNotifications(prev =>
        prev.filter(notif =>
          !notif.expires_at || new Date(notif.expires_at) > now
        )
      )
    }

    // Check every hour
    const interval = setInterval(cleanupExpired, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Expose notification functions globally for other components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.notificationSystem = {
        markAsRead,
        markAllAsRead,
        unreadCount,
        notifications: notifications.slice(0, 10) // Latest 10 for UI
      }
    }
  }, [markAsRead, markAllAsRead, unreadCount, notifications])

  // This component doesn't render anything visible
  // It just manages the realtime notification system
  return null
}

// Notification context for easier access
export const useRealtimeNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const updateFromGlobal = () => {
      if (typeof window !== 'undefined' && window.notificationSystem) {
        setUnreadCount(window.notificationSystem.unreadCount)
        setNotifications(window.notificationSystem.notifications)
      }
    }

    // Update immediately
    updateFromGlobal()

    // Update periodically
    const interval = setInterval(updateFromGlobal, 1000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = useCallback((id: string) => {
    if (typeof window !== 'undefined' && window.notificationSystem) {
      window.notificationSystem.markAsRead(id)
    }
  }, [])

  const markAllAsRead = useCallback(() => {
    if (typeof window !== 'undefined' && window.notificationSystem) {
      window.notificationSystem.markAllAsRead()
    }
  }, [])

  return {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead
  }
}

// Type augmentation for global notification system
declare global {
  interface Window {
    notificationSystem?: {
      markAsRead: (id: string) => void
      markAllAsRead: () => void
      unreadCount: number
      notifications: Notification[]
    }
  }
}