import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')

  // Test basic connection
  try {
    const { data, error } = await supabase.from('posts').select('count').single()
    console.log('✅ Basic connection test:', { data, error })
  } catch (err) {
    console.log('❌ Basic connection error:', err)
  }

  // List all posts with detailed info
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content, user_id, created_at')
      .limit(5)

    console.log('📋 Posts data:', posts)
    if (error) console.log('❌ Posts error:', error)

    if (posts && posts.length > 0) {
      console.log('🔍 First post analysis:')
      const firstPost = posts[0]
      console.log({
        id: firstPost.id,
        idType: typeof firstPost.id,
        idLength: firstPost.id?.length,
        isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(firstPost.id)
      })
    }
  } catch (err) {
    console.log('❌ Posts query error:', err)
  }

  // Test RPC functions
  try {
    console.log('🔍 Testing RPC functions...')

    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('get_post_likes', { p_post_id: '00000000-0000-0000-0000-000000000000' })

    console.log('📋 RPC test (get_post_likes):', { rpcResult, rpcError })
  } catch (err) {
    console.log('❌ RPC error:', err)
  }

  // Test auth status
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    console.log('🔐 Auth status:', {
      hasSession: !!session,
      userId: session?.user?.id,
      authError
    })
  } catch (err) {
    console.log('❌ Auth error:', err)
  }
}

testConnection().then(() => {
  console.log('🏁 Connection test completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Test failed:', err)
  process.exit(1)
})