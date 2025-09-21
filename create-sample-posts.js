/**
 * 새 Supabase 프로젝트에 샘플 게시글 생성
 */

import { createClient } from '@supabase/supabase-js'

// 새 Supabase 프로젝트 설정
const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSampleData() {
  console.log('🏗️ Creating sample data in new Supabase project...')

  try {
    // 1. 샘플 사용자 생성 (수동으로 생성해야 함)
    console.log('ℹ️ Note: You need to create test users through Supabase Auth')

    // 2. 샘플 프로필 생성 (테스트용)
    const sampleUserId = '00000000-0000-0000-0000-000000000001'

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: sampleUserId,
        username: '임신맘',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (profileError) {
      console.log('ℹ️ Profile creation skipped (user auth required):', profileError.message)
    } else {
      console.log('✅ Sample profile created')
    }

    // 3. 샘플 게시글 생성
    const samplePosts = [
      {
        user_id: sampleUserId,
        title: '임신 8주차, 입덧이 심해요 😷',
        content: '임신 8주차인데 입덧이 너무 심해서 아무것도 먹을 수가 없어요. 혹시 비슷한 경험 있으신 분 계신가요? 어떻게 극복하셨는지 궁금해요.',
        author_name: '임신맘',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: sampleUserId,
        title: '신생아용품 준비 리스트 공유해요 👶',
        content: '첫째 준비할 때 너무 많이 샀다가 후회해서, 둘째는 꼭 필요한 것만 준비하려고 해요. 신생아 필수용품 리스트 공유할게요!',
        author_name: '임신맘',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: sampleUserId,
        title: '육아휴직 신청 방법 문의드려요 💼',
        content: '육아휴직 신청하려고 하는데 절차가 복잡해서요. 혹시 최근에 신청하신 분 계시면 팁 좀 알려주세요!',
        author_name: '임신맘',
        created_at: new Date().toISOString()
      }
    ]

    for (const post of samplePosts) {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()

      if (error) {
        console.log('❌ Post creation error:', error.message)
      } else {
        console.log('✅ Sample post created:', data[0].title)
      }
    }

    console.log('\n🎉 Sample data creation completed!')
    console.log('ℹ️ Note: To test user-specific features, you need to:')
    console.log('   1. Create real users through authentication')
    console.log('   2. Update post user_ids to match real users')

  } catch (error) {
    console.error('💥 Error creating sample data:', error)
  }
}

createSampleData()