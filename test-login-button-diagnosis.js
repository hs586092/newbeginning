import { chromium } from 'playwright';

async function diagnoseLoginButtonIssue() {
  console.log('🔬 로그인 버튼 진단 테스트 시작...')

  const browser = await chromium.launch({
    headless: false,
    devtools: true
  })
  const page = await browser.newPage()

  // 콘솔 로그 및 에러 캡처
  const logs = []
  const errors = []

  page.on('console', msg => {
    const text = msg.text()
    logs.push(text)
    if (msg.type() === 'error') {
      errors.push(text)
      console.log(`❌ 브라우저 에러: ${text}`)
    } else if (text.includes('AuthProvider') || text.includes('useAuth') || text.includes('INITIALIZING')) {
      console.log(`🔍 인증 관련 로그: ${text}`)
    }
  })

  // 네트워크 요청 모니터링
  const networkRequests = []
  page.on('request', request => {
    if (request.url().includes('login') || request.url().includes('auth') || request.url().includes('supabase')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      })
      console.log(`🌐 네트워크 요청: ${request.method()} ${request.url()}`)
    }
  })

  try {
    console.log('📍 1. 로그인 페이지 접속...')
    await page.goto('http://localhost:3001/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('📍 2. 페이지 요소 분석...')

    // useAuth 훅 상태 확인을 위한 스크립트 실행
    const authStateCheck = await page.evaluate(() => {
      // React DevTools처럼 컴포넌트 상태에 접근하려 시도
      const authElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"], [id*="auth"]')
      return {
        authElementsFound: authElements.length,
        hasAuthProvider: !!window.React,
        pageTitle: document.title,
        bodyClasses: document.body.className,
        formExists: !!document.querySelector('form'),
        loginButtonExists: !!document.querySelector('button[type="submit"]'),
        googleButtonExists: !!document.querySelector('button:contains("Google")'),
        kakaoButtonExists: !!document.querySelector('button:contains("카카오")')
      }
    })

    console.log('✅ 페이지 상태 분석:', authStateCheck)

    // 로그인 버튼 찾기 및 상태 확인
    const loginButton = await page.$('button[type="submit"]')
    if (loginButton) {
      console.log('✅ 로그인 버튼 발견')

      // 버튼 속성 확인
      const buttonInfo = await loginButton.evaluate(btn => ({
        disabled: btn.disabled,
        className: btn.className,
        textContent: btn.textContent.trim(),
        type: btn.type,
        form: btn.form ? btn.form.id : null
      }))
      console.log('🔍 로그인 버튼 상태:', buttonInfo)

      console.log('📍 3. 로그인 버튼 클릭 테스트...')

      // 클릭 전 폼 데이터 입력
      const emailInput = await page.$('input[name="email"]')
      const passwordInput = await page.$('input[name="password"]')

      if (emailInput && passwordInput) {
        await emailInput.fill('test@example.com')
        await passwordInput.fill('testpassword123')
        console.log('✅ 테스트 데이터 입력 완료')
      }

      // 실제 클릭 시도
      console.log('🔄 로그인 버튼 클릭 중...')
      await loginButton.click()
      await page.waitForTimeout(3000)

      console.log('✅ 클릭 완료, 반응 대기 중...')

    } else {
      console.log('❌ 로그인 버튼을 찾을 수 없음')
    }

    // Google 로그인 버튼 테스트
    const googleButton = await page.$('button:has-text("Google로 로그인")')
    if (googleButton) {
      console.log('📍 4. Google 로그인 버튼 테스트...')

      const googleButtonInfo = await googleButton.evaluate(btn => ({
        disabled: btn.disabled,
        className: btn.className,
        textContent: btn.textContent.trim()
      }))
      console.log('🔍 Google 버튼 상태:', googleButtonInfo)

      console.log('🔄 Google 버튼 클릭 중...')
      await googleButton.click()
      await page.waitForTimeout(2000)
    }

    console.log('📍 5. 결과 분석...')
    console.log(`📊 총 로그: ${logs.length}개`)
    console.log(`📊 총 에러: ${errors.length}개`)
    console.log(`📊 네트워크 요청: ${networkRequests.length}개`)

    if (logs.length > 0) {
      console.log('\n✅ 주요 로그 메시지:')
      logs.slice(-10).forEach((log, i) => {
        console.log(`${i+1}. ${log}`)
      })
    }

    if (errors.length > 0) {
      console.log('\n❌ 주요 에러 메시지:')
      errors.slice(0, 5).forEach((error, i) => {
        console.log(`${i+1}. ${error}`)
      })
    }

    if (networkRequests.length > 0) {
      console.log('\n🌐 네트워크 요청들:')
      networkRequests.forEach((req, i) => {
        console.log(`${i+1}. ${req.method} ${req.url}`)
      })
    }

    // 인증 상태 관련 로그 분석
    const authLogs = logs.filter(log =>
      log.includes('INITIALIZING') ||
      log.includes('AuthProvider') ||
      log.includes('useAuth') ||
      log.includes('authenticated')
    )

    console.log('\n🔍 인증 상태 관련 분석:')
    console.log(`- INITIALIZING 상태 로그: ${authLogs.filter(l => l.includes('INITIALIZING')).length}개`)
    console.log(`- AuthProvider 로그: ${authLogs.filter(l => l.includes('AuthProvider')).length}개`)
    console.log(`- useAuth 관련 로그: ${authLogs.filter(l => l.includes('useAuth')).length}개`)

    const hasInitializingIssue = authLogs.some(log => log.includes('INITIALIZING'))
    const hasAuthProviderMount = authLogs.some(log => log.includes('AuthProvider: Component render started'))
    const hasButtonResponse = logs.some(log => log.includes('button') || log.includes('click') || log.includes('form'))

    console.log('\n📊 진단 결과:')
    console.log(`✅ AuthProvider 마운트: ${hasAuthProviderMount ? 'YES' : 'NO'}`)
    console.log(`❌ INITIALIZING 상태 고착: ${hasInitializingIssue ? 'YES' : 'NO'}`)
    console.log(`🔍 버튼 반응: ${hasButtonResponse ? 'YES' : 'NO'}`)

    if (hasInitializingIssue && !hasButtonResponse) {
      console.log('\n🎯 **핵심 진단**: AuthProvider가 INITIALIZING 상태에서 벗어나지 못해 useAuth 훅이 비활성 상태입니다.')
      console.log('   이로 인해 로그인 버튼들이 실제로는 작동하지 않는 상태입니다.')
    }

  } catch (error) {
    console.error('❌ 진단 테스트 오류:', error.message)
  }

  console.log('\n⏳ 브라우저를 30초 동안 열어두어 수동 확인이 가능합니다...')
  await page.waitForTimeout(30000)

  await browser.close()
}

diagnoseLoginButtonIssue().catch(console.error)