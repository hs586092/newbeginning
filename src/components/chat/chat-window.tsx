/**
 * 💬 채팅 윈도우 메인 컴포넌트 (Compound Component Pattern)
 * - 모듈형 구성
 * - 상태 관리 분리
 * - 재사용 가능한 UI
 * - 접근성 고려
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, Smile, MoreVertical, X, Search } from 'lucide-react'
import { chatService } from '@/lib/chat/chat-service'
import { chatRealtimeClient } from '@/lib/chat/realtime-client'
import type { ChatMessage, ChatRoom } from '@/lib/chat/realtime-client'

// 🎯 채팅 윈도우 상태 타입
interface ChatWindowState {
  messages: ChatMessage[]
  currentRoom: ChatRoom | null
  isLoading: boolean
  isTyping: boolean
  typingUsers: string[]
  error: string | null
}

// 📝 메시지 입력 상태
interface MessageInputState {
  content: string
  replyTo: ChatMessage | null
  attachments: File[]
  isSubmitting: boolean
}

// 💬 채팅 윈도우 Props
interface ChatWindowProps {
  roomId: string
  onClose?: () => void
  className?: string
  height?: string
}

export default function ChatWindow({ 
  roomId, 
  onClose, 
  className = '',
  height = '600px'
}: ChatWindowProps) {
  
  // 🏪 상태 관리
  const [chatState, setChatState] = useState<ChatWindowState>({
    messages: [],
    currentRoom: null,
    isLoading: true,
    isTyping: false,
    typingUsers: [],
    error: null
  })

  const [inputState, setInputState] = useState<MessageInputState>({
    content: '',
    replyTo: null,
    attachments: [],
    isSubmitting: false
  })

  // 📌 Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // 📜 스크롤 자동 이동
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 📨 메시지 전송
  const handleSendMessage = useCallback(async () => {
    if (!inputState.content.trim() || inputState.isSubmitting) return

    setInputState(prev => ({ ...prev, isSubmitting: true }))

    try {
      await chatService.createMessage({
        room_id: roomId,
        content: inputState.content.trim(),
        message_type: inputState.replyTo ? 'reply' : 'text',
        reply_to_id: inputState.replyTo?.id
      })

      // 입력 상태 초기화
      setInputState({
        content: '',
        replyTo: null,
        attachments: [],
        isSubmitting: false
      })

      // 포커스 복원
      inputRef.current?.focus()

    } catch (error) {
      setChatState(prev => ({ 
        ...prev, 
        error: '메시지 전송 실패' 
      }))
      setInputState(prev => ({ ...prev, isSubmitting: false }))
    }
  }, [roomId, inputState])

  // ⌨️ 타이핑 인디케이터 처리
  const handleTyping = useCallback((content: string) => {
    setInputState(prev => ({ ...prev, content }))

    // 타이핑 상태 전송
    if (content.trim() && !chatState.isTyping) {
      chatRealtimeClient.sendTypingIndicator(roomId, true)
      setChatState(prev => ({ ...prev, isTyping: true }))
    }

    // 타이핑 중지 타이머
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (chatState.isTyping) {
        chatRealtimeClient.sendTypingIndicator(roomId, false)
        setChatState(prev => ({ ...prev, isTyping: false }))
      }
    }, 2000)
  }, [roomId, chatState.isTyping])

  // 📝 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // 🔄 실시간 이벤트 구독
  useEffect(() => {
    const subscribeToRoom = async () => {
      try {
        // 메시지 생성 이벤트
        await chatRealtimeClient.subscribeToChatRoom(
          roomId, 
          'message_created', 
          (message) => {
            setChatState(prev => ({
              ...prev,
              messages: [...prev.messages, message]
            }))
            scrollToBottom()
          }
        )

        // 타이핑 인디케이터
        await chatRealtimeClient.subscribeToChatRoom(
          roomId,
          'user_typing',
          (typing) => {
            setChatState(prev => ({
              ...prev,
              typingUsers: typing.is_typing 
                ? [...prev.typingUsers.filter(u => u !== typing.user_name), typing.user_name]
                : prev.typingUsers.filter(u => u !== typing.user_name)
            }))
          }
        )

        // 초기 메시지 로드
        const messages = await chatService.getChatMessages(roomId)
        setChatState(prev => ({
          ...prev,
          messages,
          isLoading: false
        }))

        scrollToBottom()

      } catch (error) {
        setChatState(prev => ({
          ...prev,
          error: '채팅 연결 실패',
          isLoading: false
        }))
      }
    }

    subscribeToRoom()

    // 정리
    return () => {
      chatRealtimeClient.unsubscribeFromRoom(roomId)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [roomId, scrollToBottom])

  // 🎨 렌더링
  return (
    <div 
      className={`flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}
      style={{ height }}
    >
      {/* 💡 헤더 */}
      <ChatHeader 
        room={chatState.currentRoom}
        onClose={onClose}
        onSearch={() => {/* TODO: 검색 모달 */}}
      />

      {/* 📜 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {chatState.isLoading ? (
          <ChatLoadingSkeleton />
        ) : chatState.error ? (
          <div className="text-center text-red-500 py-8">
            {chatState.error}
          </div>
        ) : (
          <>
            {chatState.messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                showAvatar={
                  index === 0 || 
                  chatState.messages[index - 1].sender_id !== message.sender_id
                }
                onReply={() => setInputState(prev => ({ 
                  ...prev, 
                  replyTo: message 
                }))}
              />
            ))}
            
            {/* 타이핑 인디케이터 */}
            {chatState.typingUsers.length > 0 && (
              <TypingIndicator users={chatState.typingUsers} />
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 📝 입력 영역 */}
      <MessageInput
        value={inputState.content}
        replyTo={inputState.replyTo}
        isSubmitting={inputState.isSubmitting}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        onSend={handleSendMessage}
        onCancelReply={() => setInputState(prev => ({ 
          ...prev, 
          replyTo: null 
        }))}
        ref={inputRef}
      />
    </div>
  )
}

