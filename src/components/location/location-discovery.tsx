'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LocationService } from '@/lib/services/location-service'
import {
  MapPin,
  Calendar,
  Users,
  Navigation,
  RefreshCw,
  Clock,
  Group,
  TrendingUp,
  Star
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

interface LocationDiscoveryProps {
  className?: string
}

export function LocationDiscovery({ className = '' }: LocationDiscoveryProps) {
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const [localGroups, setLocalGroups] = useState<any[]>([])
  const [popularLocations, setPopularLocations] = useState<{ location: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userLocation, setUserLocation] = useState<string>('')
  const [activeTab, setActiveTab] = useState('events')

  useEffect(() => {
    loadLocationContent()
  }, [])

  const loadLocationContent = async () => {
    try {
      setLoading(true)

      // Try to get current location
      const currentLocation = await LocationService.getCurrentLocation()
      if (currentLocation) {
        const locationString = `${currentLocation.city} ${currentLocation.district}`
        setUserLocation(locationString)
      }

      // Load location-based content
      const [events, groups, popular] = await Promise.all([
        LocationService.getLocalEvents(userLocation, 10),
        LocationService.getLocalGroups(userLocation, 8),
        LocationService.getPopularLocations(5)
      ])

      setLocalEvents(events)
      setLocalGroups(groups)
      setPopularLocations(popular)
    } catch (error) {
      console.error('지역 콘텐츠 로드 오류:', error)
      toast.error('지역 콘텐츠를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadLocationContent()
    setRefreshing(false)
    toast.success('지역 콘텐츠가 새로고침되었습니다')
  }

  const handleLocationUpdate = async () => {
    try {
      const location = await LocationService.getCurrentLocation()
      if (location) {
        const locationString = `${location.city} ${location.district}`
        const success = await LocationService.updateUserLocation(locationString)

        if (success) {
          setUserLocation(locationString)
          toast.success('위치가 업데이트되었습니다')
          loadLocationContent()
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
            지역 탐색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
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
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              지역 탐색
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
              onClick={handleLocationUpdate}
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              이벤트
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-1 text-xs">
              <Group className="w-3 h-3" />
              그룹
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3" />
              인기 지역
            </TabsTrigger>
          </TabsList>

          {/* Local Events */}
          <TabsContent value="events" className="mt-4">
            <div className="space-y-3">
              {localEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm mb-2">주변에 예정된 이벤트가 없습니다</p>
                  {!userLocation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLocationUpdate}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      위치 설정
                    </Button>
                  )}
                </div>
              ) : (
                localEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {event.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.start_date), 'MM월 dd일 HH:mm', { locale: ko })}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.current_participants}명 참가
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            참가 신청
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {event.profiles?.full_name || event.profiles?.username} 주최
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Local Groups */}
          <TabsContent value="groups" className="mt-4">
            <div className="space-y-3">
              {localGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Group className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm mb-2">주변에 활동 중인 그룹이 없습니다</p>
                  {!userLocation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLocationUpdate}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      위치 설정
                    </Button>
                  )}
                </div>
              ) : (
                localGroups.map(group => (
                  <div
                    key={group.id}
                    className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-green-500 flex items-center justify-center text-white flex-shrink-0">
                        {group.cover_image ? (
                          <Image
                            src={group.cover_image}
                            alt={group.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Group className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {group.name}
                          </h4>
                          <Button size="sm" variant="outline" className="text-xs">
                            가입
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {group.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.member_count}명
                          </div>
                          {group.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {group.location}
                            </div>
                          )}
                          {group.recent_activity > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              최근 활동 {group.recent_activity}건
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Popular Locations */}
          <TabsContent value="popular" className="mt-4">
            <div className="space-y-3">
              {popularLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">인기 지역 정보가 없습니다</p>
                </div>
              ) : (
                popularLocations.map((location, index) => (
                  <div
                    key={location.location}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {location.location}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {location.count}명
                          </Badge>
                          <Star className="w-3 h-3 text-orange-500" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        활성 사용자 {location.count}명
                      </p>
                    </div>

                    <Button variant="ghost" size="sm" className="text-xs">
                      탐색
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}