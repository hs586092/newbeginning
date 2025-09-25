/**
 * 🏗️ 견고한 채팅 서비스 (Best Practices 기반)
 *
 * 핵심 원칙:
 * - Single Responsibility: 각 메서드는 하나의 작업만
 * - Simple Queries: 복잡한 조인 금지, 단순 쿼리만 사용
 * - Fail-Safe Design: 에러 시 graceful degradation
 * - Consistent Schema: 하나의 테이블 체계만 사용
 */

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 🎯 명확한 타입 정의
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

  // 계산된 필드들
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

  // 조인된 데이터 (별도 조회)
  sender?: UserProfile | null
  reply_to?: ChatMessage | null
}

export interface UserProfile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
}

export interface ChatMember {
  room_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  last_read_at?: string
  is_active: boolean
}

/**
 * 🛡️ 견고한 채팅 서비스 클래스
 */
export class RobustChatService {

  // ======================================
  // 🏠 채팅방 관련 메서드들 (단순화)
  // ======================================

  /**
   * 사용자의 채팅방 목록 조회 (단순 쿼리만 사용)
   */
  static async getUserRooms(): Promise<ChatRoom[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // 1단계: 사용자가 참여 중인 방 ID 목록 조회
      const { data: memberships } = await supabase
        .from('chat_room_members')
        .select('room_id, role, last_read_at')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (!memberships || memberships.length === 0) return []

      const roomIds = memberships.map(m => m.room_id)

      // 2단계: 채팅방 기본 정보 조회 (단순 쿼리)
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('*')
        .in('id', roomIds)
        .order('updated_at', { ascending: false })

      if (!rooms) return []

      // 3단계: 각 방의 추가 정보를 병렬로 조회
      const roomsWithDetails = await Promise.allSettled(
        rooms.map(async (room) => {
          const [memberCount, lastMessage, unreadCount] = await Promise.allSettled([
            this.getRoomMemberCount(room.id),
            this.getLastMessage(room.id),
            this.getUnreadCount(room.id, user.id)
          ])

          return {
            ...room,
            member_count: memberCount.status === 'fulfilled' ? memberCount.value : 0,
            last_message: lastMessage.status === 'fulfilled' ? lastMessage.value : null,
            unread_count: unreadCount.status === 'fulfilled' ? unreadCount.value : 0
          } as ChatRoom
        })
      )

      // 성공한 결과만 반환
      return roomsWithDetails
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<ChatRoom>).value)

    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error)
      return [] // 실패 시 빈 배열 반환 (graceful degradation)
    }
  }

  /**
   * 채팅방 멤버 수 조회 (단순 쿼리)
   */
  private static async getRoomMemberCount(roomId: string): Promise<number> {
    const { count } = await supabase
      .from('chat_room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('is_active', true)

    return count || 0
  }

  /**
   * 마지막 메시지 조회 (단순 쿼리)
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
   * 읽지 않은 메시지 수 조회 (단순 쿼리)
   */
  private static async getUnreadCount(roomId: string, userId: string): Promise<number> {
    // 사용자의 마지막 읽음 시간 조회
    const { data: member } = await supabase
      .from('chat_room_members')
      .select('last_read_at')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    if (!member?.last_read_at) return 0

    // 마지막 읽음 시간 이후 메시지 수
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .gt('created_at', member.last_read_at)
      .eq('is_deleted', false)

    return count || 0
  }

  // ======================================
  // 💬 메시지 관련 메서드들 (단순화)
  // ======================================

  /**
   * 채팅방 메시지 목록 조회 (단순 쿼리만)
   */
  static async getRoomMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      // 1단계: 메시지 기본 정보 조회 (단순 쿼리)
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!messages || messages.length === 0) return []

      // 2단계: 발신자 정보를 별도로 조회
      const senderIds = [...new Set(messages.map(m => m.sender_id))]
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds)

      const sendersMap = new Map(senders?.map(s => [s.id, s]) || [])

      // 3단계: 답글 정보를 별도로 조회 (필요한 경우만)
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

      // 4단계: 데이터 조합 (메모리에서)
      const messagesWithDetails = messages.map(message => ({
        ...message,
        sender: sendersMap.get(message.sender_id) || null,
        reply_to: message.reply_to_id ? repliesMap.get(message.reply_to_id) || null : null
      }))

      return messagesWithDetails.reverse() // 시간순으로 정렬

    } catch (error) {
      console.error('메시지 조회 실패:', error)
      return [] // 실패 시 빈 배열 반환
    }
  }

  /**
   * 메시지 전송 (단순 쿼리)
   */
  static async sendMessage(roomId: string, content: string, replyToId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // 1단계: 메시지 삽입 (단순 쿼리)
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content,
          message_type: 'text',
          reply_to_id: replyToId || null
        })

      if (error) throw error

      // 2단계: 채팅방 업데이트 시간 갱신 (별도 쿼리)
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId)

      // 3단계: 읽음 상태 업데이트 (별도 쿼리)
      await supabase
        .from('chat_room_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', user.id)

      return true

    } catch (error) {
      console.error('메시지 전송 실패:', error)
      return false
    }
  }

  /**
   * 메시지 읽음 처리 (단순 쿼리)
   */
  static async markAsRead(roomId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('chat_room_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', user.id)

      return !error

    } catch (error) {
      console.error('읽음 처리 실패:', error)
      return false
    }
  }

  // ======================================
  // 🛠️ 유틸리티 메서드들
  // ======================================

  /**
   * 채팅방 참여 여부 확인 (단순 쿼리)
   */
  static async isUserInRoom(roomId: string, userId?: string): Promise<boolean> {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false
        userId = user.id
      }

      const { data } = await supabase
        .from('chat_room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      return !!data

    } catch (error) {
      return false
    }
  }

  /**
   * 채팅방 생성 (단순한 트랜잭션)
   */
  static async createRoom(name: string, type: 'group' | 'public' = 'group'): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // 1단계: 채팅방 생성
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          type,
          name,
          max_members: 100,
          is_private: false,
          created_by: user.id
        })
        .select('id')
        .single()

      if (roomError || !room) throw roomError

      // 2단계: 생성자를 멤버로 추가
      const { error: memberError } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: 'owner'
        })

      if (memberError) throw memberError

      return room.id

    } catch (error) {
      console.error('채팅방 생성 실패:', error)
      return null
    }
  }
}

// 기본 export
export default RobustChatService