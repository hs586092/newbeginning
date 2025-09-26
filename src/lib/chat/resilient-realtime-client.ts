/**
 * 🔄 Resilient Realtime Client (CLAUDE.md Principles)
 * - Evidence > assumptions: Test connections before failing
 * - Graceful Degradation: WebSocket → Polling fallback
 * - Automatic Recovery: Exponential backoff with circuit breaker
 * - Fail Fast, Fail Explicitly: Clear error reporting with context
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { RobustChatService } from './robust-chat-service'

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
}

type ConnectionMode = 'websocket' | 'polling' | 'failed'

export class ResilientRealtimeClient {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private connectionMode: ConnectionMode = 'websocket'
  private retryCount = 0
  private maxRetries = 3
  private lastPolledTimestamp: Map<string, string> = new Map()

  /**
   * 🎯 채팅방 구독 (Graceful Degradation)
   */
  async subscribeToRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ): Promise<boolean> {
    console.log(`🔄 [${this.connectionMode}] Subscribing to room: ${roomId}`)

    // Evidence-based approach: Try WebSocket first
    if (this.connectionMode === 'websocket') {
      const success = await this.tryWebSocket(roomId, onMessage, onError)
      if (success) {
        console.log(`✅ WebSocket active for room: ${roomId}`)
        return true
      }

      // Fail fast: Immediately switch to polling
      console.log(`🔄 WebSocket failed, switching to polling for room: ${roomId}`)
      this.connectionMode = 'polling'
    }

    // Graceful degradation: Use polling
    this.startPolling(roomId, onMessage, onError)
    this.scheduleRecoveryAttempt(roomId, onMessage, onError)

    console.log(`✅ Polling active for room: ${roomId}`)
    return true
  }

  /**
   * 🌐 WebSocket 시도 (Fail Fast)
   */
  private async tryWebSocket(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ): Promise<boolean> {
    try {
      const channelName = `resilient_${roomId}`

      // 사용자 인증 확인
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        console.warn('❌ No authenticated user for WebSocket')
        return false
      }

      // 채널 생성
      const channel = this.supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: user.id }
        }
      })

      // 메시지 이벤트 리스너
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('📨 New message via WebSocket:', payload.new)
          onMessage(payload.new as ChatMessage)
        }
      )

      // 구독 시도 (5초 타임아웃)
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('⏰ WebSocket subscription timeout')
          resolve(false)
        }, 5000)

        channel.subscribe((status, error) => {
          clearTimeout(timeout)

          if (status === 'SUBSCRIBED') {
            console.log(`✅ WebSocket subscribed: ${channelName}`)
            this.channels.set(roomId, channel)
            this.retryCount = 0 // Reset on success
            resolve(true)
          } else {
            console.warn(`❌ WebSocket subscription failed: ${status}`, error)
            if (onError) onError({ status, error })
            resolve(false)
          }
        })
      })

    } catch (error) {
      console.warn('❌ WebSocket attempt failed:', error)
      if (onError) onError(error)
      return false
    }
  }

  /**
   * 📊 폴링 시작 (Always works)
   */
  private startPolling(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ) {
    // 기존 폴링 정리
    this.stopPolling(roomId)

    // 마지막 체크 시간 설정
    const now = new Date().toISOString()
    this.lastPolledTimestamp.set(roomId, now)

    // 3초마다 새 메시지 확인
    const intervalId = setInterval(async () => {
      try {
        const lastCheck = this.lastPolledTimestamp.get(roomId) || now

        // 마지막 체크 이후 새 메시지 조회
        const { data: messages, error } = await this.supabase
          .from('chat_messages')
          .select(`
            *,
            profiles:sender_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('room_id', roomId)
          .gt('created_at', lastCheck)
          .order('created_at', { ascending: true })

        if (error) {
          console.warn('❌ Polling query error:', error)
          if (onError) onError(error)
          return
        }

        // 새 메시지 처리
        if (messages && messages.length > 0) {
          console.log(`📨 ${messages.length} new message(s) via polling`)

          messages.forEach(msg => {
            const formattedMessage: ChatMessage = {
              ...msg,
              sender: msg.profiles ? {
                id: msg.profiles.id,
                username: msg.profiles.username,
                full_name: msg.profiles.full_name,
                avatar_url: msg.profiles.avatar_url
              } : undefined
            }
            onMessage(formattedMessage)
          })

          // 타임스탬프 업데이트
          const lastMessage = messages[messages.length - 1]
          this.lastPolledTimestamp.set(roomId, lastMessage.created_at)
        }

      } catch (error) {
        console.warn('❌ Polling error:', error)
        if (onError) onError(error)
      }
    }, 3000)

    this.pollingIntervals.set(roomId, intervalId)
  }

  /**
   * 🔄 자동 복구 스케줄링 (Automatic Recovery)
   */
  private scheduleRecoveryAttempt(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ) {
    if (this.connectionMode !== 'polling' || this.retryCount >= this.maxRetries) {
      return
    }

    const backoffDelay = Math.min(30000 * Math.pow(2, this.retryCount), 300000) // Max 5분

    setTimeout(async () => {
      console.log(`🔄 Attempting WebSocket recovery for room: ${roomId}`)

      this.retryCount++
      const recovered = await this.tryWebSocket(roomId, onMessage, onError)

      if (recovered) {
        console.log(`✅ WebSocket recovered for room: ${roomId}`)
        this.connectionMode = 'websocket'
        this.stopPolling(roomId) // Stop polling, switch to WebSocket
      } else {
        console.log(`❌ Recovery attempt ${this.retryCount}/${this.maxRetries} failed`)
        this.scheduleRecoveryAttempt(roomId, onMessage, onError) // Schedule next attempt
      }
    }, backoffDelay)
  }

  /**
   * 🛑 폴링 중지
   */
  private stopPolling(roomId: string) {
    const intervalId = this.pollingIntervals.get(roomId)
    if (intervalId) {
      clearInterval(intervalId)
      this.pollingIntervals.delete(roomId)
    }
  }

  /**
   * 🔌 구독 해제
   */
  async unsubscribeFromRoom(roomId: string) {
    // WebSocket 채널 정리
    const channel = this.channels.get(roomId)
    if (channel) {
      await this.supabase.removeChannel(channel)
      this.channels.delete(roomId)
      console.log(`✅ WebSocket unsubscribed: ${roomId}`)
    }

    // 폴링 정리
    this.stopPolling(roomId)
    this.lastPolledTimestamp.delete(roomId)
    console.log(`✅ Polling stopped: ${roomId}`)
  }

  /**
   * 🧹 모든 구독 정리
   */
  async cleanup() {
    console.log('🧹 Cleaning up realtime client...')

    // 모든 WebSocket 채널 정리
    const cleanupPromises = Array.from(this.channels.values()).map(channel =>
      this.supabase.removeChannel(channel).catch(err =>
        console.warn('Channel cleanup error:', err)
      )
    )
    await Promise.allSettled(cleanupPromises)
    this.channels.clear()

    // 모든 폴링 정리
    this.pollingIntervals.forEach((intervalId, roomId) => {
      clearInterval(intervalId)
      console.log(`Stopped polling: ${roomId}`)
    })
    this.pollingIntervals.clear()
    this.lastPolledTimestamp.clear()
  }

  /**
   * 📊 연결 상태 확인
   */
  getStatus(): { mode: ConnectionMode; rooms: number; channels: number } {
    return {
      mode: this.connectionMode,
      rooms: this.pollingIntervals.size,
      channels: this.channels.size
    }
  }
}

// 싱글톤 인스턴스
export const resilientRealtimeClient = new ResilientRealtimeClient()

// 페이지 언로드 시 정리
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    resilientRealtimeClient.cleanup()
  })
}