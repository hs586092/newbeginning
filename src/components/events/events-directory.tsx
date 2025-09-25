'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EventsService } from '@/lib/services/events-service'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  Wifi,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'
import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  location?: string
  virtual_link?: string
  start_date: string
  end_date: string
  max_participants?: number
  current_participants: number
  cost?: number
  created_by: string
  created_by_profile?: {
    username: string
    full_name: string
    avatar_url?: string
  }
  user_participation?: {
    status: 'attending' | 'maybe' | 'waitlist'
  }
}

interface EventsDirectoryProps {
  className?: string
  showMyEvents?: boolean
  currentUserId?: string
}

export function EventsDirectory({
  className = '',
  showMyEvents = false,
  currentUserId
}: EventsDirectoryProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState(showMyEvents ? 'my-events' : 'all-events')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    loadEvents()
  }, [activeTab, selectedType])

  const loadEvents = async () => {
    try {
      setLoading(true)
      let eventData: Event[]

      if (activeTab === 'my-events') {
        // This would need to be implemented in the EventsService
        // For now, we'll filter events where user is participating
        const allEvents = await EventsService.getEvents({
          eventType: selectedType !== 'all' ? selectedType : undefined
        })
        eventData = allEvents.filter(event => event.user_participation)
      } else {
        eventData = await EventsService.getEvents({
          eventType: selectedType !== 'all' ? selectedType : undefined,
          upcoming: activeTab === 'upcoming'
        })
      }

      // Filter by search query if provided
      if (searchQuery) {
        eventData = eventData.filter(event =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setEvents(eventData)
    } catch (error) {
      console.error('이벤트 로드 오류:', error)
      toast.error('이벤트를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadEvents()
    setRefreshing(false)
    toast.success('이벤트 목록이 새로고침되었습니다')
  }

  const handleJoinEvent = async (eventId: string) => {
    try {
      const success = await EventsService.joinEvent(eventId, 'attending')
      if (success) {
        toast.success('이벤트 참가 신청이 완료되었습니다')
        loadEvents()
      } else {
        toast.error('이벤트 참가 신청에 실패했습니다')
      }
    } catch (error) {
      console.error('이벤트 참가 오류:', error)
      toast.error('이벤트 참가 신청에 실패했습니다')
    }
  }

  const handleLeaveEvent = async (eventId: string) => {
    try {
      const success = await EventsService.leaveEvent(eventId)
      if (success) {
        toast.success('이벤트 참가가 취소되었습니다')
        loadEvents()
      } else {
        toast.error('이벤트 참가 취소에 실패했습니다')
      }
    } catch (error) {
      console.error('이벤트 참가 취소 오류:', error)
      toast.error('이벤트 참가 취소에 실패했습니다')
    }
  }

  const eventTypes = [
    { value: 'all', label: '전체' },
    { value: 'playdate', label: '놀이 모임' },
    { value: 'workshop', label: '워크샵' },
    { value: 'meetup', label: '모임' },
    { value: 'support_group', label: '지원 그룹' },
    { value: 'online_class', label: '온라인 클래스' }
  ]

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            이벤트 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
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
            <Calendar className="w-5 h-5" />
            이벤트
            <Badge variant="secondary">{events.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              이벤트 생성
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="이벤트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              variant="outline"
              onClick={loadEvents}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              필터
            </Button>
          </div>

          {/* Event Type Filter */}
          <div className="flex flex-wrap gap-2">
            {eventTypes.map(type => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className="text-xs"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showMyEvents ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-events">참가 중인 이벤트</TabsTrigger>
              <TabsTrigger value="all-events">모든 이벤트</TabsTrigger>
            </TabsList>

            <TabsContent value="my-events" className="mt-4">
              <EventsList
                events={events}
                currentUserId={currentUserId}
                onJoinEvent={handleJoinEvent}
                onLeaveEvent={handleLeaveEvent}
              />
            </TabsContent>

            <TabsContent value="all-events" className="mt-4">
              <EventsList
                events={events}
                currentUserId={currentUserId}
                onJoinEvent={handleJoinEvent}
                onLeaveEvent={handleLeaveEvent}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="text-xs">
                예정된 이벤트
              </TabsTrigger>
              <TabsTrigger value="all-events" className="text-xs">
                모든 이벤트
              </TabsTrigger>
              <TabsTrigger value="my-events" className="text-xs">
                참가 이벤트
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4">
              <EventsList
                events={events}
                currentUserId={currentUserId}
                onJoinEvent={handleJoinEvent}
                onLeaveEvent={handleLeaveEvent}
              />
            </TabsContent>

            <TabsContent value="all-events" className="mt-4">
              <EventsList
                events={events}
                currentUserId={currentUserId}
                onJoinEvent={handleJoinEvent}
                onLeaveEvent={handleLeaveEvent}
              />
            </TabsContent>

            <TabsContent value="my-events" className="mt-4">
              <EventsList
                events={events.filter(event => event.user_participation)}
                currentUserId={currentUserId}
                onJoinEvent={handleJoinEvent}
                onLeaveEvent={handleLeaveEvent}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

interface EventsListProps {
  events: Event[]
  currentUserId?: string
  onJoinEvent: (eventId: string) => void
  onLeaveEvent: (eventId: string) => void
}

function EventsList({ events, currentUserId, onJoinEvent, onLeaveEvent }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          이벤트가 없습니다
        </h3>
        <p className="text-muted-foreground mb-4">
          새로운 이벤트가 생성되면 여기에 표시됩니다
        </p>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          첫 번째 이벤트 만들기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <div
          key={event.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-4">
            {/* Event Date */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0">
              <div className="text-xs font-medium">
                {format(new Date(event.start_date), 'MMM', { locale: ko })}
              </div>
              <div className="text-lg font-bold">
                {format(new Date(event.start_date), 'dd')}
              </div>
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-base line-clamp-1">
                      {event.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(event.start_date), 'MM월 dd일 HH:mm', { locale: ko })}
                    </div>

                    {event.location ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    ) : event.virtual_link ? (
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        온라인
                      </div>
                    ) : null}

                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.current_participants}
                      {event.max_participants && `/${event.max_participants}`}명
                    </div>

                    {event.cost && event.cost > 0 && (
                      <div className="text-green-600 font-medium">
                        {event.cost.toLocaleString()}원
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                      {event.created_by_profile?.avatar_url ? (
                        <Image
                          src={event.created_by_profile.avatar_url}
                          alt={event.created_by_profile.full_name || event.created_by_profile.username}
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">
                          {(event.created_by_profile?.full_name || event.created_by_profile?.username || 'U').charAt(0)}
                        </span>
                      )}
                    </div>
                    <span>
                      {event.created_by_profile?.full_name || event.created_by_profile?.username} 주최
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(event.start_date), {
                        addSuffix: true,
                        locale: ko
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  {event.user_participation ? (
                    <>
                      <Badge
                        variant="default"
                        className={`text-xs ${
                          event.user_participation.status === 'attending' ? 'bg-green-500' :
                          event.user_participation.status === 'maybe' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}
                      >
                        {event.user_participation.status === 'attending' ? '참가 확정' :
                         event.user_participation.status === 'maybe' ? '참가 고민 중' :
                         '대기 중'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLeaveEvent(event.id)}
                        className="text-xs"
                      >
                        참가 취소
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onJoinEvent(event.id)}
                      disabled={event.max_participants ? event.current_participants >= event.max_participants : false}
                      className="text-xs"
                    >
                      {event.max_participants && event.current_participants >= event.max_participants
                        ? '정원 마감'
                        : '참가 신청'}
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" className="text-xs">
                    자세히 보기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}