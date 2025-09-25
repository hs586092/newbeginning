'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GamificationService } from '@/lib/services/gamification-service'
import { Trophy, Star, TrendingUp } from 'lucide-react'

interface PointsDisplayProps {
  userId: string
  className?: string
  compact?: boolean
}

export function PointsDisplay({ userId, className = '', compact = false }: PointsDisplayProps) {
  const [points, setPoints] = useState(0)
  const [rank, setRank] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserPoints()
  }, [userId])

  const loadUserPoints = async () => {
    try {
      const result = await GamificationService.getUserPoints(userId)
      if (result) {
        setPoints(result.points)
        setRank(result.rank)
      }
    } catch (error) {
      console.error('포인트 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-sm">{points.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-muted-foreground">#{rank}</span>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          나의 포인트
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {points.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">포인트</div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            <span className="text-sm">
              전체 랭킹 <span className="font-bold">#{rank}</span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">포인트 획득 방법:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>• 게시글 작성: +10</div>
              <div>• 댓글 작성: +5</div>
              <div>• 게시글 좋아요: +2</div>
              <div>• 팔로우: +3</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}