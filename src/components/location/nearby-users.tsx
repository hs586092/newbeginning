'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LocationService, NearbyUser } from '@/lib/services/location-service'
import {
  MapPin,
  Users,
  Navigation,
  RefreshCw,
  MessageCircle,
  UserPlus,
  Star
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface NearbyUsersProps {
  className?: string
  limit?: number
  compact?: boolean
}

export function NearbyUsers({ className = '', limit = 10, compact = false }: NearbyUsersProps) {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userLocation, setUserLocation] = useState<string>('')

  useEffect(() => {
    loadNearbyUsers()
  }, [limit])

  const loadNearbyUsers = async () => {
    try {
      setLoading(true)
      const users = await LocationService.getNearbyUsers(limit)
      setNearbyUsers(users)

      // Get current user location for display
      const currentLocation = await LocationService.getCurrentLocation()
      if (currentLocation) {
        setUserLocation(`${currentLocation.city} ${currentLocation.district}`)
      }
    } catch (error) {
      console.error('주변 사용자 로드 오류:', error)
      toast.error('주변 사용자를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadNearbyUsers()
    setRefreshing(false)
    toast.success('주변 사용자 목록이 새로고침되었습니다')
  }

  const handleGetLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation()
      if (location) {
        const locationString = `${location.city} ${location.district}`
        const success = await LocationService.updateUserLocation(locationString)

        if (success) {
          setUserLocation(locationString)
          toast.success('위치가 업데이트되었습니다')
          loadNearbyUsers()
        } else {
          toast.error('위치 업데이트에 실패했습니다')
        }
      } else {
        toast.error('위치 정보를 가져올 수 없습니다')
      }
    } catch (error) {
      toast.error('위치 권한을 허용해주세요')
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            주변 사용자
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4" />
              주변 사용자
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {userLocation && (
            <p className="text-xs text-muted-foreground">
              📍 {userLocation} 주변
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {nearbyUsers.length === 0 ? (
            <div className="text-center py-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-muted-foreground mb-2">
                주변 사용자가 없습니다
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                className="flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                위치 설정
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyUsers.slice(0, 3).map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name || user.username}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium">
                        {(user.full_name || user.username).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.full_name || user.username}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.distance}km 떨어짐
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              주변 사용자
              <Badge variant="secondary">{nearbyUsers.length}</Badge>
            </CardTitle>
            {userLocation && (
              <p className="text-sm text-muted-foreground mt-1">
                📍 {userLocation} 주변
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
            >
              <Navigation className="w-4 h-4 mr-1" />
              위치 업데이트
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {nearbyUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              주변 사용자가 없습니다
            </h3>
            <p className="text-muted-foreground mb-4">
              위치를 설정하면 주변 사용자를 찾을 수 있습니다
            </p>
            <Button onClick={handleGetLocation} className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              위치 설정하기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {nearbyUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.full_name || user.username}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-medium">
                      {(user.full_name || user.username).charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">
                      {user.full_name || user.username}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {user.distance}km
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {user.bio || '자기소개가 없습니다'}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    {user.parenting_stage && (
                      <Badge variant="outline" className="text-xs">
                        {user.parenting_stage}
                      </Badge>
                    )}
                    {user.location_info && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {user.location_info.city}
                      </div>
                    )}
                    {user.user_points && user.user_points.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3" />
                        {user.user_points[0].total_points}점
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <UserPlus className="w-3 h-3 mr-1" />
                      팔로우
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      메시지
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}