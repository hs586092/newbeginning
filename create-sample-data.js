import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, serviceKey)

async function createSampleData() {
  console.log('🚀 Creating sample data...')

  try {
    // Check if tables exist by trying to select from them
    console.log('🔍 Checking existing tables...')

    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema', { schema_name: 'public' })

    if (tablesError) {
      console.log('❌ Cannot check tables:', tablesError)
    }

    // Try to create sample posts directly
    console.log('📋 Attempting to create sample posts...')

    const samplePosts = [
      {
        title: '첫 번째 테스트 게시글',
        content: '좋아요와 댓글 테스트용 게시글입니다. 이 게시글로 기능을 테스트해보세요!',
        author_name: '테스트 사용자',
        category: 'community'
      },
      {
        title: '두 번째 테스트 게시글',
        content: '또 다른 테스트 게시글입니다. 댓글과 좋아요 기능이 잘 작동하는지 확인해보세요.',
        author_name: '테스트 사용자',
        category: 'community'
      },
      {
        title: '세 번째 테스트 게시글',
        content: '세 번째 테스트 게시글로 더 많은 데이터로 테스트해보겠습니다.',
        author_name: '테스트 사용자',
        category: 'expecting'
      }
    ]

    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i]
      console.log(`📝 Creating post ${i + 1}...`)

      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()

      if (error) {
        console.log(`❌ Error creating post ${i + 1}:`, error)
      } else {
        console.log(`✅ Post ${i + 1} created:`, data[0]?.id)
      }
    }

    // Test the posts query again
    console.log('🔍 Checking posts after creation...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, content, author_name, created_at')
      .limit(10)

    if (postsError) {
      console.log('❌ Posts query error:', postsError)
    } else {
      console.log('✅ Posts found:', posts?.length || 0)
      posts?.forEach(post => {
        console.log(`  - ${post.title} (${post.id})`)
      })
    }

  } catch (error) {
    console.error('💥 Failed to create sample data:', error)
  }
}

createSampleData().then(() => {
  console.log('🏁 Sample data creation completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Sample data creation failed:', err)
  process.exit(1)
})