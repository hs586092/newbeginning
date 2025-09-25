// 게시글 작성 기능 테스트 스크립트
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPostCreation() {
  console.log('🧪 게시글 작성 기능 테스트\n')

  try {
    // 1. posts 테이블 구조 확인
    console.log('📋 1. posts 테이블 구조 확인:')

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1)

    if (postsError) {
      console.log(`❌ posts 테이블 조회 오류: ${postsError.message}`)
      return
    } else {
      console.log(`✅ posts 테이블 정상 조회: ${posts.length}개 레코드`)
      if (posts.length > 0) {
        console.log('   컬럼 목록:', Object.keys(posts[0]).join(', '))
      }
    }

    // 2. 테스트 게시글 작성 시도
    console.log('\n✍️ 2. 테스트 게시글 작성 시도:')

    // 첫 번째 사용자의 ID 가져오기
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .limit(1)

    if (profilesError || !profiles?.length) {
      console.log('❌ 사용자 프로필을 찾을 수 없습니다')
      return
    }

    const testUser = profiles[0]
    console.log(`👤 테스트 사용자: ${testUser.username} (ID: ${testUser.id})`)

    // 테스트 게시글 데이터
    const testPost = {
      title: '🧪 테스트 게시글 - 실제 데이터 연동 완료!',
      content: `안녕하세요! 이 게시글은 시스템 테스트용입니다.

🎉 **실제 데이터베이스 연동 완료**:
- ✅ 카테고리 시스템 작동
- ✅ 그룹 가입 기능 작동
- ✅ 포인트 시스템 작동
- ✅ 게시글 작성 기능 테스트

100% 실제 데이터로 첫돌까지 커뮤니티가 정상 작동 중입니다! 🚀`,
      author_id: testUser.id,
      baby_month: 8,
      category: '시스템 테스트',
      is_anonymous: false,
      tags: ['테스트', '데이터베이스', '연동완료'],
      likes_count: 5,
      comments_count: 2,
      views_count: 15
    }

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert([testPost])
      .select()

    if (insertError) {
      console.log(`❌ 게시글 작성 실패: ${insertError.message}`)
      console.log('   에러 세부사항:', insertError)
    } else {
      console.log(`✅ 게시글 작성 성공!`)
      console.log(`   제목: ${newPost[0].title}`)
      console.log(`   작성자: ${testUser.username}`)
      console.log(`   카테고리: ${newPost[0].category}`)
      console.log(`   아기 개월 수: ${newPost[0].baby_month}개월`)
      console.log(`   태그: ${newPost[0].tags?.join(', ') || '없음'}`)
    }

    // 3. 전체 게시글 수 확인
    console.log('\n📊 3. 전체 게시글 현황:')
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log(`❌ 게시글 수 조회 오류: ${countError.message}`)
    } else {
      console.log(`📝 전체 게시글 수: ${count}개`)
    }

    // 4. 최근 게시글 목록 확인
    console.log('\n📋 4. 최근 게시글 목록:')
    const { data: recentPosts, error: recentError } = await supabase
      .from('posts')
      .select('title, category, baby_month, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      console.log(`❌ 최근 게시글 조회 오류: ${recentError.message}`)
    } else {
      recentPosts.forEach((post, i) => {
        const date = new Date(post.created_at).toLocaleString('ko-KR')
        console.log(`   ${i + 1}. [${post.category}] ${post.title} (${post.baby_month}개월, ${date})`)
      })
    }

  } catch (error) {
    console.error('🚨 전체 테스트 실행 중 오류:', error)
  }

  console.log('\n🏁 게시글 작성 기능 테스트 완료!')
}

testPostCreation()