// 💡 채팅 헤더 컴포넌트
interface ChatHeaderProps {
  room: ChatRoom | null
  onClose?: () => void
  onSearch: () => void
}

const ChatHeader = ({ room, onClose, onSearch }: ChatHeaderProps) => {
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {room?.name?.[0]?.toUpperCase() || '💬'}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {room?.name || '로딩 중...'}
          </h3>
          <p className="text-sm text-gray-500">
            {room?.type === 'direct' ? '개인 메시지' : 
             `${room?.member_count || 0}명`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onSearch}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="검색"
        >
          <Search className="w-4 h-4" />
        </button>
        
        <button
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="더 보기"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// 💭 메시지 버블 컴포넌트
interface MessageBubbleProps {
  message: ChatMessage
  showAvatar: boolean
  onReply: () => void
}

const MessageBubble = ({ message, showAvatar, onReply }: MessageBubbleProps) => {
  const isOwn = message.sender_id === 'current-user-id' // TODO: 실제 사용자 ID
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
        {/* 아바타 */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">
              {message.sender?.username?.[0]?.toUpperCase() || '👤'}
            </span>
          </div>
        )}
        
        {/* 메시지 내용 */}
        <div className={`space-y-1`}>
          {/* 답글 표시 */}
          {message.reply_to && (
            <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-lg">
              ↳ {message.reply_to.sender?.username}: {message.reply_to.content}
            </div>
          )}
          
          {/* 메시지 버블 */}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-900'
            } ${showAvatar || isOwn ? '' : 'ml-10'}`}
          >
            {/* 발신자 이름 (그룹 채팅) */}
            {!isOwn && showAvatar && (
              <div className="text-xs font-semibold text-gray-600 mb-1">
                {message.sender?.username}
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
            
            {/* 수정됨 표시 */}
            {message.is_edited && (
              <span className={`text-xs ${isOwn ? 'text-pink-200' : 'text-gray-500'} ml-2`}>
                (수정됨)
              </span>
            )}
          </div>
          
          {/* 시간 & 액션 */}
          <div className={`flex items-center space-x-2 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>
              {new Date(message.created_at).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            
            <button
              onClick={onReply}
              className="opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-all"
            >
              답장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ⌨️ 메시지 입력 컴포넌트
interface MessageInputProps {
  value: string
  replyTo: ChatMessage | null
  isSubmitting: boolean
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSend: () => void
  onCancelReply: () => void
}

const MessageInput = React.forwardRef<HTMLTextAreaElement, MessageInputProps>(({
  value,
  replyTo,
  isSubmitting,
  onChange,
  onKeyDown,
  onSend,
  onCancelReply
}, ref) => {
  
  return (
    <div className="border-t border-gray-200 p-4">
      {/* 답글 표시 */}
      {replyTo && (
        <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            <span className="font-medium">{replyTo.sender?.username}</span>에게 답장
            <p className="text-blue-600 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="text-blue-500 hover:text-blue-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="flex items-end space-x-3">
        {/* 첨부 버튼 */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        
        {/* 텍스트 입력 */}
        <div className="flex-1 relative">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="메시지를 입력하세요..."
            className="w-full max-h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={1}
            disabled={isSubmitting}
          />
        </div>
        
        {/* 이모지 버튼 */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Smile className="w-5 h-5" />
        </button>
        
        {/* 전송 버튼 */}
        <button
          onClick={onSend}
          disabled={!value.trim() || isSubmitting}
          className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
})

MessageInput.displayName = 'MessageInput'

// ⌨️ 타이핑 인디케이터
const TypingIndicator = ({ users }: { users: string[] }) => (
  <div className="flex items-center space-x-2 text-gray-500 text-sm px-3">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
    </div>
    <span>
      {users.length === 1 
        ? `${users[0]}님이 입력 중...`
        : `${users.length}명이 입력 중...`
      }
    </span>
  </div>
)

// ⏳ 로딩 스켈레톤
const ChatLoadingSkeleton = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-[70%] space-y-2`}>
          <div className="h-8 bg-gray-200 rounded-2xl animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
          {Math.random() > 0.7 && (
            <div className="h-6 bg-gray-200 rounded-2xl animate-pulse" style={{ width: `${40 + Math.random() * 30}%` }} />
          )}
        </div>
      </div>
    ))}
  </div>
)