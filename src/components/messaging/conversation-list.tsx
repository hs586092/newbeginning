'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessagingService } from '@/lib/services/messaging-service'
import { ConversationWithDetails } from '@/types/database.types'
import { MessageCircle, Users, Plus, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationWithDetails) => void
  selectedConversationId?: string
  currentUserId: string
  className?: string
}

export function ConversationList({
  onSelectConversation,
  selectedConversationId,
  currentUserId,
  className = ''
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()

    // Subscribe to conversation updates
    const subscription = MessagingService.subscribeToConversations((updatedConversations) => {
      setConversations(updatedConversations)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadConversations = async () => {
    try {
      const result = await MessagingService.getUserConversations()
      setConversations(result)
    } catch (error) {
      console.error('대화 목록 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()

    // Search by conversation name
    if (conversation.name?.toLowerCase().includes(searchLower)) return true

    // Search by participant names
    return conversation.participants.some(participant =>
      participant.profiles.username.toLowerCase().includes(searchLower) ||
      participant.profiles.full_name?.toLowerCase().includes(searchLower)
    )
  })

  const getConversationName = (conversation: ConversationWithDetails) => {
    if (conversation.name) return conversation.name

    // For private conversations, show other participant's name
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    )

    return otherParticipant?.profiles.full_name ||
           otherParticipant?.profiles.username ||
           '알 수 없는 사용자'
  }

  const getConversationAvatar = (conversation: ConversationWithDetails) => {
    if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(
        p => p.user_id !== currentUserId
      )
      return otherParticipant?.profiles.avatar_url
    }
    return null
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            메시지
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            메시지
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            새 대화
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="대화 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm">
                {searchQuery ? '검색 결과가 없습니다' : '메시지가 없습니다'}
              </p>
              {!searchQuery && (
                <p className="text-xs mt-1">
                  새로운 대화를 시작해보세요!
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`
                    p-4 cursor-pointer transition-colors hover:bg-muted/50
                    ${selectedConversationId === conversation.id ? 'bg-muted' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      {getConversationAvatar(conversation) ? (
                        <Image
                          src={getConversationAvatar(conversation)!}
                          alt="대화 상대"
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {conversation.type === 'group' ? (
                            <Users className="w-6 h-6" />
                          ) : (
                            getConversationName(conversation)[0]
                          )}
                        </div>
                      )}

                      {/* Unread indicator */}
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {getConversationName(conversation)}
                        </h4>
                        {conversation.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Last message preview */}
                        {conversation.last_message ? (
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {conversation.last_message.user_id === currentUserId && '나: '}
                            {conversation.last_message.message_type === 'image' ? '📷 이미지' :
                             conversation.last_message.message_type === 'file' ? '📎 파일' :
                             conversation.last_message.content}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic flex-1">
                            메시지를 시작해보세요
                          </p>
                        )}

                        {/* Group indicator */}
                        {conversation.type === 'group' && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.participants.length}명
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}