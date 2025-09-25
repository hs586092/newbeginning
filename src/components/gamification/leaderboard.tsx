'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GamificationService } from '@/lib/services/gamification-service'
import { LeaderboardEntry } from '@/types/database.types'
import { Trophy, Medal, Award, Crown, Star, RefreshCw } from 'lucide-react'
import Image from 'next/image'

interface LeaderboardProps {
  className?: string
  period?: 'all' | 'week' | 'month'
  limit?: number
  showUserRank?: boolean
  currentUserId?: string
}

export function Leaderboard({
  className = '',
  period = 'all',
  limit = 10,
  showUserRank = true,
  currentUserId
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  useEffect(() => {
    loadLeaderboard()
  }, [selectedPeriod])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const result = await GamificationService.getLeaderboard(limit, selectedPeriod)
      setEntries(result)
    } catch (error) {
      console.error('리더보드 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadLeaderboard()
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />
      default:
        return <Trophy className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 2:
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 3:
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-muted-foreground bg-background'
    }
  }

  const periodOptions = [
    { value: 'all', label: '전체' },
    { value: 'month', label: '월간' },
    { value: 'week', label: '주간' }
  ]

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            리더보드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            리더보드
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-1">
          {periodOptions.map(option => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod(option.value as any)}
              className="h-7 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${entry.user_id === currentUserId
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                  : getRankColor(entry.rank)
                }
                ${entry.rank <= 3 ? 'shadow-sm' : ''}
              `}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">
                <div className="flex items-center gap-1">
                  {getRankIcon(entry.rank)}
                  <span className={`text-sm font-bold ${
                    entry.rank <= 3 ? '' : 'text-muted-foreground'
                  }`}>
                    #{entry.rank}
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div className="relative">
                {entry.avatar_url ? (
                  <Image
                    src={entry.avatar_url}
                    alt={entry.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {entry.full_name?.[0] || entry.username[0]}
                  </div>
                )}

                {/* Crown for #1 */}
                {entry.rank === 1 && (
                  <div className="absolute -top-1 -right-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">
                    {entry.full_name || entry.username}
                  </h4>
                  {entry.user_id === currentUserId && (
                    <Badge variant="secondary" className="text-xs">
                      나
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>뱃지 {entry.badges_count}개</span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-sm">
                    {entry.total_points.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">포인트</div>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>아직 랭킹 데이터가 없습니다</p>
              <p className="text-sm">활동을 시작해서 첫 번째 순위에 도전해보세요!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}