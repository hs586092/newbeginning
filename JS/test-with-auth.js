// Test with actual authentication
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://spgcihtrquywmaieflue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2NpaHRycXV5d21haWVmbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjU2OTYsImV4cCI6MjA3MjIwMTY5Nn0.MjUPXYGYcwEzyPuNG4t5lGFkfEYrYZP7-mKER6CCuJc'
)

async function testWithRealAuth() {
  console.log('🔍 Testing with real authentication...')
  
  // Show available test users from likes table
  const { data: existingLikes } = await supabase
    .from('likes')
    .select('user_id')
    .limit(5)
  
  console.log('Available test users from likes:', existingLikes)
  
  if (existingLikes && existingLikes.length > 0) {
    const testUserId = existingLikes[0].user_id
    console.log(`\nUsing test user: ${testUserId}`)
    
    // Test RPC with real user ID
    const testPostId = '6d3a1589-197f-4802-b9c4-0a7e9be92c9d'
    
    console.log('Testing toggle_post_like with real user...')
    const { data: toggleResult, error: toggleError } = await supabase
      .rpc('toggle_post_like', {
        p_post_id: testPostId,
        p_user_id: testUserId
      })
    
    console.log('Toggle result:', { toggleResult, toggleError })
    
    // Test get_post_likes
    console.log('Testing get_post_likes...')
    const { data: getLikesResult, error: getLikesError } = await supabase
      .rpc('get_post_likes', {
        p_post_id: testPostId
      })
    
    console.log('Get likes result:', { getLikesResult, getLikesError })
  }
  
  // Check if RLS policies allow anonymous access
  console.log('\nChecking RLS policies...')
  
  // Try to read likes table directly
  const { data: directLikes, error: directError } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', '6d3a1589-197f-4802-b9c4-0a7e9be92c9d')
  
  console.log('Direct likes query:', { directLikes, directError })
}

testWithRealAuth()