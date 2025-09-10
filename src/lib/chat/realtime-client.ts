/**
 * 🔄 Supabase Realtime 채팅 클라이언트 (Best Practice)
 * - Connection pooling & reconnection
 * - Type-safe event handling  
 * - Memory leak prevention
 * - Error boundary & fallback
 */

import { RealtimeChannel, RealtimeClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// 📡 채팅 이벤트 타입 정의
export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system' | 'reply'
  reply_to_id?: string
  file_url?: string
  file_name?: string
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  
  // 조인된 데이터
  sender?: {
    id: string
    username: string
    avatar_url: string
  }
  reply_to?: Partial<ChatMessage>
}

export interface ChatRoom {
  id: string
  type: 'direct' | 'group' | 'public'
  name?: string
  description?: string
  avatar_url?: string
  max_members: number
  is_private: boolean
  created_at: string
  updated_at: string
  
  // 런타임 데이터
  member_count?: number
  unread_count?: number
  last_message?: ChatMessage
}

export interface TypingIndicator {
  user_id: string
  room_id: string
  user_name: string
  is_typing: boolean
  timestamp: number
}

export interface UserPresence {
  user_id: string
  status: 'online' | 'away' | 'offline'
  last_seen: string
}

// 🔄 이벤트 타입 정의
type ChatEventType = 
  | 'message_created'
  | 'message_updated' 
  | 'message_deleted'
  | 'user_typing'
  | 'user_stopped_typing'
  | 'user_joined'
  | 'user_left'
  | 'presence_sync'

interface ChatEventPayload {
  message_created: ChatMessage
  message_updated: ChatMessage
  message_deleted: { id: string; room_id: string }
  user_typing: TypingIndicator
  user_stopped_typing: TypingIndicator
  user_joined: { room_id: string; user_id: string; user_name: string }
  user_left: { room_id: string; user_id: string; user_name: string }
  presence_sync: UserPresence[]
}

// 📡 리얼타임 채팅 클라이언트
export class ChatRealtimeClient {
  private channels: Map<string, RealtimeChannel> = new Map()
  private typingTimers: Map<string, NodeJS.Timeout> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  // 🎯 채팅방 구독 (메모리 효율적)
  async subscribeToChatRoom<T extends ChatEventType>(
    roomId: string,
    eventType: T,
    callback: (payload: ChatEventPayload[T]) => void
  ): Promise<RealtimeChannel> {
    const channelName = `chat_room:${roomId}`
    
    // 기존 채널 재사용
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName)!
      channel.on('postgres_changes', { 
        event: eventType === 'message_created' ? 'INSERT' : 
               eventType === 'message_updated' ? 'UPDATE' : 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        this.handleMessageChange(payload, eventType, callback)
      })
      
      return channel
    }

    // 새 채널 생성
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: `user_${supabase.auth.getUser()}` }
        }
      })

    // 메시지 변경 감지
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public', 
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      this.handleMessageChange(payload, eventType, callback)
    })

    // 타이핑 인디케이터
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      if (eventType === 'user_typing' || eventType === 'user_stopped_typing') {
        callback(payload.payload as ChatEventPayload[T])
      }
    })

    // 사용자 존재감 (Presence)
    channel.on('presence', { event: 'sync' }, () => {
      if (eventType === 'presence_sync') {
        const state = channel.presenceState()
        const users = Object.keys(state).map(userId => ({
          user_id: userId,
          status: 'online' as const,
          last_seen: new Date().toISOString()
        }))
        callback(users as ChatEventPayload[T])
      }
    })

    // 채널 구독 시작
    await channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to ${channelName}`)
        this.reconnectAttempts = 0
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Channel error: ${channelName}`)
        this.handleReconnect(roomId, eventType, callback)
      }
    })

    this.channels.set(channelName, channel)
    return channel
  }

  // 📝 메시지 변경 핸들러
  private handleMessageChange<T extends ChatEventType>(
    payload: any,
    eventType: T,
    callback: (payload: ChatEventPayload[T]) => void
  ) {
    try {
      switch (payload.eventType) {
        case 'INSERT':
          if (eventType === 'message_created') {
            callback(payload.new as ChatEventPayload[T])
          }
          break
        case 'UPDATE':
          if (eventType === 'message_updated') {
            callback(payload.new as ChatEventPayload[T])
          }
          break
        case 'DELETE':
          if (eventType === 'message_deleted') {
            callback({
              id: payload.old.id,
              room_id: payload.old.room_id
            } as ChatEventPayload[T])
          }
          break
      }
    } catch (error) {
      console.error('Error handling message change:', error)
    }
  }

  // ⌨️ 타이핑 인디케이터 전송
  async sendTypingIndicator(roomId: string, isTyping: boolean) {
    const channel = this.channels.get(`chat_room:${roomId}`)
    if (!channel) return

    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const payload: TypingIndicator = {
      user_id: user.data.user.id,
      room_id: roomId,
      user_name: user.data.user.user_metadata?.full_name || 'Anonymous',
      is_typing: isTyping,
      timestamp: Date.now()
    }

    // 타이핑 상태 브로드캐스트
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload
    })

    // 타이핑 중지 자동 처리 (3초 후)
    if (isTyping) {
      const timerId = `${roomId}-${user.data.user.id}`
      
      // 기존 타이머 클리어
      if (this.typingTimers.has(timerId)) {
        clearTimeout(this.typingTimers.get(timerId)!)
      }
      
      // 새 타이머 설정
      const timer = setTimeout(() => {
        this.sendTypingIndicator(roomId, false)
        this.typingTimers.delete(timerId)
      }, 3000)
      
      this.typingTimers.set(timerId, timer)
    }
  }

  // 🔌 재연결 처리
  private async handleReconnect<T extends ChatEventType>(
    roomId: string,
    eventType: T,
    callback: (payload: ChatEventPayload[T]) => void
  ) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    setTimeout(() => {
      this.subscribeToChatRoom(roomId, eventType, callback)
    }, delay)
  }

  // 🧹 채널 구독 해제 (메모리 누수 방지)
  async unsubscribeFromRoom(roomId: string) {
    const channelName = `chat_room:${roomId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await supabase.removeChannel(channel)
      this.channels.delete(channelName)
      
      // 타이핑 타이머 정리
      const user = await supabase.auth.getUser()
      if (user.data.user) {
        const timerId = `${roomId}-${user.data.user.id}`
        if (this.typingTimers.has(timerId)) {
          clearTimeout(this.typingTimers.get(timerId)!)
          this.typingTimers.delete(timerId)
        }
      }
    }
  }

  // 🔄 모든 채널 정리
  async cleanup() {
    // 모든 타이머 정리
    this.typingTimers.forEach(timer => clearTimeout(timer))
    this.typingTimers.clear()
    
    // 모든 채널 구독 해제
    const channels = Array.from(this.channels.values())
    await Promise.all(channels.map(channel => supabase.removeChannel(channel)))
    this.channels.clear()
  }

  // 📊 연결 상태 확인
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    const channels = Array.from(this.channels.values())
    if (channels.length === 0) return 'disconnected'
    
    const connected = channels.every(channel => 
      channel.state === 'joined' || channel.state === 'joining'
    )
    
    return connected ? 'connected' : 'connecting'
  }
}

// 🏭 싱글톤 인스턴스
export const chatRealtimeClient = new ChatRealtimeClient()

// 🧹 페이지 언로드시 정리
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    chatRealtimeClient.cleanup()
  })
}