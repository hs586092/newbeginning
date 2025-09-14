// Test database connection and RPC functions
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://spgcihtrquywmaieflue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2NpaHRycXV5d21haWVmbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjU2OTYsImV4cCI6MjA3MjIwMTY5Nn0.MjUPXYGYcwEzyPuNG4t5lGFkfEYrYZP7-mKER6CCuJc'
)

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection and RPC functions...')
  
  try {
    // 1. Test basic connection
    console.log('\n1. Testing basic connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('posts')
      .select('id, title')
      .limit(3)
    
    if (healthError) {
      console.error('❌ Connection Error:', healthError)
    } else {
      console.log('✅ Connection OK. Sample posts:', healthCheck)
    }
    
    // 2. Check if RPC functions exist
    console.log('\n2. Testing RPC functions...')
    
    // Test toggle_post_like function
    if (healthCheck && healthCheck.length > 0) {
      const samplePostId = healthCheck[0].id
      console.log(`Testing with post ID: ${samplePostId}`)
      
      // First check if function exists by trying to call it
      const { data: likeResult, error: likeError } = await supabase
        .rpc('toggle_post_like', {
          p_post_id: samplePostId,
          p_user_id: '00000000-0000-0000-0000-000000000000' // dummy UUID
        })
      
      if (likeError) {
        console.error('❌ toggle_post_like Error:', likeError.message)
        if (likeError.message.includes('function')) {
          console.log('🚨 RPC function may not be deployed to database!')
        }
      } else {
        console.log('✅ toggle_post_like function exists:', likeResult)
      }
      
      // Test get_post_likes function  
      const { data: getLikesResult, error: getLikesError } = await supabase
        .rpc('get_post_likes', {
          p_post_id: samplePostId
        })
      
      if (getLikesError) {
        console.error('❌ get_post_likes Error:', getLikesError.message)
      } else {
        console.log('✅ get_post_likes function exists:', getLikesResult)
      }
      
      // Test get_post_comments function
      const { data: getCommentsResult, error: getCommentsError } = await supabase
        .rpc('get_post_comments', {
          p_post_id: samplePostId
        })
      
      if (getCommentsError) {
        console.error('❌ get_post_comments Error:', getCommentsError.message)
      } else {
        console.log('✅ get_post_comments function exists:', getCommentsResult)
      }
    }
    
    // 3. Check tables structure
    console.log('\n3. Checking database tables...')
    
    const { data: likesTable, error: likesError } = await supabase
      .from('post_likes')
      .select('*')
      .limit(1)
    
    if (likesError) {
      console.error('❌ post_likes table Error:', likesError)
    } else {
      console.log('✅ post_likes table exists:', likesTable)
    }
    
    const { data: commentsTable, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(1)
    
    if (commentsError) {
      console.error('❌ comments table Error:', commentsError)  
    } else {
      console.log('✅ comments table exists:', commentsTable)
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testDatabaseConnection()