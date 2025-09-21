import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug406Error() {
  console.log('🔍 Debugging 406 error...')

  const testPostId = '51310d67-fa04-4a02-80fa-16c83e4b00bb'
  const testUserId = 'de4ff961-6dbb-4c6b-8a1c-960575c62037'

  try {
    // 1. Test the exact failing query from the error
    console.log('📋 Testing problematic query...')
    const { data, error, status } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', testPostId)
      .eq('user_id', testUserId)
      .single()

    console.log('Result:', { data, error, status })

    // 2. Test without .single()
    console.log('\n📋 Testing without .single()...')
    const { data: data2, error: error2 } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', testPostId)
      .eq('user_id', testUserId)

    console.log('Result:', { data: data2, error: error2, length: data2?.length })

    // 3. Test RPC function instead
    console.log('\n📋 Testing RPC function...')
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('toggle_post_like', {
        p_post_id: testPostId,
        p_user_id: testUserId
      })

    console.log('RPC Result:', { rpcData, rpcError })

    // 4. Test getting like count
    console.log('\n📋 Testing like count...')
    const { data: countData, error: countError } = await supabase
      .rpc('get_post_like_count', { p_post_id: testPostId })

    console.log('Count Result:', { countData, countError })

    // 5. Test table permissions
    console.log('\n📋 Testing table permissions...')
    const { data: allLikes, error: allError } = await supabase
      .from('post_likes')
      .select('*')
      .limit(5)

    console.log('All likes:', { allLikes, allError, count: allLikes?.length })

  } catch (error) {
    console.error('💥 Debug error:', error)
  }
}

debug406Error().then(() => {
  console.log('🏁 Debug completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Debug failed:', err)
  process.exit(1)
})