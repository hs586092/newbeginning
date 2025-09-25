'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { ActivityService } from '@/lib/services/activity-service'
import { ActivityFeedItem } from '@/types/database.types'
import { Heart, MessageCircle, FileText, UserPlus, Clock, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'

const activityIcons = {
  post_created: FileText,
  comment_added: MessageCircle,
  post_liked: Heart,
  user_followed: UserPlus
}

const activityColors = {
  post_created: 'text-blue-500',
  comment_added: 'text-green-500',
  post_liked: 'text-red-500',
  user_followed: 'text-purple-500'
}

const activityMessages = {
  post_created: '새 게시글을 작성했습니다',
  comment_added: '댓글을 작성했습니다',
  post_liked: '게시글에 좋아요를 눌렀습니다',
  user_followed: '새로운 사용자를 팔로우했습니다'
}

interface ActivityFeedProps {
  className?: string
  variant?: 'following' | 'public'
  maxHeight?: string
}

export function ActivityFeed({
  className = '',
  variant = 'following',
  maxHeight = "400px"
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [variant])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const data = variant === 'following'
        ? await ActivityService.getFollowingActivityFeed(20, 0)
        : await ActivityService.getPublicActivityFeed(20, 0)

      setActivities(data)
    } catch (error) {
      console.error('활동 피드 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadActivities()
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            {variant === 'following' ? '팔로우 활동' : '최근 활동'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            {variant === 'following' ? '팔로우 활동' : '최근 활동'}
            <Badge variant="secondary" className="text-xs">
              {activities.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto" style={{ maxHeight }}>
          {activities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">
                {variant === 'following' ? '팔로우한 사용자의 활동이 없습니다' : '최근 활동이 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.activity_type]
                const iconColor = activityColors[activity.activity_type]

                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    {/* 사용자 아바타 */}
                    <div className="relative">
                      {activity.user_profile?.avatar_url ? (
                        <Image
                          src={activity.user_profile.avatar_url}
                          alt={activity.user_profile.username || '사용자'}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {activity.user_profile?.full_name?.[0] || activity.user_profile?.username?.[0] || '?'}
                        </div>
                      )}

                      {/* 활동 타입 아이콘 */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center border border-gray-200">
                        <Icon className={`w-2.5 h-2.5 ${iconColor}`} />
                      </div>
                    </div>

                    {/* 활동 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {activity.user_profile?.full_name || activity.user_profile?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activityMessages[activity.activity_type]}
                        </span>
                      </div>

                      {/* 타겟 정보 */}
                      {activity.target_post && (
                        <div className="text-xs text-muted-foreground bg-gray-100 rounded px-2 py-1 mb-2">
                          📝 {activity.target_post.title}
                        </div>
                      )}

                      {activity.target_user && activity.activity_type === 'user_followed' && (
                        <div className="text-xs text-muted-foreground bg-gray-100 rounded px-2 py-1 mb-2">
                          👤 {activity.target_user.full_name || activity.target_user.username}
                        </div>
                      )}

                      {/* 시간 */}
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                          locale: ko
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 간단한 활동 요약 컴포넌트
interface ActivitySummaryProps {
  className?: string
}

export function ActivitySummary({ className = '' }: ActivitySummaryProps) {
  const [summary, setSummary] = useState<{ type: string; count: number; description: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      const data = await ActivityService.getRecentActivity(5)
      setSummary(data)
    } catch (error) {
      console.error('활동 요약 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || summary.length === 0) {
    return null
  }

  return (
    <div className={`bg-green-50 rounded-lg p-3 border border-green-200 ${className}`}>
      <h4 className="font-semibold text-green-900 text-sm mb-2 flex items-center gap-1">
        📊 오늘의 활동
      </h4>
      <div className="space-y-1">
        {summary.map((item) => (
          <div key={item.type} className="flex items-center justify-between text-xs">
            <span className="text-green-800">{item.description}</span>
            <Badge variant="secondary" className="text-xs">
              {item.count}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}