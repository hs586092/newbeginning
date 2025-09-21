import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRPCFunctions() {
  console.log('🔍 Testing RPC functions...')

  // Get a real post ID first
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .limit(1)

  if (!posts || posts.length === 0) {
    console.log('❌ No posts found to test RPC functions')
    return
  }

  const testPostId = posts[0].id
  console.log(`📋 Using post ID for testing: ${testPostId}`)

  // Test all expected RPC functions
  const rpcTests = [
    { name: 'get_post_likes', args: { p_post_id: testPostId } },
    { name: 'get_post_comments', args: { p_post_id: testPostId } },
    { name: 'toggle_like', args: { p_post_id: testPostId } },
    { name: 'add_comment', args: { p_post_id: testPostId, p_content: 'Test comment' } }
  ]

  for (const test of rpcTests) {
    try {
      console.log(`🔧 Testing RPC function: ${test.name}`)
      const { data, error } = await supabase.rpc(test.name, test.args)

      if (error) {
        console.log(`❌ ${test.name} error:`, error.code, error.message)
      } else {
        console.log(`✅ ${test.name} works:`, data)
      }
    } catch (err) {
      console.log(`❌ ${test.name} exception:`, err.message)
    }
  }

  // Also test if we can query likes/comments tables directly
  console.log('\n📋 Testing direct table access...')

  const { data: likes, error: likesError } = await supabase
    .from('likes')
    .select('*')
    .limit(5)

  if (likesError) {
    console.log('❌ Likes table error:', likesError)
  } else {
    console.log('✅ Likes table accessible, rows:', likes?.length || 0)
  }

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .limit(5)

  if (commentsError) {
    console.log('❌ Comments table error:', commentsError)
  } else {
    console.log('✅ Comments table accessible, rows:', comments?.length || 0)
  }
}

testRPCFunctions().then(() => {
  console.log('🏁 RPC function testing completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 RPC testing failed:', err)
  process.exit(1)
})