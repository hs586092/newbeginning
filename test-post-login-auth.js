import { chromium } from 'playwright';

async function testPostLoginAuthState() {
  console.log('🔍 로그인 후 인증 상태 테스트 시작...')

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
    } else if (text.includes('AUTH') || text.includes('AUTHENTICATED') || text.includes('useAuth') || text.includes('user:') || text.includes('isAuthenticated')) {
      logs.push(text)
      console.log(`🔍 인증 로그: ${text}`)
    }
  })

  try {
    console.log('📍 1. 홈페이지 접속...')
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('📍 2. 로그인 전 상태 확인...')

    // 로그인 전 상태 체크
    const preLoginState = await page.evaluate(() => {
      // React DevTools 방식으로 인증 상태 확인
      const loginLinks = document.querySelectorAll('a[href*="login"]')
      const logoutButtons = document.querySelectorAll('button:contains("로그아웃")')
      const userMenus = document.querySelectorAll('[class*="user-menu"], [class*="profile"]')

      return {
        hasLoginLinks: loginLinks.length > 0,
        hasLogoutButtons: logoutButtons.length > 0,
        hasUserMenus: userMenus.length > 0,
        url: window.location.href
      }
    })

    console.log('📊 로그인 전 상태:', preLoginState)

    console.log('📍 3. 로그인 페이지로 이동...')
    await page.goto('http://localhost:3001/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('📍 4. 실제 계정으로 로그인 시도...')

    // 실제 계정 정보 입력 (테스트 계정)
    await page.fill('input[name="email"]', 'test@newbeginning.com')
    await page.fill('input[name="password"]', 'testpassword123')

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)

    console.log('📍 5. 로그인 후 리디렉션 확인...')

    // 현재 URL 확인
    const currentUrl = page.url()
    console.log('현재 URL:', currentUrl)

    // 인증 상태 변화 대기
    await page.waitForTimeout(5000)

    console.log('📍 6. 로그인 후 홈페이지 이동...')
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('📍 7. 로그인 후 상태 확인...')

    const postLoginState = await page.evaluate(() => {
      const loginLinks = document.querySelectorAll('a[href*="login"]')
      const logoutButtons = document.querySelectorAll('button')
      const userMenus = document.querySelectorAll('[class*="user"], [class*="profile"], [class*="avatar"]')

      // 좋아요 버튼 상태 확인
      const likeButtons = document.querySelectorAll('[title*="좋아요"]')
      const commentButtons = document.querySelectorAll('[title*="댓글"]')

      return {
        hasLoginLinks: loginLinks.length > 0,
        logoutButtonsCount: logoutButtons.length,
        userMenusCount: userMenus.length,
        likeButtonsCount: likeButtons.length,
        commentButtonsCount: commentButtons.length,
        url: window.location.href
      }
    })

    console.log('📊 로그인 후 상태:', postLoginState)

    console.log('📍 8. 좋아요 버튼 테스트...')

    const likeButtons = await page.$$('[title*="좋아요"]')
    if (likeButtons.length > 0) {
      console.log(`✅ 좋아요 버튼 ${likeButtons.length}개 발견`)

      // 첫 번째 좋아요 버튼 클릭
      await likeButtons[0].click()
      await page.waitForTimeout(2000)

      console.log('✅ 좋아요 버튼 클릭 완료')
    } else {
      console.log('❌ 좋아요 버튼을 찾을 수 없음')
    }

    console.log('📍 9. 결과 분석...')
    console.log(`📊 총 인증 로그: ${logs.length}개`)
    console.log(`📊 총 에러: ${errors.length}개`)

    if (logs.length > 0) {
      console.log('\n✅ 최근 인증 로그:')
      logs.slice(-10).forEach((log, i) => {
        console.log(`${i+1}. ${log}`)
      })
    }

    if (errors.length > 0) {
      console.log('\n❌ 최근 에러:')
      errors.slice(-5).forEach((error, i) => {
        console.log(`${i+1}. ${error}`)
      })
    }

    // 인증 상태 분석
    const hasAuthenticatedLogs = logs.some(log => log.includes('AUTHENTICATED') && !log.includes('UNAUTHENTICATED'))
    const hasUserLogs = logs.some(log => log.includes('user:') && !log.includes('null'))
    const hasLoginSuccess = logs.some(log => log.includes('SIGN_IN_SUCCESS'))

    console.log('\n📊 인증 상태 분석:')
    console.log(`✅ AUTHENTICATED 상태: ${hasAuthenticatedLogs ? 'YES' : 'NO'}`)
    console.log(`✅ 사용자 정보 로드: ${hasUserLogs ? 'YES' : 'NO'}`)
    console.log(`✅ 로그인 성공 이벤트: ${hasLoginSuccess ? 'YES' : 'NO'}`)
    console.log(`📊 UI 변화: 로그인 링크 ${preLoginState.hasLoginLinks ? '있음' : '없음'} → ${postLoginState.hasLoginLinks ? '있음' : '없음'}`)

    if (hasAuthenticatedLogs && hasUserLogs && !postLoginState.hasLoginLinks) {
      console.log('\n🎉 로그인 상태가 정상적으로 반영됨!')
    } else {
      console.log('\n⚠️ 로그인 상태 반영에 문제가 있음')
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message)
  }

  console.log('\n⏳ 브라우저를 30초 동안 열어두어 수동 확인이 가능합니다...')
  await page.waitForTimeout(30000)

  await browser.close()
}

testPostLoginAuthState().catch(console.error)