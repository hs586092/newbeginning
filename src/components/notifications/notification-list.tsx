'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { NotificationService } from '@/lib/services/notification-service'
import { NotificationWithProfile } from '@/types/database.types'
import { UserPlus, Heart, MessageCircle, Reply, AtSign, Check, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'

interface NotificationListProps {
  onMarkAllAsRead?: () => void
  maxHeight?: string
}

const notificationIcons = {
  follow: UserPlus,
  like: Heart,
  comment: MessageCircle,
  reply: Reply,
  mention: AtSign
}

const notificationColors = {
  follow: 'text-blue-500',
  like: 'text-red-500',
  comment: 'text-green-500',
  reply: 'text-purple-500',
  mention: 'text-orange-500'
}

export function NotificationList({ onMarkAllAsRead, maxHeight = "400px" }: NotificationListProps) {
  const [notifications, setNotifications] = useState<NotificationWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await NotificationService.getNotifications(20, 0)
      setNotifications(data)
    } catch (error) {
      console.error('알림 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId)
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const handleDelete = async (notificationId: string) => {
    await NotificationService.deleteNotification(notificationId)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleMarkAllAsReadLocal = async () => {
    await NotificationService.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onMarkAllAsRead?.()
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">알림</h2>
          <Badge variant="secondary">
            {notifications.filter(n => !n.read).length}
          </Badge>
        </div>

        {notifications.some(n => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsReadLocal}
            className="text-blue-600 hover:text-blue-700"
          >
            <Check className="w-4 h-4 mr-1" />
            모두 읽음
          </Button>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="overflow-y-auto p-0" style={{ maxHeight }}>
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p>새로운 알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type]
              const iconColor = notificationColors[notification.type]

              return (
                <div
                  key={notification.id}
                  className={`
                    p-4 hover:bg-gray-50 transition-colors group
                    ${!notification.read ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* 사용자 아바타 또는 아이콘 */}
                    <div className="relative">
                      {notification.from_user?.avatar_url ? (
                        <Image
                          src={notification.from_user.avatar_url}
                          alt={notification.from_user.username || '사용자'}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {notification.from_user?.full_name?.[0] || notification.from_user?.username?.[0] || '?'}
                        </div>
                      )}

                      {/* 알림 타입 아이콘 */}
                      <div className={`
                        absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white
                        flex items-center justify-center border-2 border-white
                      `}>
                        <Icon className={`w-3 h-3 ${iconColor}`} />
                      </div>
                    </div>

                    {/* 알림 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </p>
                        </div>

                        {/* 읽지 않음 표시 */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}