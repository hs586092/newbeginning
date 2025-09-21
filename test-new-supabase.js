/**
 * 새 Supabase 프로젝트 연결 및 함수 테스트
 */

import { createClient } from '@supabase/supabase-js'

// 새 Supabase 프로젝트 설정
const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔍 Testing new Supabase project connection...')
  console.log('URL:', supabaseUrl)

  try {
    // 1. 테이블 존재 확인
    console.log('\n📋 Testing table access...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title')
      .limit(1)

    if (postsError) {
      console.log('❌ Posts table error:', postsError.message)
    } else {
      console.log('✅ Posts table accessible:', posts?.length || 0, 'posts found')
    }

    // 2. RPC 함수 테스트
    console.log('\n🔧 Testing RPC functions...')

    // 더미 UUID로 toggle_post_like 함수 존재 확인
    const dummyPostId = '123e4567-e89b-12d3-a456-426614174000'
    const dummyUserId = '123e4567-e89b-12d3-a456-426614174001'

    const { data: likeResult, error: likeError } = await supabase.rpc('toggle_post_like', {
      p_post_id: dummyPostId,
      p_user_id: dummyUserId
    })

    if (likeError) {
      console.log('❌ toggle_post_like error:', likeError.message)
      console.log('   Details:', likeError)
    } else {
      console.log('✅ toggle_post_like function exists')
    }

    // 3. 댓글 RPC 함수 테스트
    const { data: commentResult, error: commentError } = await supabase.rpc('get_post_comments', {
      p_post_id: dummyPostId
    })

    if (commentError) {
      console.log('❌ get_post_comments error:', commentError.message)
    } else {
      console.log('✅ get_post_comments function exists')
    }

    // 4. 인증 테스트 (익명)
    console.log('\n🔐 Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.log('❌ Auth error:', authError.message)
    } else {
      console.log('✅ Auth accessible (no user - expected for anonymous)')
    }

  } catch (error) {
    console.error('💥 General error:', error)
  }
}

testSupabaseConnection()