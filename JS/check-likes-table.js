// Check actual likes table structure
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://spgcihtrquywmaieflue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2NpaHRycXV5d21haWVmbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjU2OTYsImV4cCI6MjA3MjIwMTY5Nn0.MjUPXYGYcwEzyPuNG4t5lGFkfEYrYZP7-mKER6CCuJc'
)

async function checkLikesTable() {
  console.log('🔍 Checking likes table structure...')
  
  // Try different possible table names
  const possibleTables = ['likes', 'post_likes', 'comment_likes']
  
  for (const tableName of possibleTables) {
    try {
      console.log(`\nTrying table: ${tableName}`)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3)
      
      if (error) {
        console.log(`❌ ${tableName}:`, error.message)
      } else {
        console.log(`✅ ${tableName} exists:`, data)
      }
    } catch (err) {
      console.log(`💥 ${tableName} error:`, err.message)
    }
  }
  
  // Check RPC functions that might show us table structure
  console.log('\n🔍 Checking RPC function definitions...')
  
  try {
    // Try to get detailed error from toggle_post_like
    const { data, error } = await supabase.rpc('toggle_post_like', {
      p_post_id: '6d3a1589-197f-4802-b9c4-0a7e9be92c9d',
      p_user_id: '00000000-0000-0000-0000-000000000000'
    })
    
    console.log('toggle_post_like result:', { data, error })
  } catch (err) {
    console.log('toggle_post_like error:', err)
  }
}

checkLikesTable()