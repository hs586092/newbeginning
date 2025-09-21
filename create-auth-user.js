import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

// Create admin client for user creation
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestAuthUser() {
  console.log('🔐 Creating authenticated test user...')

  try {
    // Create auth user first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'testuser1@example.com',
      password: 'testpassword123',
      user_metadata: {
        username: 'testuser1'
      },
      email_confirm: true
    })

    if (authError) {
      console.log('❌ Auth user creation error:', authError)
      return
    }

    console.log('✅ Auth user created:', authUser.user.id)

    // Now create profile with the auth user's ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        username: 'testuser1',
        avatar_url: null
      })
      .select()

    if (profileError) {
      console.log('❌ Profile error:', profileError)
    } else {
      console.log('✅ Profile created:', profile[0]?.id)
    }

    // Create sample posts
    const samplePosts = [
      {
        user_id: authUser.user.id,
        title: '첫 번째 테스트 게시글 - 좋아요 기능 테스트',
        content: '이 게시글로 좋아요 기능을 테스트해보세요! 하트 버튼을 눌러보시면 됩니다.',
        author_name: 'testuser1'
      },
      {
        user_id: authUser.user.id,
        title: '두 번째 테스트 게시글 - 댓글 기능 테스트',
        content: '이 게시글로 댓글 기능을 테스트해보세요! 댓글 버튼을 눌러서 댓글을 달아보시면 됩니다.',
        author_name: 'testuser1'
      }
    ]

    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i]
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()

      if (error) {
        console.log(`❌ Post ${i + 1} error:`, error)
      } else {
        console.log(`✅ Post ${i + 1} created:`, data[0]?.id)
      }
    }

    // Verify final state
    console.log('🔍 Verifying final database state...')

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, user_id, author_name')

    if (postsError) {
      console.log('❌ Posts verification error:', postsError)
    } else {
      console.log(`✅ Total posts created: ${posts?.length || 0}`)
      posts?.forEach(post => {
        console.log(`📄 Post: ${post.title} (${post.id})`)
        console.log(`   User ID: ${post.user_id}`)
      })
    }

  } catch (error) {
    console.error('💥 Failed to create test user:', error)
  }
}

createTestAuthUser().then(() => {
  console.log('🏁 Test user creation completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Test user creation failed:', err)
  process.exit(1)
})