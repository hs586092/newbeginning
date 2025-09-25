/**
 * 채팅 시스템 진단 및 수정 스크립트
 * Long-term perspective 기반 견고한 아키텍처 구축
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnoseAndFix() {
  console.log('🔍 채팅 시스템 전체 진단 시작...\n')

  try {
    // 1. 테이블 존재 확인
    console.log('1️⃣ 테이블 존재 확인')
    const tables = ['profiles', 'chat_rooms', 'chat_participants', 'chat_messages', 'chat_room_members']

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: 존재 (${data?.length || 0} rows sample)`)
      }
    }

    // 2. 스키마 일관성 확인
    console.log('\n2️⃣ 스키마 일관성 확인')

    // 채팅방 테이블 구조 확인
    console.log('\n📋 chat_rooms 테이블 구조:')
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .limit(1)

    if (rooms && rooms.length > 0) {
      console.log('✅ chat_rooms 컬럼들:', Object.keys(rooms[0]))
    }

    // 채팅 메시지 테이블 구조 확인
    console.log('\n💬 chat_messages 테이블 구조:')
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1)

    if (messages && messages.length > 0) {
      console.log('✅ chat_messages 컬럼들:', Object.keys(messages[0]))
    }

    // 3. 기본 쿼리 테스트
    console.log('\n3️⃣ 기본 쿼리 테스트')

    // 단순 채팅방 조회
    const { data: simpleRooms, error: simpleError } = await supabase
      .from('chat_rooms')
      .select('*')
      .limit(5)

    if (simpleError) {
      console.log('❌ 단순 채팅방 조회 실패:', simpleError.message)
    } else {
      console.log(`✅ 단순 채팅방 조회 성공: ${simpleRooms?.length || 0}개`)
    }

    // 단순 메시지 조회
    const { data: simpleMessages, error: simpleMessagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(5)

    if (simpleMessagesError) {
      console.log('❌ 단순 메시지 조회 실패:', simpleMessagesError.message)
    } else {
      console.log(`✅ 단순 메시지 조회 성공: ${simpleMessages?.length || 0}개`)
    }

    // 4. 관계 테이블 확인
    console.log('\n4️⃣ 관계 테이블 확인')

    // chat_participants vs chat_room_members 중복 확인
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('*')
      .limit(1)

    const { data: members } = await supabase
      .from('chat_room_members')
      .select('*')
      .limit(1)

    console.log('chat_participants 존재:', !!participants)
    console.log('chat_room_members 존재:', !!members)

    if (participants && members) {
      console.log('⚠️ 중복된 관계 테이블이 존재합니다. 정리가 필요합니다.')
    }

    // 5. 사용자 데이터 확인
    console.log('\n5️⃣ 사용자 데이터 확인')
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .limit(3)

    if (usersError) {
      console.log('❌ 사용자 데이터 조회 실패:', usersError.message)
    } else {
      console.log(`✅ 사용자 데이터: ${users?.length || 0}명`)
      users?.forEach(user => {
        console.log(`  - ${user.username || user.full_name || user.id}`)
      })
    }

    console.log('\n✅ 진단 완료!')
    console.log('\n📊 권장사항:')
    console.log('1. 단순한 쿼리만 사용 (복잡한 조인 금지)')
    console.log('2. 에러 처리 강화')
    console.log('3. 스키마 정리 및 일관성 확보')
    console.log('4. Fallback 메커니즘 구현')

  } catch (error) {
    console.error('❌ 진단 중 오류 발생:', error)
  }
}

diagnoseAndFix()