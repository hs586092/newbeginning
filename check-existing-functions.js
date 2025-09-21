import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkExistingFunctions() {
  console.log('🔍 Testing available RPC functions based on hints...')

  // Get a real post ID first
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .limit(1)

  if (!posts || posts.length === 0) {
    console.log('❌ No posts found to test functions')
    return
  }

  const testPostId = posts[0].id
  console.log(`📋 Using post ID for testing: ${testPostId}`)

  // Test functions based on error hints
  const functionsToTest = [
    // Based on error hints
    { name: 'get_post_like_count', args: { p_post_id: testPostId } },
    { name: 'toggle_post_like', args: { p_post_id: testPostId, p_user_id: '686579e0-d0b5-42b5-9104-a569914feb2a' } },

    // Try other variations
    { name: 'get_post_likes', args: { p_post_id: testPostId } },
    { name: 'toggle_like', args: { p_post_id: testPostId } },

    // Existing function we know works
    { name: 'get_post_comments', args: { p_post_id: testPostId } },

    // Try simple parameter versions
    { name: 'get_post_like_count', args: testPostId },
    { name: 'toggle_post_like', args: testPostId },
  ]

  for (const test of functionsToTest) {
    try {
      console.log(`🔧 Testing: ${test.name}`)
      const { data, error } = await supabase.rpc(test.name, test.args)

      if (error) {
        console.log(`❌ ${test.name}:`, error.code, error.message)
        if (error.hint) {
          console.log(`💡 Hint: ${error.hint}`)
        }
      } else {
        console.log(`✅ ${test.name} works:`, data)
      }
    } catch (err) {
      console.log(`❌ ${test.name} exception:`, err.message)
    }
    console.log('---')
  }
}

checkExistingFunctions().then(() => {
  console.log('🏁 Function testing completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Function testing failed:', err)
  process.exit(1)
})