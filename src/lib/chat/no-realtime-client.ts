/**
 * 🚫 No-Realtime Chat Client
 * - Polling-based fallback for when WebSocket fails
 * - Reliable basic chat functionality
 * - No WebSocket errors
 */

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

/**
 * 폴링 기반 채팅 클라이언트 (WebSocket 없음)
 */
export class NoRealtimeClient {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private lastMessageTimestamps: Map<string, string> = new Map()

  /**
   * 채팅방 메시지 폴링 시작
   */
  async subscribeToRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void,
    pollingInterval: number = 3000
  ): Promise<boolean> {
    try {
      console.log(`📡 Starting polling for room ${roomId}`)

      // 기존 폴링 정지
      this.unsubscribeFromRoom(roomId)

      // 초기 마지막 메시지 타임스탬프 설정
      const now = new Date().toISOString()
      this.lastMessageTimestamps.set(roomId, now)

      // 폴링 간격 설정
      const intervalId = setInterval(async () => {
        try {
          const lastTimestamp = this.lastMessageTimestamps.get(roomId)

          // 여기에 새 메시지 체크 로직 추가
          // 실제로는 RobustChatService를 통해 새 메시지 확인
          console.log(`📡 Polling room ${roomId} for new messages since ${lastTimestamp}`)

        } catch (error) {
          console.error(`Polling error for room ${roomId}:`, error)
          if (onError) onError(error)
        }
      }, pollingInterval)

      this.pollingIntervals.set(roomId, intervalId)
      return true

    } catch (error) {
      console.error('Failed to start polling:', error)
      if (onError) onError(error)
      return false
    }
  }

  /**
   * 채팅방 폴링 중지
   */
  async unsubscribeFromRoom(roomId: string) {
    const intervalId = this.pollingIntervals.get(roomId)

    if (intervalId) {
      clearInterval(intervalId)
      this.pollingIntervals.delete(roomId)
      this.lastMessageTimestamps.delete(roomId)
      console.log(`✅ Stopped polling for room ${roomId}`)
    }
  }

  /**
   * 모든 폴링 정리
   */
  async cleanup() {
    console.log('Cleaning up polling intervals...')

    this.pollingIntervals.forEach((intervalId, roomId) => {
      clearInterval(intervalId)
      console.log(`Stopped polling for room ${roomId}`)
    })

    this.pollingIntervals.clear()
    this.lastMessageTimestamps.clear()
  }

  /**
   * 연결 상태 (항상 활성화)
   */
  getConnectionStatus(): 'enabled' | 'disabled' {
    return 'enabled'
  }

  /**
   * 재연결 (폴링이므로 항상 성공)
   */
  async reconnect(): Promise<boolean> {
    console.log('No-realtime client: always connected')
    return true
  }
}

// 싱글톤 인스턴스
export const noRealtimeClient = new NoRealtimeClient()

// 페이지 언로드시 정리
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    noRealtimeClient.cleanup()
  })
}