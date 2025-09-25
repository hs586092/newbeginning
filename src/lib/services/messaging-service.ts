import { createClient } from '@/lib/supabase/client'
import {
  Conversation,
  ConversationParticipant,
  Message,
  ConversationWithDetails,
  MessageWithProfile
} from '@/types/database.types'

const supabase = createClient()

export class MessagingService {
  // Create or get private conversation between two users
  static async getOrCreatePrivateConversation(otherUserId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(*)
        `)
        .eq('conversations.type', 'private')
        .eq('user_id', user.id)

      if (existingConversation) {
        for (const participant of existingConversation) {
          // Check if this conversation includes the other user
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', otherUserId)
            .single()

          if (otherParticipant) {
            return participant.conversation_id
          }
        }
      }

      // Create new private conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          type: 'private',
          created_by: user.id
        })
        .select()
        .single()

      if (conversationError) throw conversationError

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: user.id,
            role: 'member'
          },
          {
            conversation_id: conversation.id,
            user_id: otherUserId,
            role: 'member'
          }
        ])

      if (participantsError) throw participantsError

      return conversation.id
    } catch (error) {
      console.error('개인 대화 생성 오류:', error)
      return null
    }
  }

  // Create group conversation
  static async createGroupConversation({
    name,
    description,
    participantIds
  }: {
    name: string
    description?: string
    participantIds: string[]
  }): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Create group conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          type: 'group',
          name,
          description,
          created_by: user.id
        })
        .select()
        .single()

      if (conversationError) throw conversationError

      // Add creator as admin
      const participants = [
        {
          conversation_id: conversation.id,
          user_id: user.id,
          role: 'admin' as const
        },
        ...participantIds.map(userId => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'member' as const
        }))
      ]

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants)

      if (participantsError) throw participantsError

      return conversation.id
    } catch (error) {
      console.error('그룹 대화 생성 오류:', error)
      return null
    }
  }

  // Get user's conversations
  static async getUserConversations(): Promise<ConversationWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: conversationParticipants, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          last_read_at,
          conversations!inner(*),
          conversation_participants:conversation_participants!conversation_participants_conversation_id_fkey!inner(
            user_id,
            role,
            profiles!inner(username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('conversations.updated_at', { ascending: false })

      if (error) throw error

      const conversationsWithDetails: ConversationWithDetails[] = []

      for (const participant of conversationParticipants) {
        const conversation = participant.conversations

        // Get last message
        const { data: lastMessage } = await supabase
          .from('chat_messages')
          .select(`
            *,
            profiles!inner(username, avatar_url)
          `)
          .eq('conversation_id', conversation.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .neq('user_id', user.id)
          .gt('created_at', participant.last_read_at || '1970-01-01')
          .eq('is_deleted', false)

        conversationsWithDetails.push({
          ...conversation,
          participants: participant.conversation_participants,
          last_message: lastMessage,
          unread_count: unreadCount || 0
        })
      }

      return conversationsWithDetails
    } catch (error) {
      console.error('대화 목록 조회 오류:', error)
      return []
    }
  }

  // Get messages from a conversation
  static async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<MessageWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('메시지 조회 오류:', error)
      return []
    }
  }

  // Send message
  static async sendMessage({
    conversationId,
    content,
    messageType = 'text',
    replyToId
  }: {
    conversationId: string
    content: string
    messageType?: 'text' | 'image' | 'file'
    replyToId?: string
  }): Promise<MessageWithProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Send message
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          content,
          message_type: messageType,
          reply_to_id: replyToId
        })
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url)
        `)
        .single()

      if (messageError) throw messageError

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      // Update sender's last_read_at
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)

      return message
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      return null
    }
  }

  // Mark conversation as read
  static async markAsRead(conversationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)

      return !error
    } catch (error) {
      console.error('읽음 처리 오류:', error)
      return false
    }
  }

  // Delete message
  static async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('user_id', user.id)

      return !error
    } catch (error) {
      console.error('메시지 삭제 오류:', error)
      return false
    }
  }

  // Edit message
  static async editMessage(messageId: string, content: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('chat_messages')
        .update({
          content,
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id)

      return !error
    } catch (error) {
      console.error('메시지 수정 오류:', error)
      return false
    }
  }

  // Leave conversation
  static async leaveConversation(conversationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('conversation_participants')
        .update({ is_active: false })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)

      return !error
    } catch (error) {
      console.error('대화 나가기 오류:', error)
      return false
    }
  }

  // Add participants to group conversation
  static async addParticipants(conversationId: string, userIds: string[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check if user is admin or owner
      const { data: userRole } = await supabase
        .from('conversation_participants')
        .select('role')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!userRole || !['admin', 'owner'].includes(userRole.role)) {
        throw new Error('권한이 없습니다')
      }

      const participants = userIds.map(userId => ({
        conversation_id: conversationId,
        user_id: userId,
        role: 'member' as const
      }))

      const { error } = await supabase
        .from('conversation_participants')
        .insert(participants)

      return !error
    } catch (error) {
      console.error('참가자 추가 오류:', error)
      return false
    }
  }

  // Subscribe to real-time messages for a conversation
  static subscribeToMessages(
    conversationId: string,
    callback: (message: MessageWithProfile) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the complete message with profile info
          const { data: message } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles!inner(username, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (message) {
            callback(message as MessageWithProfile)
          }
        }
      )
      .subscribe()
  }

  // Subscribe to conversation list updates
  static subscribeToConversations(callback: (conversations: ConversationWithDetails[]) => void) {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          // Reload conversations when any conversation changes
          this.getUserConversations().then(callback)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        () => {
          // Reload conversations when any message changes
          this.getUserConversations().then(callback)
        }
      )
      .subscribe()
  }
}