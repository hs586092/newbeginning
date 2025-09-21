import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, serviceKey)

async function executeRPCCreation() {
  console.log('🔧 Creating missing RPC functions...')

  try {
    const sqlContent = fs.readFileSync('create-missing-functions.sql', 'utf8')

    // Split SQL by semicolons and execute each statement
    const statements = sqlContent.split(';').filter(s => s.trim().length > 0)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement && !statement.startsWith('--') && !statement.startsWith('SELECT')) {
        console.log(`📋 Executing statement ${i + 1}...`)

        const { error } = await supabase.rpc('query', { query: statement })

        if (error) {
          console.log(`❌ Statement ${i + 1} error:`, error)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }

    // Test the created functions
    console.log('\n🧪 Testing created functions...')

    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .limit(1)

    if (posts && posts.length > 0) {
      const testPostId = posts[0].id

      // Test get_post_likes
      const { data: likes, error: likesError } = await supabase
        .rpc('get_post_likes', { p_post_id: testPostId })

      if (likesError) {
        console.log('❌ get_post_likes test error:', likesError)
      } else {
        console.log('✅ get_post_likes test success:', likes)
      }

      // Test toggle_like
      const { data: toggleResult, error: toggleError } = await supabase
        .rpc('toggle_like', { p_post_id: testPostId })

      if (toggleError) {
        console.log('❌ toggle_like test error:', toggleError)
      } else {
        console.log('✅ toggle_like test success:', toggleResult)
      }
    }

  } catch (error) {
    console.error('💥 Failed to create RPC functions:', error)
  }
}

executeRPCCreation().then(() => {
  console.log('🏁 RPC function creation completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 RPC function creation failed:', err)
  process.exit(1)
})