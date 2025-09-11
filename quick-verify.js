#!/usr/bin/env node
/**
 * RPC 함수 배포 후 빠른 검증
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// 환경변수 로드
config({ path: path.resolve('.env.local') })

async function quickVerify() {
  console.log('🔍 RPC 함수 배포 검증 시작...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 환경변수 누락')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // get_post_comments 함수 테스트
    console.log('📡 get_post_comments 함수 테스트...')
    const { data, error } = await supabase
      .rpc('get_post_comments', { p_post_id: '33333333-3333-3333-3333-333333333333' })
    
    if (error) {
      console.error('❌ RPC 함수 오류:', error)
      return
    }
    
    console.log('✅ get_post_comments 함수 작동 성공!')
    console.log('📊 결과:', Array.isArray(data) ? `${data.length}개 댓글` : '데이터 구조 확인 필요')
    
    if (data && data.length > 0) {
      console.log('🎯 첫 번째 댓글 구조:', {
        id: data[0].id,
        content: data[0].content,
        profile_username: data[0].profile_username,
        like_count: data[0].like_count,
        reply_count: data[0].reply_count
      })
    }
    
    console.log('\n🎉 RPC 함수 배포 및 테스트 성공!')
    console.log('💡 이제 프론트엔드에서 댓글 시스템이 정상적으로 작동할 것입니다.')
    
  } catch (err) {
    console.error('❌ 검증 오류:', err.message)
  }
}

quickVerify()