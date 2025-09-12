// OAuth 로그인 테스트 스크립트
import { SupabaseAuthClient } from './src/lib/auth/supabase-client.ts'

async function testOAuth() {
  console.log('🧪 OAuth 로그인 테스트 시작...')
  
  const authClient = new SupabaseAuthClient(true) // 디버그 모드 활성화
  
  try {
    // Google OAuth 테스트
    console.log('\n📧 Google OAuth 테스트...')
    const googleResult = await authClient.signInWithGoogle()
    console.log('Google OAuth 결과:', googleResult)
    
    // Kakao OAuth 테스트  
    console.log('\n💬 Kakao OAuth 테스트...')
    const kakaoResult = await authClient.signInWithKakao()
    console.log('Kakao OAuth 결과:', kakaoResult)
    
  } catch (error) {
    console.error('❌ OAuth 테스트 중 오류:', error)
  }
}

testOAuth()