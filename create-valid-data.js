import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, serviceKey)

async function createValidData() {
  console.log('🚀 Creating valid profiles and posts...')

  try {
    // 1. Create test profiles first
    const testProfiles = [
      {
        id: 'a1111111-1111-1111-1111-111111111111',
        username: 'testuser1',
        avatar_url: null
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        username: 'testuser2',
        avatar_url: null
      }
    ]

    console.log('👤 Creating profiles...')
    for (const profile of testProfiles) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()

      if (error) {
        console.log(`❌ Profile error (${profile.username}):`, error)
      } else {
        console.log(`✅ Profile created: ${profile.username}`)
      }
    }

    // 2. Create sample posts with valid user_ids
    const samplePosts = [
      {
        user_id: 'a1111111-1111-1111-1111-111111111111',
        title: '첫 번째 테스트 게시글 - 좋아요 기능 테스트',
        content: '이 게시글로 좋아요 기능을 테스트해보세요! 하트 버튼을 눌러보시면 됩니다.',
        author_name: 'testuser1'
      },
      {
        user_id: 'b2222222-2222-2222-2222-222222222222',
        title: '두 번째 테스트 게시글 - 댓글 기능 테스트',
        content: '이 게시글로 댓글 기능을 테스트해보세요! 댓글 버튼을 눌러서 댓글을 달아보시면 됩니다.',
        author_name: 'testuser2'
      },
      {
        user_id: 'a1111111-1111-1111-1111-111111111111',
        title: '세 번째 테스트 게시글 - 종합 기능 테스트',
        content: '좋아요와 댓글 모두 테스트해보세요! 모든 기능이 정상 작동하는지 확인해보겠습니다.',
        author_name: 'testuser1'
      }
    ]

    console.log('📝 Creating posts...')
    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i]
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()

      if (error) {
        console.log(`❌ Post error (${i + 1}):`, error)
      } else {
        console.log(`✅ Post ${i + 1} created: ${data[0]?.id}`)
        console.log(`   Title: ${data[0]?.title}`)
      }
    }

    // 3. Verify the data
    console.log('🔍 Verifying created data...')

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        author_name,
        user_id,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (postsError) {
      console.log('❌ Posts verification error:', postsError)
    } else {
      console.log(`✅ Total posts found: ${posts?.length || 0}`)
      posts?.forEach((post, index) => {
        console.log(`📄 Post ${index + 1}:`)
        console.log(`   ID: ${post.id}`)
        console.log(`   Title: ${post.title}`)
        console.log(`   Author: ${post.author_name}`)
        console.log(`   User ID: ${post.user_id}`)
      })
    }

  } catch (error) {
    console.error('💥 Failed to create valid data:', error)
  }
}

createValidData().then(() => {
  console.log('🏁 Valid data creation completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Valid data creation failed:', err)
  process.exit(1)
})