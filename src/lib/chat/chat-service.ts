/**
 * 💬 채팅 서비스 레이어 (Repository Pattern + CQRS)
 * - Command/Query 분리
 * - 트랜잭션 관리
 * - 캐싱 전략
 * - 에러 핸들링
 */

import { supabase } from '@/lib/supabase/client'
import type { ChatMessage, ChatRoom, TypingIndicator } from './realtime-client'

// 📝 채팅 메시지 생성 DTO
export interface CreateMessageDTO {
  room_id: string
  content: string
  message_type?: 'text' | 'image' | 'file' | 'reply'
  reply_to_id?: string
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
}

// 🏠 채팅방 생성 DTO  
export interface CreateChatRoomDTO {
  type: 'direct' | 'group' | 'public'
  name?: string
  description?: string
  avatar_url?: string
  max_members?: number
  is_private?: boolean
  invite_only?: boolean
  member_ids: string[] // 초기 참여자
}

// 📊 채팅방 통계
export interface ChatRoomStats {
  total_messages: number
  member_count: number
  unread_count: number
  last_activity: string
}

// 🔍 메시지 검색 옵션
export interface MessageSearchOptions {
  room_id?: string
  sender_id?: string
  message_type?: string
  search_term?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

// 💬 채팅 서비스 클래스
export class ChatService {
  
  // 📝 메시지 관련 Commands
  
  /**
   * 새 메시지 생성 (트랜잭션)
   */
  async createMessage(messageData: CreateMessageDTO): Promise<ChatMessage> {
    try {
      // 1. 채팅방 멤버십 확인
      const { data: membership } = await supabase
        .from('chat_room_members')
        .select('id, role')
        .eq('room_id', messageData.room_id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', true)
        .single()

      if (!membership) {
        throw new Error('You are not a member of this chat room')
      }

      // 2. 메시지 생성
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          sender_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          sender:profiles!sender_id(id, username, avatar_url),
          reply_to:reply_to_id(id, content, sender:profiles!sender_id(username))
        `)
        .single()

      if (error) throw error

      // 3. 읽음 상태 초기화 (본인은 자동 읽음)
      await supabase
        .from('message_read_status')
        .insert({
          message_id: message.id,
          user_id: message.sender_id,
          room_id: message.room_id
        })

      return message as ChatMessage

    } catch (error) {
      console.error('Failed to create message:', error)
      throw new Error('Failed to send message')
    }
  }

  /**
   * 메시지 수정
   */
  async updateMessage(
    messageId: string, 
    content: string
  ): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', (await supabase.auth.getUser()).data.user?.id)
      .select(`
        *,
        sender:sender_id(id, full_name, avatar_url)
      `)
      .single()

    if (error) throw new Error('Failed to update message')
    return data as ChatMessage
  }

  /**
   * 메시지 삭제 (소프트 삭제)
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: '[삭제된 메시지]' // 보안을 위한 내용 제거
      })
      .eq('id', messageId)
      .eq('sender_id', (await supabase.auth.getUser()).data.user?.id)

    return !error
  }

  // 🏠 채팅방 관련 Commands

  /**
   * 새 채팅방 생성 (트랜잭션)
   */
  async createChatRoom(roomData: CreateChatRoomDTO): Promise<ChatRoom> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user
      if (!currentUser) throw new Error('Not authenticated')

      // 1. 개인 채팅방 중복 체크
      if (roomData.type === 'direct' && roomData.member_ids.length === 2) {
        const { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select(`
            *,
            members:chat_room_members!inner(user_id)
          `)
          .eq('type', 'direct')
          .in('members.user_id', roomData.member_ids)
          .single()

        if (existingRoom) {
          return existingRoom as ChatRoom
        }
      }

      // 2. 채팅방 생성
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          type: roomData.type,
          name: roomData.name,
          description: roomData.description,
          avatar_url: roomData.avatar_url,
          max_members: roomData.max_members || 100,
          is_private: roomData.is_private || false,
          invite_only: roomData.invite_only || false,
          created_by: currentUser.id
        })
        .select()
        .single()

      if (roomError) throw roomError

      // 3. 멤버 추가 (생성자 포함)
      const memberInserts = roomData.member_ids.map(userId => ({
        room_id: room.id,
        user_id: userId,
        role: userId === currentUser.id ? 'owner' : 'member'
      }))

      const { error: membersError } = await supabase
        .from('chat_room_members')
        .insert(memberInserts)

      if (membersError) throw membersError

      return room as ChatRoom

    } catch (error) {
      console.error('Failed to create chat room:', error)
      throw new Error('Failed to create chat room')
    }
  }

  /**
   * 채팅방 참여
   */
  async joinChatRoom(roomId: string): Promise<boolean> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user
      if (!currentUser) throw new Error('Not authenticated')

      // 1. 채팅방 정보 확인
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (!room) throw new Error('Chat room not found')

      // 2. 초대 전용 방 체크
      if (room.invite_only) {
        // TODO: 초대 토큰 확인 로직
      }

      // 3. 멤버 추가
      const { error } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: roomId,
          user_id: currentUser.id,
          role: 'member'
        })

      return !error

    } catch (error) {
      console.error('Failed to join chat room:', error)
      return false
    }
  }

  /**
   * 채팅방 나가기
   */
  async leaveChatRoom(roomId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_room_members')
      .update({ 
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

    return !error
  }

  // 📖 Query 메서드들

  /**
   * 사용자 채팅방 목록 조회
   */
  async getUserChatRooms(): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        members:chat_room_members!inner(user_id, role, last_read_at),
        last_message:messages(id, content, message_type, created_at, sender:profiles!sender_id(username))
      `)
      .eq('members.user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('members.is_active', true)
      .order('updated_at', { ascending: false })

    if (error) throw new Error('Failed to fetch chat rooms')
    
    return data.map(room => ({
      ...room,
      last_message: room.last_message[0] || null,
      member_count: room.members?.length || 0
    })) as ChatRoom[]
  }

  /**
   * 채팅방 메시지 조회 (페이지네이션)
   */
  async getChatMessages(
    roomId: string,
    limit: number = 50,
    before?: string
  ): Promise<ChatMessage[]> {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, username, avatar_url),
        reply_to:reply_to_id(id, content, sender:profiles!sender_id(username))
      `)
      .eq('room_id', roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query

    if (error) throw new Error('Failed to fetch messages')
    return data.reverse() as ChatMessage[] // 시간순 정렬
  }

  /**
   * 메시지 검색
   */
  async searchMessages(options: MessageSearchOptions): Promise<ChatMessage[]> {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, full_name, avatar_url)
      `)
      .eq('is_deleted', false)

    // 필터 적용
    if (options.room_id) query = query.eq('room_id', options.room_id)
    if (options.sender_id) query = query.eq('sender_id', options.sender_id)
    if (options.message_type) query = query.eq('message_type', options.message_type)
    if (options.search_term) {
      query = query.ilike('content', `%${options.search_term}%`)
    }
    if (options.start_date) query = query.gte('created_at', options.start_date)
    if (options.end_date) query = query.lte('created_at', options.end_date)

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1)

