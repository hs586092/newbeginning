'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserProfileCard } from './user-profile-card'
import { FollowService } from '@/lib/services/follow-service'
import { UserProfile } from '@/types/database.types'
import { Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RecommendedUsersSectionProps {
  className?: string
}

export function RecommendedUsersSection({ className = '' }: RecommendedUsersSectionProps) {
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendedUsers()
  }, [])

  const loadRecommendedUsers = async () => {
    try {
      setLoading(true)
      const users = await FollowService.getRecommendedUsers(5)

      // UserProfile 형태로 변환 (팔로우 수 기본값 추가)
      const userProfiles: UserProfile[] = users.map(user => ({
        ...user,
        followers_count: 0,
        following_count: 0,
        is_following: false,
        is_followed_by: false
      }))

      setRecommendedUsers(userProfiles)
    } catch (error) {
      console.error('추천 사용자 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadRecommendedUsers()
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            비슷한 육아맘들
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            비슷한 육아맘들
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
      <CardContent className="space-y-3">
        {recommendedUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">추천할 사용자가 없습니다</p>
          </div>
        ) : (
          recommendedUsers.map((user) => (
            <UserProfileCard
              key={user.id}
              profile={user}
              compact={true}
              showFollowButton={true}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}