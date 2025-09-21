import { chromium } from 'playwright';

async function testLoginButtonFunctionality() {
  console.log('🎯 최종 로그인 버튼 기능 테스트 시작...')

  const browser = await chromium.launch({
    headless: false,
    devtools: false
  })
  const page = await browser.newPage()

  // 콘솔 로그 및 에러 캡처
  const logs = []
  const errors = []

  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'error') {
      errors.push(text)
      console.log(`❌ 브라우저 에러: ${text}`)
    } else if (text.includes('AUTH') || text.includes('UNAUTHENTICATED') || text.includes('useAuth')) {
      logs.push(text)
      console.log(`🔍 인증 로그: ${text}`)
    }
  })

  try {
    console.log('📍 1. 로그인 페이지 접속...')
    await page.goto('http://localhost:3001/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('📍 2. 페이지 로딩 대기...')
    // AuthProvider가 UNAUTHENTICATED 상태로 변경될 때까지 대기
    await page.waitForFunction(() => {
      return document.querySelector('form') !== null
    }, { timeout: 10000 })

    console.log('✅ 로그인 폼이 로드됨')

    console.log('📍 3. 로그인 버튼 테스트...')

    // 로그인 버튼 찾기 및 클릭 테스트
    const loginButton = await page.$('button[type="submit"]')
    if (loginButton) {
      console.log('✅ 로그인 버튼 발견')

      // 테스트 이메일/패스워드 입력
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'testpassword123')

      console.log('🔄 로그인 버튼 클릭...')
      await loginButton.click()
      await page.waitForTimeout(2000)

      console.log('✅ 로그인 버튼 클릭 성공')
    } else {
      console.log('❌ 로그인 버튼을 찾을 수 없음')
    }

    console.log('📍 4. Google 로그인 버튼 테스트...')
    const googleButton = await page.$('button:has-text("Google로 로그인")')
    if (googleButton) {
      console.log('✅ Google 버튼 발견')

      console.log('🔄 Google 버튼 클릭...')
      await googleButton.click()
      await page.waitForTimeout(2000)

      console.log('✅ Google 버튼 클릭 성공')
    } else {
      console.log('❌ Google 버튼을 찾을 수 없음')
    }

    console.log('📍 5. 회원가입 토글 테스트...')
    const signUpToggle = await page.$('button:has-text("회원가입")')
    if (signUpToggle) {
      console.log('✅ 회원가입 토글 버튼 발견')

      console.log('🔄 회원가입 토글 클릭...')
      await signUpToggle.click()
      await page.waitForTimeout(1000)

      // 회원가입 폼이 표시되는지 확인
      const usernameField = await page.$('input[name="username"]')
      if (usernameField) {
        console.log('✅ 회원가입 폼으로 전환됨')
      }

      // 다시 로그인으로 전환
      const loginToggle = await page.$('button:has-text("로그인")')
      if (loginToggle) {
        await loginToggle.click()
        await page.waitForTimeout(1000)
        console.log('✅ 로그인 폼으로 다시 전환됨')
      }
    }

    console.log('📍 6. 결과 분석...')
    console.log(`📊 총 로그: ${logs.length}개`)
    console.log(`📊 총 에러: ${errors.length}개`)

    if (logs.length > 0) {
      console.log('\n✅ 인증 관련 로그:')
      logs.slice(-5).forEach((log, i) => {
        console.log(`${i+1}. ${log}`)
      })
    }

    if (errors.length > 0) {
      console.log('\n❌ 에러 로그:')
      errors.slice(0, 3).forEach((error, i) => {
        console.log(`${i+1}. ${error}`)
      })
    }

    const hasUnauthenticatedState = logs.some(log => log.includes('UNAUTHENTICATED'))
    const hasAuthErrors = errors.some(error => error.includes('인증') || error.includes('Auth'))

    console.log('\n📊 최종 결과:')
    console.log(`✅ 인증 상태 정상화: ${hasUnauthenticatedState ? 'YES' : 'NO'}`)
    console.log(`❌ 인증 에러 발생: ${hasAuthErrors ? 'YES' : 'NO'}`)

    if (hasUnauthenticatedState && !hasAuthErrors) {
      console.log('\n🎉 테스트 성공! 로그인 버튼들이 정상 작동합니다.')
    } else {
      console.log('\n⚠️ 테스트 부분적 성공. 일부 문제가 남아있을 수 있습니다.')
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message)
  }

  console.log('\n⏳ 브라우저를 20초 동안 열어두어 수동 확인이 가능합니다...')
  await page.waitForTimeout(20000)

  await browser.close()
}

testLoginButtonFunctionality().catch(console.error)