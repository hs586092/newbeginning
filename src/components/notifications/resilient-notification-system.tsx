/**
 * 🛡️ Resilient Realtime Notification System
 * WebSocket with Polling Fallback + Error Boundaries
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { subscribeToRealtime, unsubscribeFromRealtime, getRealtimeConnectionStatus } from '@/lib/realtime/resilient-realtime-manager'
import { getSupabaseClient, getConnectionHealth } from '@/lib/supabase/client-factory'
import { toast } from 'sonner'
import { Bell, Heart, MessageCircle, UserPlus, Award, WifiOff, Wifi } from 'lucide-react'

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

interface ConnectionStatus {
  mode: 'websocket' | 'polling' | 'offline'
  isHealthy: boolean
  lastUpdate?: Date
}

export function ResilientNotificationSystem() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    mode: 'offline',
    isHealthy: false
  })

  // Show notification toast with resilient design
  const showNotificationToast = useCallback((notification: Notification) => {
    const icons = {
      like: '💕',
      comment: '💬',
      follow: '👥',
      mention: '📢',
      achievement: '🏆',
      system: '🔔'
    }

    try {
      toast.success(
        `${icons[notification.type]} ${notification.title}`,
        {
          description: notification.message,
          duration: 4000,
          action: {
            label: '확인',
            onClick: () => markAsRead(notification.id)
          }
        }
      )
    } catch (error) {
      console.error('❌ Toast notification failed:', error)
    }
  }, [])

  // Load initial notifications with error handling
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)

      console.log(`✅ Loaded ${data?.length || 0} notifications`)

    } catch (error: any) {
      console.error('❌ Error loading notifications:', error.message)

      // Fallback: Use cached/mock data if available
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user?.id])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (!error) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

    } catch (error: any) {
      console.error('❌ Error marking notification as read:', error.message)
    }
  }, [])

  // Handle realtime notification updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    try {
      console.log('📡 Notification update received:', payload)

      const { eventType, new: newNotification } = payload

      if (eventType === 'INSERT' && newNotification) {
        // New notification
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)])
        setUnreadCount(prev => prev + 1)

        showNotificationToast(newNotification)

        // Update connection status
        setConnectionStatus(prev => ({
          ...prev,
          lastUpdate: new Date()
        }))

      } else if (eventType === 'UPDATE' && newNotification) {
        // Notification updated (e.g., marked as read)
        setNotifications(prev =>
          prev.map(n => n.id === newNotification.id ? newNotification : n)
        )
      }

    } catch (error: any) {
      console.error('❌ Error handling realtime update:', error.message)
    }
  }, [showNotificationToast])

  // Handle realtime errors
  const handleRealtimeError = useCallback((error: Error) => {
    console.error('❌ Realtime notification error:', error.message)

    setConnectionStatus(prev => ({
      ...prev,
      isHealthy: false
    }))

    // Show user-friendly error toast
    toast.error('알림 연결에 문제가 발생했습니다', {
      description: '잠시 후 자동으로 다시 연결됩니다.',
      duration: 3000
    })
  }, [])

  // Monitor connection health
  useEffect(() => {
    const healthInterval = setInterval(() => {
      try {
        // Check Realtime connection status
        const realtimeStatus = getRealtimeConnectionStatus()

        // Check Supabase client health
        const clientHealth = getConnectionHealth()

        const newStatus: ConnectionStatus = {
          mode: realtimeStatus.status === 'connected' ? 'websocket' :
                realtimeStatus.status === 'polling' ? 'polling' : 'offline',
          isHealthy: clientHealth.isHealthy && realtimeStatus.status !== 'failed',
          lastUpdate: connectionStatus.lastUpdate
        }

        setConnectionStatus(newStatus)

      } catch (error) {
        console.error('❌ Health check failed:', error)
        setConnectionStatus(prev => ({
          ...prev,
          isHealthy: false
        }))
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(healthInterval)
  }, [connectionStatus.lastUpdate])

  // Setup realtime subscription with resilient manager
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    let mounted = true

    const setupNotifications = async () => {
      try {
        console.log('🔄 Setting up resilient notification subscription...')

        // Load initial notifications
        await loadNotifications()

        // Subscribe to realtime updates with resilient manager
        await subscribeToRealtime(
          'user-notifications',
          'notifications',
          handleRealtimeUpdate,
          `user_id=eq.${user.id}`,
          handleRealtimeError
        )

        if (mounted) {
          console.log('✅ Resilient notification system initialized')
          setConnectionStatus(prev => ({
            ...prev,
            isHealthy: true
          }))
        }

      } catch (error: any) {
        if (mounted) {
          console.error('❌ Failed to setup notification system:', error.message)
          handleRealtimeError(error)
        }
      }
    }

    setupNotifications()

    return () => {
      mounted = false
      unsubscribeFromRealtime('user-notifications')
      console.log('🧹 Notification system cleanup completed')
    }

  }, [isAuthenticated, user?.id, loadNotifications, handleRealtimeUpdate, handleRealtimeError])

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Connection Status Indicator */}
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        {connectionStatus.mode === 'websocket' && connectionStatus.isHealthy && (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi size={12} />
            <span>실시간</span>
          </div>
        )}
        {connectionStatus.mode === 'polling' && (
          <div className="flex items-center gap-1 text-yellow-600">
            <Bell size={12} />
            <span>폴링 모드</span>
          </div>
        )}
        {!connectionStatus.isHealthy && (
          <div className="flex items-center gap-1 text-red-600">
            <WifiOff size={12} />
            <span>연결 불안정</span>
          </div>
        )}
      </div>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <div className="relative">
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
          <Bell className="w-6 h-6 text-gray-600" />
        </div>
      )}

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div>Mode: {connectionStatus.mode}</div>
          <div>Healthy: {connectionStatus.isHealthy ? '✅' : '❌'}</div>
          <div>Notifications: {notifications.length}</div>
          <div>Unread: {unreadCount}</div>
          {connectionStatus.lastUpdate && (
            <div>Last: {connectionStatus.lastUpdate.toLocaleTimeString()}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResilientNotificationSystem