/**
 * 🔍 프론트엔드 채팅 통합 테스트
 * RobustChatService의 실제 동작 분석
 */

import { createClient } from '@supabase/supabase-js'

// 프론트엔드와 동일한 설정 사용
const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// RobustChatService의 로직을 시뮬레이션
class TestChatService {

  static async getUserRooms() {
    console.log('🧪 테스트: getUserRooms 시뮬레이션')

    try {
      // 1단계: 사용자 인증 확인 (실제 앱에서 실패할 가능성)
      const { data: { user } } = await supabase.auth.getUser()
      console.log(`   사용자 인증: ${user ? '✅ 성공' : '❌ 실패'}`)

      if (!user) {
        console.log('   ⚠️ 인증되지 않은 사용자 - 빈 배열 반환')
        return []
      }

      console.log(`   사용자 ID: ${user.id}`)

      // 2단계: 멤버십 조회
      const { data: memberships, error: membershipError } = await supabase
        .from('chat_room_members')
        .select('room_id, role, last_read_at')
        .eq('user_id', user.id)
        .eq('is_active', true)

      console.log(`   멤버십 조회: ${!membershipError ? '✅' : '❌'}`)
      if (membershipError) {
        console.log(`   오류: ${membershipError.message}`)
        return []
      }

      console.log(`   멤버십: ${memberships?.length || 0}개`)

      if (!memberships || memberships.length === 0) {
        console.log('   ⚠️ 참여 중인 채팅방 없음')
        return []
      }

      const roomIds = memberships.map(m => m.room_id)
      console.log(`   채팅방 IDs: ${roomIds.join(', ')}`)

      // 3단계: 채팅방 기본 정보 조회
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('*')
        .in('id', roomIds)
        .order('updated_at', { ascending: false })

      console.log(`   채팅방 조회: ${!roomsError ? '✅' : '❌'}`)
      if (roomsError) {
        console.log(`   오류: ${roomsError.message}`)
        return []
      }

      console.log(`   채팅방: ${rooms?.length || 0}개`)

      return rooms || []

    } catch (error) {
      console.log(`   ❌ 예외 발생: ${error.message}`)
      return []
    }
  }

  static async getRoomMessages(roomId) {
    console.log(`🧪 테스트: getRoomMessages('${roomId}')`)

    try {
      // 1단계: 기본 메시지 조회
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50)

      console.log(`   메시지 조회: ${!messagesError ? '✅' : '❌'}`)
      if (messagesError) {
        console.log(`   오류: ${messagesError.message}`)
        return []
      }

      console.log(`   메시지: ${messages?.length || 0}개`)

      if (!messages || messages.length === 0) {
        return []
      }

      // 2단계: 발신자 정보 조회
      const senderIds = [...new Set(messages.map(m => m.sender_id))]
      console.log(`   발신자 IDs: ${senderIds.join(', ')}`)

      const { data: senders, error: sendersError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds)

      console.log(`   발신자 조회: ${!sendersError ? '✅' : '❌'}`)
      if (sendersError) {
        console.log(`   오류: ${sendersError.message}`)
      }

      const sendersMap = new Map(senders?.map(s => [s.id, s]) || [])
      console.log(`   발신자: ${sendersMap.size}명`)

      // 3단계: 메시지와 발신자 결합
      const messagesWithDetails = messages.map(message => ({
        ...message,
        sender: sendersMap.get(message.sender_id) || null
      }))

      return messagesWithDetails.reverse()

    } catch (error) {
      console.log(`   ❌ 예외 발생: ${error.message}`)
      return []
    }
  }

  static async sendMessage(roomId, content, replyToId = null) {
    console.log(`🧪 테스트: sendMessage('${roomId}', '${content}')`)

    try {
      // 1단계: 사용자 인증 확인
      const { data: { user } } = await supabase.auth.getUser()
      console.log(`   사용자 인증: ${user ? '✅' : '❌'}`)

      if (!user) {
        console.log('   ❌ 인증되지 않은 사용자')
        return false
      }

      // 2단계: 메시지 삽입
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content,
          message_type: 'text',
          reply_to_id: replyToId
        })

      console.log(`   메시지 삽입: ${!insertError ? '✅' : '❌'}`)
      if (insertError) {
        console.log(`   오류: ${insertError.message}`)
        return false
      }

      return true

    } catch (error) {
      console.log(`   ❌ 예외 발생: ${error.message}`)
      return false
    }
  }
}

async function testFrontendIntegration() {
  console.log('🔍 프론트엔드 채팅 통합 테스트\n')
  console.log('=' .repeat(60))

  // 1. 인증 상태 확인
  console.log('\n1️⃣ 인증 상태 확인')
  const { data: authData, error: authError } = await supabase.auth.getSession()
  console.log(`   현재 세션: ${authData?.session ? '✅ 활성' : '❌ 없음'}`)
  console.log(`   사용자: ${authData?.session?.user?.id || 'N/A'}`)

  // 2. 채팅방 목록 테스트
  console.log('\n2️⃣ 채팅방 목록 테스트')
  const rooms = await TestChatService.getUserRooms()
  console.log(`   결과: ${rooms.length}개 채팅방`)

  // 3. 메시지 조회 테스트 (첫 번째 채팅방)
  if (rooms.length > 0) {
    console.log('\n3️⃣ 메시지 조회 테스트')
    const messages = await TestChatService.getRoomMessages(rooms[0].id)
    console.log(`   결과: ${messages.length}개 메시지`)
  } else {
    console.log('\n3️⃣ 메시지 조회 테스트')
    console.log('   ⚠️ 테스트할 채팅방 없음')
  }

  // 4. 실제 채팅방 데이터로 테스트
  console.log('\n4️⃣ 실제 채팅방 데이터로 테스트')
  const testRoomId = '6d33da32-cf00-400c-bba8-34f1ae115bca'
  const testMessages = await TestChatService.getRoomMessages(testRoomId)
  console.log(`   테스트 채팅방 메시지: ${testMessages.length}개`)

  // 5. 결론
  console.log('\n📊 분석 결론')
  console.log('=' .repeat(60))

  if (!authData?.session) {
    console.log('❌ 핵심 문제: 사용자 인증 세션 없음')
    console.log('   - 프론트엔드에서 로그인이 필요함')
    console.log('   - auth.getUser()가 null 반환')
    console.log('   - 모든 사용자별 기능이 작동 불가')
  } else {
    console.log('✅ 인증 정상 - 다른 문제 존재')
  }

  if (rooms.length === 0 && authData?.session) {
    console.log('⚠️ 문제: 사용자가 참여 중인 채팅방 없음')
    console.log('   - chat_room_members 테이블에 데이터 필요')
    console.log('   - 테스트 사용자를 채팅방에 추가 필요')
  }
}

testFrontendIntegration()