'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessagingService } from '@/lib/services/messaging-service'
import { ConversationWithDetails, MessageWithProfile } from '@/types/database.types'
import { Send, MoreVertical, Users, Phone, Video, Smile, Paperclip } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'

interface ChatWindowProps {
  conversation: ConversationWithDetails
  currentUserId: string
  className?: string
}

export function ChatWindow({ conversation, currentUserId, className = '' }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    markAsRead()

    // Subscribe to new messages
    const subscription = MessagingService.subscribeToMessages(
      conversation.id,
      (message) => {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const result = await MessagingService.getConversationMessages(conversation.id)
      setMessages(result)
    } catch (error) {
      console.error('메시지 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    await MessagingService.markAsRead(conversation.id)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      const message = await MessagingService.sendMessage({
        conversationId: conversation.id,
        content: newMessage.trim()
      })

      if (message) {
        setNewMessage('')
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getConversationName = () => {
    if (conversation.name) return conversation.name

    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    )

    return otherParticipant?.profiles.full_name ||
           otherParticipant?.profiles.username ||
           '알 수 없는 사용자'
  }

  const getOtherParticipantAvatar = () => {
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    )
    return otherParticipant?.profiles.avatar_url
  }

  const isConsecutiveMessage = (currentMsg: MessageWithProfile, previousMsg?: MessageWithProfile) => {
    if (!previousMsg) return false
    return currentMsg.user_id === previousMsg.user_id &&
           new Date(currentMsg.created_at).getTime() - new Date(previousMsg.created_at).getTime() < 5 * 60 * 1000 // 5분 이내
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} flex flex-col`}>
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              {conversation.type === 'private' && getOtherParticipantAvatar() ? (
                <Image
                  src={getOtherParticipantAvatar()!}
                  alt="대화 상대"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {conversation.type === 'group' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    getConversationName()[0]
                  )}
                </div>
              )}
            </div>

            {/* Name and status */}
            <div>
              <h3 className="font-medium text-base">{getConversationName()}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {conversation.type === 'group' && (
                  <Badge variant="secondary" className="text-xs">
                    {conversation.participants.length}명
                  </Badge>
                )}
                <span>활성</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>메시지를 시작해보세요!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.user_id === currentUserId
              const isConsecutive = isConsecutiveMessage(message, messages[index - 1])

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    {!isOwn && !isConsecutive && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {message.profiles.full_name?.[0] || message.profiles.username[0]}
                      </div>
                    )}
                    {!isOwn && isConsecutive && (
                      <div className="w-8 h-8 flex-shrink-0" />
                    )}

                    {/* Message bubble */}
                    <div className={`${isOwn ? 'text-right' : 'text-left'}`}>
                      {/* Username (only for group chats and first message) */}
                      {!isOwn && conversation.type === 'group' && !isConsecutive && (
                        <div className="text-xs text-muted-foreground mb-1 px-3">
                          {message.profiles.full_name || message.profiles.username}
                        </div>
                      )}

                      {/* Message content */}
                      <div
                        className={`
                          px-3 py-2 rounded-lg inline-block
                          ${isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-muted text-foreground'
                          }
                        `}
                      >
                        {/* Reply indicator */}
                        {message.reply_to && (
                          <div className={`
                            text-xs opacity-70 border-l-2 pl-2 mb-1
                            ${isOwn ? 'border-white/30' : 'border-muted-foreground/30'}
                          `}>
                            {message.reply_to.profiles.username}: {message.reply_to.content.slice(0, 30)}...
                          </div>
                        )}

                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>

                        {/* Edited indicator */}
                        {message.is_edited && (
                          <span className="text-xs opacity-70 ml-2">(수정됨)</span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className={`
                        text-xs text-muted-foreground mt-1 px-1
                        ${isOwn ? 'text-right' : 'text-left'}
                      `}>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: ko
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full p-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={1}
              style={{ maxHeight: '100px' }}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}