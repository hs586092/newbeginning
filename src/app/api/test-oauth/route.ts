import { NextRequest, NextResponse } from 'next/server'
import { SupabaseAuthClient } from '@/lib/auth/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()
    
    console.log(`🧪 Testing ${provider} OAuth...`)
    
    const authClient = new SupabaseAuthClient(true) // 디버그 모드
    
    let result
    if (provider === 'google') {
      result = await authClient.signInWithGoogle()
    } else if (provider === 'kakao') {
      result = await authClient.signInWithKakao()
    } else {
      return NextResponse.json({ success: false, error: 'Invalid provider' }, { status: 400 })
    }
    
    console.log(`${provider} OAuth 결과:`, result)
    
    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('OAuth 테스트 에러:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}