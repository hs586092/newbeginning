import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  console.log('=== Test Post API Called ===')
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const supabase = await createServerSupabaseClient()
    const { user } = await getUser()
    
    console.log('User:', user ? { id: user.id, email: user.email } : 'null')
    
    // 인증이 없어도 테스트를 위해 진행
    const authorName = user?.email || 'test-user'
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    
    const postData = {
      title: body.title,
      content: body.content,
      category: body.category || 'community',
      user_id: userId,
      author_name: authorName
    }
    
    console.log('Inserting post data:', postData)
    
    const { data, error } = await supabase
      .from('posts')
      .insert(postData as any)
      .select()
      .single()
    
    console.log('Supabase result:', { data, error })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}`, details: error },
        { status: 500 }
      )
    }
    
    console.log('Success! Post created:', data)
    return NextResponse.json({ success: true, id: (data as any).id, data })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: `API error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}