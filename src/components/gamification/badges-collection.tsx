'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GamificationService } from '@/lib/services/gamification-service'
import { BadgeWithProgress } from '@/types/database.types'
import { Award, Star, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface BadgesCollectionProps {
  userId: string
  className?: string
  compact?: boolean
  showProgress?: boolean
}

const rarityColors = {
  common: 'bg-gray-100 border-gray-300 text-gray-700',
  rare: 'bg-blue-100 border-blue-300 text-blue-700',
  epic: 'bg-purple-100 border-purple-300 text-purple-700',
  legendary: 'bg-yellow-100 border-yellow-300 text-yellow-700'
}

export function BadgesCollection({
  userId,
  className = '',
  compact = false,
  showProgress = true
}: BadgesCollectionProps) {
  const [badges, setBadges] = useState<BadgeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadUserBadges()
  }, [userId])

  const loadUserBadges = async () => {
    try {
      const result = await GamificationService.getUserBadges(userId)
      setBadges(result)
    } catch (error) {
      console.error('뱃지 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'posting', name: '포스팅' },
    { id: 'engagement', name: '참여' },
    { id: 'social', name: '소셜' },
    { id: 'milestone', name: '마일스톤' },
    { id: 'special', name: '특별' }
  ]

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : badges.filter(badge => badge.category === selectedCategory)

  const earnedBadges = badges.filter(badge => badge.earned)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            뱃지 컬렉션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mb-2" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Award className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-medium">{earnedBadges.length}개 획득</span>
        <div className="flex -space-x-1">
          {earnedBadges.slice(0, 3).map((badge, index) => (
            <div
              key={badge.id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs border-2 border-white"
              title={badge.name}
            >
              {badge.icon}
            </div>
          ))}
          {earnedBadges.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs border-2 border-white">
              +{earnedBadges.length - 3}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            뱃지 컬렉션
          </div>
          <Badge variant="secondary">
            {earnedBadges.length}/{badges.length}
          </Badge>
        </CardTitle>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-7 text-xs"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBadges.map(badge => (
            <div
              key={badge.id}
              className={`
                relative p-3 rounded-lg border-2 transition-all hover:shadow-md
                ${badge.earned
                  ? rarityColors[badge.rarity]
                  : 'bg-gray-50 border-gray-200 opacity-60'
                }
              `}
            >
              {/* Badge icon */}
              <div className="text-center mb-2">
                <div className={`
                  w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg
                  ${badge.earned
                    ? 'bg-white shadow-sm'
                    : 'bg-gray-200'
                  }
                `}>
                  {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
                </div>
              </div>

              {/* Badge info */}
              <div className="text-center">
                <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {badge.description}
                </p>

                {/* Earned date */}
                {badge.earned && badge.earned_at && (
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(badge.earned_at), {
                      addSuffix: true,
                      locale: ko
                    })} 획득
                  </div>
                )}

                {/* Progress bar for unearned badges */}
                {!badge.earned && showProgress && badge.progress !== undefined && (
                  <div className="mt-2">
                    <Progress
                      value={(badge.progress / badge.requirement_value) * 100}
                      className="h-1"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {badge.progress}/{badge.requirement_value}
                    </div>
                  </div>
                )}

                {/* Points reward */}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-600">
                    +{badge.points_reward}
                  </span>
                </div>

                {/* Rarity indicator */}
                <Badge
                  variant="outline"
                  className="text-xs mt-1"
                  style={{
                    borderColor: badge.rarity === 'legendary' ? '#fbbf24' :
                                 badge.rarity === 'epic' ? '#8b5cf6' :
                                 badge.rarity === 'rare' ? '#3b82f6' : '#6b7280'
                  }}
                >
                  {badge.rarity}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>이 카테고리에는 뱃지가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}