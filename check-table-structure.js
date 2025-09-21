import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, serviceKey)

async function checkTableStructure() {
  console.log('🔍 Checking actual table structure...')

  // Try inserting with minimal required fields based on our schema
  const minimalPost = {
    title: 'Simple Test Post',
    content: 'Testing with minimal fields',
    author_name: 'Test User'
  }

  try {
    console.log('📝 Attempting minimal post creation...')
    const { data, error } = await supabase
      .from('posts')
      .insert(minimalPost)
      .select()

    if (error) {
      console.log('❌ Minimal post error:', error)

      // The error will tell us what's missing or wrong
      if (error.message.includes('user_id')) {
        console.log('🔍 user_id is required. Let me try with that...')

        // Try with a user_id (we need to check if profiles exist)
        const postWithUserId = {
          ...minimalPost,
          user_id: '11111111-1111-1111-1111-111111111111'
        }

        const { data: data2, error: error2 } = await supabase
          .from('posts')
          .insert(postWithUserId)
          .select()

        if (error2) {
          console.log('❌ Post with user_id error:', error2)
        } else {
          console.log('✅ Post created successfully!', data2[0]?.id)
        }
      }
    } else {
      console.log('✅ Minimal post created successfully!', data[0]?.id)
    }

    // Now check what we have
    console.log('🔍 Checking current posts...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5)

    if (postsError) {
      console.log('❌ Posts query error:', postsError)
    } else {
      console.log('✅ Current posts:')
      posts?.forEach(post => {
        console.log('📄 Post structure:', {
          id: post.id,
          title: post.title?.substring(0, 30) + '...',
          hasUserId: !!post.user_id,
          hasCategory: !!post.category,
          columns: Object.keys(post)
        })
      })
    }

  } catch (error) {
    console.error('💥 Failed to check table structure:', error)
  }
}

checkTableStructure().then(() => {
  console.log('🏁 Table structure check completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Table structure check failed:', err)
  process.exit(1)
})