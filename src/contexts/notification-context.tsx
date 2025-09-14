'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// 알림 타입 정의
export interface Notification {
  id: string
  type: 'comment' | 'like' | 'post' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  data?: {
    postId?: string
    commentId?: string
    userId?: string
    username?: string
  }
}

// 토스트 알림 타입
export interface ToastNotification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  // 영구 알림 (데이터베이스 저장)
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearAllNotifications: () => void

  // 토스트 알림 (임시)
  toasts: ToastNotification[]
  showToast: (toast: Omit<ToastNotification, 'id'>) => void
  removeToast: (toastId: string) => void

  // 실시간 카운터
  realtimeCounts: {
    [postId: string]: {
      likes: number
      comments: number
    }
  }
  updateRealtimeCount: (postId: string, type: 'likes' | 'comments', count: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [realtimeCounts, setRealtimeCounts] = useState<{[postId: string]: {likes: number, comments: number}}>({})

  // 영구 알림 관리
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // 최대 50개까지만 유지
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }, [])

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // 토스트 알림 관리
  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      duration: toast.duration || 5000
    }

    setToasts(prev => [...prev, newToast])

    // 자동 제거
    setTimeout(() => {
      removeToast(newToast.id)
    }, newToast.duration)
  }, [])

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId))
  }, [])

  // 실시간 카운터 관리
  const updateRealtimeCount = useCallback((postId: string, type: 'likes' | 'comments', count: number) => {
    setRealtimeCounts(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [type]: count
      }
    }))
  }, [])

  const unreadCount = notifications.filter(notif => !notif.read).length

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    toasts,
    showToast,
    removeToast,
    realtimeCounts,
    updateRealtimeCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}