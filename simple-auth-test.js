// 간단한 인증 테스트 - AuthStateMachine 우회
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://spgcihtrquywmaieflue.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2NpaHRycXV5d21haWVmbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjU2OTYsImV4cCI6MjA3MjIwMTY5Nn0.MjUPXYGYcwEzyPuNG4t5lGFkfEYrYZP7-mKER6CCuJc'

async function testDirectSupabase() {
  console.log('🔍 직접 Supabase 연결 테스트...');

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('📍 현재 세션:', session ? '있음' : '없음', sessionError)

    // 2. 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('📍 현재 사용자:', user ? user.email : '없음', userError)

    // 3. 포스트 조회 테스트
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5)
    console.log('📍 포스트 조회:', posts ? `${posts.length}개` : '실패', postsError)

    // 4. RPC 함수 테스트 (좋아요)
    if (posts && posts.length > 0) {
      console.log('📍 좋아요 RPC 테스트...')
      const { data: likeResult, error: likeError } = await supabase
        .rpc('toggle_post_like', {
          p_post_id: posts[0].id,
          p_user_id: user?.id || '11111111-1111-1111-1111-111111111111'
        })
      console.log('📍 좋아요 결과:', likeResult, likeError)
    }

    return { session, user, posts }

  } catch (error) {
    console.error('❌ Supabase 테스트 오류:', error)
    return null
  }
}

testDirectSupabase().then(result => {
  if (result) {
    console.log('✅ 직접 Supabase 연결 성공')
  } else {
    console.log('❌ 직접 Supabase 연결 실패')
  }
})