import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
// Use service role key for admin operations
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, serviceKey)

async function setupDatabase() {
  console.log('🚀 Setting up database schema and functions...')

  try {
    // Read and execute schema
    const schema = fs.readFileSync('supabase-fresh-schema.sql', 'utf8')
    const rpcFunctions = fs.readFileSync('supabase-rpc-functions-fixed.sql', 'utf8')

    console.log('📋 Executing schema...')
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schema
    })

    if (schemaError) {
      console.log('❌ Schema error:', schemaError)
    } else {
      console.log('✅ Schema applied successfully')
    }

    console.log('📋 Executing RPC functions...')
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql: rpcFunctions
    })

    if (rpcError) {
      console.log('❌ RPC error:', rpcError)
    } else {
      console.log('✅ RPC functions applied successfully')
    }

    // Create sample data
    console.log('📋 Creating sample posts...')

    // First, create a test profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: '11111111-1111-1111-1111-111111111111',
        username: 'test_user',
        avatar_url: null
      })
      .select()

    if (profileError) {
      console.log('❌ Profile error:', profileError)
    } else {
      console.log('✅ Test profile created:', profile)
    }

    // Create sample posts
    const samplePosts = [
      {
        id: '22222222-2222-2222-2222-222222222222',
        user_id: '11111111-1111-1111-1111-111111111111',
        title: '첫 번째 테스트 게시글',
        content: '좋아요와 댓글 테스트용 게시글입니다.',
        author_name: 'test_user'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        user_id: '11111111-1111-1111-1111-111111111111',
        title: '두 번째 테스트 게시글',
        content: '또 다른 테스트 게시글입니다.',
        author_name: 'test_user'
      }
    ]

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .upsert(samplePosts)
      .select()

    if (postsError) {
      console.log('❌ Posts error:', postsError)
    } else {
      console.log('✅ Sample posts created:', posts)
    }

  } catch (error) {
    console.error('💥 Setup failed:', error)
  }
}

setupDatabase().then(() => {
  console.log('🏁 Database setup completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Setup failed:', err)
  process.exit(1)
})