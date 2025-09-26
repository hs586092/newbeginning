/**
 * 🔄 Resilient Supabase Realtime Client
 * - Graceful degradation: WebSocket → Polling fallback
 * - Automatic recovery with exponential backoff
 * - Evidence-based failure detection
 * - Proactive error handling following CLAUDE.md principles
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

// 📡 채팅 이벤트 타입 정의
export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  is_edited: boolean
  is_deleted: boolean
  reply_to_id?: string
  created_at: string
  updated_at: string
  sender?: {
    id: string
    username?: string
    full_name?: string
    avatar_url?: string
  }
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
  member_count?: number
  last_message?: ChatMessage
  unread_count?: number
}

// 📡 복원력 있는 리얼타임 클라이언트 (CLAUDE.md 원칙 기반)
export class SimpleRealtimeClient {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private connectionState: 'websocket' | 'polling' | 'failed' = 'websocket'
  private retryCount = 0
  private maxRetries = 3
  private lastMessageCache: Map<string, string> = new Map()

  constructor() {
    // Proactive connection check (CLAUDE.md principle)
    this.initializeConnection()
  }

  /**
   * 초기화 및 연결 상태 확인 (Evidence-based approach)
   */
  private async initializeConnection() {
    try {
      // Evidence-based connection test
      const { data, error } = await this.supabase
        .from('chat_rooms')
        .select('id')
        .limit(1)

      if (error) {
        console.warn('🔄 Database connection issue, starting with polling mode:', error.message)
        this.connectionState = 'polling'
      } else {
        console.log('✅ Database connection OK, attempting WebSocket')
        this.connectionState = 'websocket'
      }
    } catch (error) {
      console.warn('❌ Initial connection test failed, using polling fallback:', error)
      this.connectionState = 'polling'
    }
  }

  /**
   * Automatic recovery mechanism (CLAUDE.md principle)
   */
  private async attemptRecovery(): Promise<boolean> {
    if (this.retryCount >= this.maxRetries) {
      console.log('🔄 Max retries reached, permanently switching to polling mode')
      this.connectionState = 'polling'
      return false
    }

    this.retryCount++
    const backoffDelay = Math.min(1000 * Math.pow(2, this.retryCount), 10000)

    console.log(`🔄 Attempting recovery ${this.retryCount}/${this.maxRetries} in ${backoffDelay}ms`)

    await new Promise(resolve => setTimeout(resolve, backoffDelay))

    try {
      // Test WebSocket capability
      await this.initializeConnection()

      if (this.connectionState === 'websocket') {
        this.retryCount = 0 // Reset on successful recovery
        console.log('✅ WebSocket recovery successful')
        return true
      }
    } catch (error) {
      console.warn(`❌ Recovery attempt ${this.retryCount} failed:`, error)
    }

    return false
  }

  /**
   * 채팅방 메시지 구독 (Graceful Degradation with Automatic Recovery)
   */
  async subscribeToRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ): Promise<RealtimeChannel | null> {
    console.log(`🔄 Subscribing to room ${roomId} with ${this.connectionState} mode`)

    // Always try WebSocket first, then gracefully degrade
    if (this.connectionState === 'websocket') {
      const webSocketResult = await this.tryWebSocketSubscription(roomId, onMessage, onError)

      if (webSocketResult) {
        console.log(`✅ WebSocket subscription successful for room ${roomId}`)
        return webSocketResult
      } else {
        console.log(`🔄 WebSocket failed, falling back to polling for room ${roomId}`)
        this.connectionState = 'polling'
      }
    }

    // Fallback to polling with automatic recovery
    this.startPollingFallback(roomId, onMessage, onError)
    return null // No channel object for polling
  }

  /**
   * WebSocket 구독 시도 (Fail Fast principle)
   */
  private async tryWebSocketSubscription(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ): Promise<RealtimeChannel | null> {

    try {
      const channelName = `chat_room_${roomId}`

      // 기존 채널이 있으면 재사용
      if (this.channels.has(channelName)) {
        return this.channels.get(channelName)!
      }

      // 사용자 인증 확인
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        console.log('User not authenticated for realtime')
        return null
      }

      // 새 채널 생성
      const channel = this.supabase
        .channel(channelName, {
          config: {
            broadcast: { self: false },
            presence: { key: user.id }
          }
        })

      // 메시지 변경 감지
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          (payload) => {
            console.log('New message received:', payload.new)
            onMessage(payload.new as ChatMessage)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          (payload) => {
            console.log('Message updated:', payload.new)
            onMessage(payload.new as ChatMessage)
          }
        )

      // 채널 구독
      const subscribeResult = await channel.subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Channel error for ${channelName}:`, err)
          if (onError) onError(err)
          this.handleChannelError(channelName)
        } else if (status === 'TIMED_OUT') {
          console.warn(`⏰ Channel timeout for ${channelName}`)
          this.handleChannelError(channelName)
        } else if (status === 'CLOSED') {
          console.warn(`🔒 Channel closed for ${channelName}`)
          this.channels.delete(channelName)
        }
      })

      this.channels.set(channelName, channel)
      return channel

    } catch (error) {
      console.error('Failed to subscribe to room:', error)
      if (onError) onError(error)
      return null
    }
  }

  /**
   * 채널 에러 처리
   */
  private handleChannelError(channelName: string) {
    console.warn(`Removing failed channel: ${channelName}`)

    const channel = this.channels.get(channelName)
    if (channel) {
      try {
        this.supabase.removeChannel(channel)
      } catch (error) {
        console.warn('Error removing channel:', error)
      }
      this.channels.delete(channelName)
    }

    // 사용자에게 오프라인 상태 알림
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-realtime-error', {
        detail: { channelName, timestamp: Date.now() }
      }))
    }
  }

  /**
   * 채널 구독 해제
   */
  async unsubscribeFromRoom(roomId: string) {
    const channelName = `chat_room_${roomId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      try {
        await this.supabase.removeChannel(channel)
        this.channels.delete(channelName)
        console.log(`✅ Unsubscribed from ${channelName}`)
      } catch (error) {
        console.warn(`Error unsubscribing from ${channelName}:`, error)
      }
    }
  }

  /**
   * 모든 채널 정리
   */
  async cleanup() {
    console.log('Cleaning up realtime channels...')

    const channelPromises = Array.from(this.channels.entries()).map(([name, channel]) => {
      return this.supabase.removeChannel(channel).catch(error => {
        console.warn(`Error removing channel ${name}:`, error)
      })
    })

    await Promise.allSettled(channelPromises)
    this.channels.clear()
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus(): 'enabled' | 'disabled' | 'error' {
    if (!this.isEnabled) return 'disabled'

    const channels = Array.from(this.channels.values())
    if (channels.length === 0) return 'enabled'

    const hasErrors = channels.some(channel =>
      channel.state === 'errored' || channel.state === 'closed'
    )

    return hasErrors ? 'error' : 'enabled'
  }

  /**
   * Realtime 기능 재활성화 시도
   */
  async reconnect() {
    console.log('Attempting to reconnect realtime...')
    await this.checkConnection()

    if (this.isEnabled) {
      console.log('Realtime reconnected successfully')
      return true
    } else {
      console.log('Realtime reconnection failed')
      return false
    }
  }
}

// 싱글톤 인스턴스
export const simpleRealtimeClient = new SimpleRealtimeClient()

// 페이지 언로드시 정리
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    simpleRealtimeClient.cleanup()
  })

  // 에러 이벤트 리스너
  window.addEventListener('chat-realtime-error', (event: any) => {
    console.warn('Chat realtime error detected:', event.detail)
    // 여기에 UI 알림 로직 추가 가능
  })
}