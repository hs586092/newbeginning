/**
 * 🚀 데모 채팅 서비스 - 인증 없이 작동
 *
 * 목적: 사용자 인증 시스템 구축 전까지 채팅 기능 데모 제공
 * 특징: 하드코딩된 테스트 사용자로 모든 기능 작동
 */

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 테스트 사용자 ID (실제 데이터베이스에 존재하는 사용자)
const DEMO_USER_ID = 'de4ff961-6dbb-4c6b-8a1c-960575c62037'

export interface ChatRoom {
  id: string
  type: 'direct' | 'group' | 'public'
  name?: string
  description?: string
  avatar_url?: string
  max_members: number
  is_private: boolean
  created_by: string
  created_at: string
  updated_at: string
  member_count?: number
  last_message?: ChatMessage | null
  unread_count?: number
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  is_edited: boolean
  is_deleted: boolean
  reply_to_id?: string | null
  created_at: string
  updated_at: string
  sender?: UserProfile | null
  reply_to?: ChatMessage | null
}

export interface UserProfile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
}

/**
 * 🎭 데모 채팅 서비스 - 즉시 작동하는 버전
 */
export class DemoChatService {

  /**
   * 모든 공개 채팅방 조회 (인증 불필요)
   */
  static async getUserRooms(): Promise<ChatRoom[]> {
    try {
      console.log('🎭 데모 모드: 공개 채팅방 조회')

      // 모든 공개 채팅방 조회
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('updated_at', { ascending: false })

      if (roomsError) {
        console.error('채팅방 조회 실패:', roomsError)
        return []
      }

      if (!rooms || rooms.length === 0) {
        return []
      }

      // 각 방의 추가 정보 조회
      const roomsWithDetails = await Promise.allSettled(
        rooms.map(async (room) => {
          const [memberCount, lastMessage] = await Promise.allSettled([
            this.getRoomMemberCount(room.id),
            this.getLastMessage(room.id)
          ])

          return {
            ...room,
            member_count: memberCount.status === 'fulfilled' ? memberCount.value : 0,
            last_message: lastMessage.status === 'fulfilled' ? lastMessage.value : null,
            unread_count: 0 // 데모에서는 0으로 설정
          } as ChatRoom
        })
      )

      const successfulRooms = roomsWithDetails
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<ChatRoom>).value)

      console.log(`🎭 데모 결과: ${successfulRooms.length}개 채팅방`)
      return successfulRooms

    } catch (error) {
      console.error('데모 채팅방 조회 실패:', error)
      return []
    }
  }

  /**
   * 채팅방 메시지 조회 (인증 불필요)
   */
  static async getRoomMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      console.log(`🎭 데모 모드: 메시지 조회 (${roomId})`)

      // 메시지 기본 정보 조회
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (messagesError) {
        console.error('메시지 조회 실패:', messagesError)
        return []
      }

      if (!messages || messages.length === 0) {
        console.log('🎭 메시지 없음')
        return []
      }

      console.log(`🎭 메시지 ${messages.length}개 조회됨`)

      // 발신자 정보 조회
      const senderIds = [...new Set(messages.map(m => m.sender_id))]
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds)

      const sendersMap = new Map(senders?.map(s => [s.id, s]) || [])

      // 답글 정보 조회 (필요한 경우)
      const replyIds = messages
        .filter(m => m.reply_to_id)
        .map(m => m.reply_to_id!)

      let repliesMap = new Map()
      if (replyIds.length > 0) {
        const { data: replies } = await supabase
          .from('chat_messages')
          .select('id, content, sender_id')
          .in('id', replyIds)

        repliesMap = new Map(replies?.map(r => [r.id, r]) || [])
      }

      // 데이터 결합
      const messagesWithDetails = messages.map(message => ({
        ...message,
        sender: sendersMap.get(message.sender_id) || null,
        reply_to: message.reply_to_id ? repliesMap.get(message.reply_to_id) || null : null
      }))

      console.log(`🎭 완성된 메시지 ${messagesWithDetails.length}개`)
      return messagesWithDetails.reverse() // 시간순 정렬

    } catch (error) {
      console.error('데모 메시지 조회 실패:', error)
      return []
    }
  }

  /**
   * 메시지 전송 (데모 사용자로)
   */
  static async sendMessage(roomId: string, content: string, replyToId?: string): Promise<boolean> {
    try {
      console.log(`🎭 데모 모드: 메시지 전송 (${content.substring(0, 20)}...)`)

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: DEMO_USER_ID,
          content,
          message_type: 'text',
          reply_to_id: replyToId || null
        })

      if (error) {
        console.error('메시지 전송 실패:', error)
        return false
      }

      // 채팅방 업데이트 시간 갱신
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId)

      console.log('🎭 메시지 전송 성공')
      return true

    } catch (error) {
      console.error('데모 메시지 전송 실패:', error)
      return false
    }
  }

  /**
   * 읽음 처리 (데모에서는 항상 성공)
   */
  static async markAsRead(roomId: string): Promise<boolean> {
    console.log(`🎭 데모 모드: 읽음 처리 (${roomId})`)
    return true
  }

  /**
   * 채팅방 멤버 수 조회
   */
  private static async getRoomMemberCount(roomId: string): Promise<number> {
    const { count } = await supabase
      .from('chat_room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('is_active', true)

    return count || 1 // 최소 1명
  }

  /**
   * 마지막 메시지 조회
   */
  private static async getLastMessage(roomId: string): Promise<ChatMessage | null> {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return data || null
  }

  /**
   * 채팅방 생성 (데모용)
   */
  static async createRoom(name: string, type: 'group' | 'public' = 'public'): Promise<string | null> {
    try {
      console.log(`🎭 데모 모드: 채팅방 생성 (${name})`)

      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          type,
          name,
          max_members: 100,
          is_private: false,
          created_by: DEMO_USER_ID
        })
        .select('id')
        .single()

      if (roomError || !room) {
        console.error('채팅방 생성 실패:', roomError)
        return null
      }

      // 데모 사용자를 멤버로 추가
      await supabase
        .from('chat_room_members')
        .insert({
          room_id: room.id,
          user_id: DEMO_USER_ID,
          role: 'owner'
        })

      console.log(`🎭 채팅방 생성 성공: ${room.id}`)
      return room.id

    } catch (error) {
      console.error('데모 채팅방 생성 실패:', error)
      return null
    }
  }

  /**
   * 사용자 인증 상태 (데모에서는 항상 true)
   */
  static isUserInRoom(): Promise<boolean> {
    return Promise.resolve(true)
  }
}

export default DemoChatService