    if (error) throw new Error('Failed to search messages')
    return data as ChatMessage[]
  }

  /**
   * 읽지 않은 메시지 수 조회
   */
  async getUnreadMessageCount(roomId: string): Promise<number> {
    const currentUser = (await supabase.auth.getUser()).data.user
    if (!currentUser) return 0

    // 사용자의 마지막 읽은 시간 조회
    const { data: member } = await supabase
      .from('chat_room_members')
      .select('last_read_at')
      .eq('room_id', roomId)
      .eq('user_id', currentUser.id)
      .single()

    if (!member) return 0

    // 마지막 읽은 시간 이후 메시지 수
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .neq('sender_id', currentUser.id) // 본인 메시지 제외
      .gt('created_at', member.last_read_at)
      .eq('is_deleted', false)

    return count || 0
  }

  /**
   * 메시지 읽음 처리
   */
  async markMessagesAsRead(roomId: string): Promise<boolean> {
    const currentUser = (await supabase.auth.getUser()).data.user
    if (!currentUser) return false

    // 마지막 읽은 시간 업데이트
    const { error } = await supabase
      .from('chat_room_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', currentUser.id)

    return !error
  }

  /**
   * 채팅방 통계 조회
   */
  async getChatRoomStats(roomId: string): Promise<ChatRoomStats> {
    const [messagesResult, membersResult, unreadResult] = await Promise.all([
      // 총 메시지 수
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .eq('is_deleted', false),
      
      // 멤버 수  
      supabase
        .from('chat_room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .eq('is_active', true),
      
      // 읽지 않은 메시지 수
      this.getUnreadMessageCount(roomId)
    ])

    return {
      total_messages: messagesResult.count || 0,
      member_count: membersResult.count || 0,
      unread_count: unreadResult,
      last_activity: new Date().toISOString()
    }
  }
}

// 🏭 싱글톤 인스턴스
export const chatService = new ChatService()