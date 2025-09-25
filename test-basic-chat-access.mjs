/**
 * 🚨 Emergency Chat System Test
 * 기본적인 데이터베이스 접근 테스트
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testBasicAccess() {
  console.log('🚨 Emergency Chat System Test\n')

  try {
    // 1. Test chat_messages basic select
    console.log('1️⃣ Testing chat_messages basic access...')
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(5)

    if (messagesError) {
      console.log('❌ chat_messages error:', messagesError.message)
    } else {
      console.log(`✅ chat_messages: ${messages?.length || 0} rows`)
    }

    // 2. Test specific failing query
    console.log('\n2️⃣ Testing specific failing query...')
    const { data: specificMessages, error: specificError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', '6d33da32-cf00-400c-bba8-34f1ae115bca')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (specificError) {
      console.log('❌ Specific query error:', specificError.message)
      console.log('Full error:', JSON.stringify(specificError, null, 2))
    } else {
      console.log(`✅ Specific query: ${specificMessages?.length || 0} messages`)
    }

    // 3. Test chat_rooms
    console.log('\n3️⃣ Testing chat_rooms access...')
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .limit(5)

    if (roomsError) {
      console.log('❌ chat_rooms error:', roomsError.message)
    } else {
      console.log(`✅ chat_rooms: ${rooms?.length || 0} rows`)
    }

    // 4. Test chat_room_members
    console.log('\n4️⃣ Testing chat_room_members access...')
    const { data: members, error: membersError } = await supabase
      .from('chat_room_members')
      .select('*')
      .limit(5)

    if (membersError) {
      console.log('❌ chat_room_members error:', membersError.message)
    } else {
      console.log(`✅ chat_room_members: ${members?.length || 0} rows`)
    }

    // 5. Test with anon role (like frontend)
    console.log('\n5️⃣ Testing with anon role...')
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0')

    const { data: anonMessages, error: anonError } = await anonClient
      .from('chat_messages')
      .select('*')
      .limit(1)

    if (anonError) {
      console.log('❌ Anon role error:', anonError.message)
    } else {
      console.log(`✅ Anon role: ${anonMessages?.length || 0} messages accessible`)
    }

    console.log('\n📊 Summary:')
    console.log('- Service role queries should work')
    console.log('- If anon role fails, it\'s an RLS/permission issue')
    console.log('- 500 errors indicate server-side problems')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBasicAccess()