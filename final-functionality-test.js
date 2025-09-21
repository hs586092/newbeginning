import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleteFunctionality() {
  console.log('🧪 Testing complete NewBeginning functionality...')

  try {
    // 1. Get posts
    console.log('\n📋 Step 1: Getting posts...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, author_name, created_at')
      .limit(2)

    if (postsError) {
      throw new Error(`Posts query failed: ${postsError.message}`)
    }

    console.log(`✅ Found ${posts.length} posts:`)
    posts.forEach(post => {
      console.log(`   📄 ${post.title} (${post.id})`)
    })

    if (posts.length === 0) {
      throw new Error('No posts found to test with')
    }

    const testPost = posts[0]

    // 2. Test get_post_like_count function
    console.log('\n💖 Step 2: Testing like count function...')
    const { data: initialLikes, error: likesError } = await supabase
      .rpc('get_post_like_count', { p_post_id: testPost.id })

    if (likesError) {
      throw new Error(`Like count failed: ${likesError.message}`)
    }

    console.log(`✅ Initial like count: ${initialLikes}`)

    // 3. Test toggle_post_like function
    console.log('\n🔄 Step 3: Testing like toggle...')
    const testUserId = '686579e0-d0b5-42b5-9104-a569914feb2a' // Our test user

    const { data: toggleResult, error: toggleError } = await supabase
      .rpc('toggle_post_like', {
        p_post_id: testPost.id,
        p_user_id: testUserId
      })

    if (toggleError) {
      throw new Error(`Like toggle failed: ${toggleError.message}`)
    }

    console.log(`✅ Like toggle result:`, toggleResult)
    console.log(`   Liked: ${toggleResult.liked}`)
    console.log(`   New count: ${toggleResult.like_count}`)

    // 4. Test get_post_comments function
    console.log('\n💬 Step 4: Testing comments function...')
    const { data: comments, error: commentsError } = await supabase
      .rpc('get_post_comments', { p_post_id: testPost.id })

    if (commentsError) {
      throw new Error(`Comments failed: ${commentsError.message}`)
    }

    console.log(`✅ Comments count: ${comments.length}`)

    // 5. Test direct table access
    console.log('\n📊 Step 5: Testing table access...')

    const { data: likes, error: likesTableError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', testPost.id)

    if (likesTableError) {
      throw new Error(`Likes table access failed: ${likesTableError.message}`)
    }

    console.log(`✅ Direct likes table access: ${likes.length} likes found`)

    const { data: commentsTable, error: commentsTableError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', testPost.id)

    if (commentsTableError) {
      throw new Error(`Comments table access failed: ${commentsTableError.message}`)
    }

    console.log(`✅ Direct comments table access: ${commentsTable.length} comments found`)

    // 6. Final verification
    console.log('\n🔍 Step 6: Final verification...')
    const { data: finalLikeCount } = await supabase
      .rpc('get_post_like_count', { p_post_id: testPost.id })

    console.log(`✅ Final like count: ${finalLikeCount}`)

    console.log('\n🎉 ALL TESTS PASSED! 🎉')
    console.log('✅ Posts: Available')
    console.log('✅ Like count function: Working')
    console.log('✅ Like toggle function: Working')
    console.log('✅ Comments function: Working')
    console.log('✅ Table access: Working')
    console.log('\n🚀 The application should now work correctly!')

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error('💥 Full error:', error)
    process.exit(1)
  }
}

testCompleteFunctionality().then(() => {
  console.log('\n🏁 Complete functionality test completed')
  process.exit(0)
}).catch(err => {
  console.error('💥 Complete functionality test failed:', err)
  process.exit(1)
})