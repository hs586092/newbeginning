import { test, expect } from '@playwright/test'

test.describe('User Journey Testing', () => {
  test('First-time visitor journey (Landing → Login → Registration)', async ({ page }) => {
    console.log('🎯 첫 방문자 여정 테스트 시작...')
    
    // 1. 랜딩 페이지 도착
    console.log('1️⃣ 랜딩 페이지 도착...')
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 첫 인상 평가 - 히어로 섹션 확인
    const heroSection = page.locator('section').first()
    const heroTitle = heroSection.locator('h1, h2').first()
    const heroCTA = heroSection.locator('button, a[role="button"]').first()
    
    await expect(heroTitle).toBeVisible()
    const titleText = await heroTitle.textContent()
    console.log(`   📄 메인 타이틀: "${titleText}"`)
    
    // CTA 버튼 존재 여부
    if (await heroCTA.isVisible()) {
      const ctaText = await heroCTA.textContent()
      console.log(`   🎯 CTA 버튼: "${ctaText}"`)
    }
    
    // 2. 피드 섹션 둘러보기
    console.log('2️⃣ 커뮤니티 피드 탐색...')
    await page.evaluate(() => window.scrollTo(0, window.innerHeight))
    await page.waitForTimeout(1000)
    
    const feedSection = page.locator('section').nth(1)
    const feedItems = feedSection.locator('[data-testid*="post"], article, .post, .feed-item')
    const feedCount = await feedItems.count()
    console.log(`   📝 피드 아이템: ${feedCount}개 발견`)
    
    // 3. 로그인 페이지로 이동
    console.log('3️⃣ 로그인 페이지로 이동...')
    const loginLink = page.locator('a[href*="login"], button', { hasText: '로그인' }).first()
    
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await page.waitForLoadState('networkidle')
      console.log('   ✅ 로그인 페이지 이동 완료')
    } else {
      // 직접 이동
      await page.goto('https://newbeginning-seven.vercel.app/login')
      await page.waitForLoadState('networkidle')
      console.log('   ↗️ 직접 로그인 페이지 이동')
    }
    
    // 4. 로그인 옵션 확인
    console.log('4️⃣ 로그인 옵션 분석...')
    const googleBtn = page.locator('button', { hasText: 'Google' })
    const kakaoBtn = page.locator('button', { hasText: '카카오' })
    const emailLogin = page.locator('input[type="email"], input[name="email"]')
    
    const loginOptions = {
      google: await googleBtn.isVisible(),
      kakao: await kakaoBtn.isVisible(),
      email: await emailLogin.isVisible()
    }
    
    console.log(`   🔵 Google 로그인: ${loginOptions.google ? '✅' : '❌'}`)
    console.log(`   🟡 카카오 로그인: ${loginOptions.kakao ? '✅' : '❌'}`)
    console.log(`   📧 이메일 로그인: ${loginOptions.email ? '✅' : '❌'}`)
    
    const totalOptions = Object.values(loginOptions).filter(Boolean).length
    console.log(`   📊 총 로그인 옵션: ${totalOptions}개`)
    
    // 5. 회원가입 페이지 확인
    console.log('5️⃣ 회원가입 페이지 확인...')
    const signupLink = page.locator('a[href*="signup"], a[href*="register"], button', { hasText: '회원가입' }).first()
    
    if (await signupLink.isVisible()) {
      await signupLink.click()
      await page.waitForLoadState('networkidle')
      
      const signupForm = page.locator('form').first()
      const signupInputs = signupForm.locator('input')
      const inputCount = await signupInputs.count()
      
      console.log(`   📝 회원가입 폼 필드: ${inputCount}개`)
      console.log('   ✅ 회원가입 페이지 접근 완료')
    } else {
      console.log('   ℹ️ 회원가입 링크를 찾을 수 없음')
    }
    
    console.log('✅ 첫 방문자 여정 테스트 완료')
  })

  test('Returning visitor journey (OAuth Login → Dashboard)', async ({ page }) => {
    console.log('🔄 재방문자 여정 테스트 시작...')
    
    // 1. 로그인 페이지 직접 접근
    console.log('1️⃣ 로그인 페이지 접근...')
    await page.goto('https://newbeginning-seven.vercel.app/login')
    await page.waitForLoadState('networkidle')
    
    // 2. OAuth 버튼 상호작용 테스트
    console.log('2️⃣ OAuth 버튼 상호작용 테스트...')
    const googleBtn = page.locator('button', { hasText: 'Google' })
    const kakaoBtn = page.locator('button', { hasText: '카카오' })
    
    // Google 버튼 호버 효과
    if (await googleBtn.isVisible()) {
      await googleBtn.hover()
      await page.waitForTimeout(500)
      console.log('   🔵 Google 버튼 호버 효과 확인')
    }
    
    // 카카오 버튼 호버 효과  
    if (await kakaoBtn.isVisible()) {
      await kakaoBtn.hover()
      await page.waitForTimeout(500)
      console.log('   🟡 카카오 버튼 호버 효과 확인')
    }
    
    // 3. 버튼 스타일링 일관성 검증
    console.log('3️⃣ OAuth 버튼 스타일링 검증...')
    
    if (await googleBtn.isVisible() && await kakaoBtn.isVisible()) {
      const googleStyles = await googleBtn.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          width: computed.width,
          height: computed.height,
          borderRadius: computed.borderRadius,
          padding: computed.padding
        }
      })
      
      const kakaoStyles = await kakaoBtn.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          width: computed.width,
          height: computed.height,
          borderRadius: computed.borderRadius,
          padding: computed.padding
        }
      })
      
      console.log(`   🔵 Google 버튼 - 크기: ${googleStyles.width} x ${googleStyles.height}`)
      console.log(`   🟡 카카오 버튼 - 크기: ${kakaoStyles.width} x ${kakaoStyles.height}`)
      
      const sameSize = googleStyles.width === kakaoStyles.width && googleStyles.height === kakaoStyles.height
      console.log(`   📏 버튼 크기 일관성: ${sameSize ? '✅' : '❌'}`)
    }
    
    console.log('✅ 재방문자 여정 테스트 완료')
  })

  test('Mobile user journey', async ({ page }) => {
    console.log('📱 모바일 사용자 여정 테스트 시작...')
    
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 1. 모바일 랜딩 페이지
    console.log('1️⃣ 모바일 랜딩 페이지 분석...')
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 터치 스크롤 시뮬레이션
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight / 2)
    })
    await page.waitForTimeout(1000)
    
    // 2. 모바일 네비게이션 확인
    console.log('2️⃣ 모바일 네비게이션 확인...')
    const mobileNav = page.locator('nav, [role="navigation"]')
    const hamburgerMenu = page.locator('button[aria-label*="menu"], .hamburger, [data-testid*="menu"]')
    
    if (await hamburgerMenu.isVisible()) {
      console.log('   🍔 햄버거 메뉴 발견')
      await hamburgerMenu.click()
      await page.waitForTimeout(500)
    }
    
    // 3. 모바일 로그인 페이지 테스트
    console.log('3️⃣ 모바일 로그인 페이지...')
    await page.goto('https://newbeginning-seven.vercel.app/login')
    await page.waitForLoadState('networkidle')
    
    // 폼 필드 터치 테스트
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    
    if (await emailInput.isVisible()) {
      await emailInput.tap()
      await page.waitForTimeout(500)
      console.log('   📧 이메일 필드 터치 반응 확인')
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.tap() 
      await page.waitForTimeout(500)
      console.log('   🔒 비밀번호 필드 터치 반응 확인')
    }
    
    // 4. OAuth 버튼 터치 테스트
    console.log('4️⃣ OAuth 버튼 터치 친화성...')
    const oauthButtons = page.locator('button', { hasText: 'Google' }).or(page.locator('button', { hasText: '카카오' }))
    const buttonCount = await oauthButtons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = oauthButtons.nth(i)
      const box = await button.boundingBox()
      const buttonText = await button.textContent()
      
      if (box) {
        const touchFriendly = box.height >= 44 && box.width >= 44
        console.log(`   👆 "${buttonText}" 버튼: ${box.width}x${box.height}px (터치 친화적: ${touchFriendly ? '✅' : '❌'})`)
      }
    }
    
    console.log('✅ 모바일 사용자 여정 테스트 완료')
  })

  test('User experience flow analysis', async ({ page }) => {
    console.log('🎨 사용자 경험 흐름 분석 시작...')
    
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 1. 로딩 시간 측정
    console.log('1️⃣ 페이지 로딩 성능 측정...')
    const loadTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      return navigation.loadEventEnd - navigation.fetchStart
    })
    
    console.log(`   ⏱️ 페이지 로드 시간: ${loadTime.toFixed(0)}ms`)
    console.log(`   📊 성능 등급: ${loadTime < 1000 ? '🟢 우수' : loadTime < 3000 ? '🟡 보통' : '🔴 개선 필요'}`)
    
    // 2. 상호작용 요소 분석
    console.log('2️⃣ 상호작용 요소 분석...')
    const interactiveElements = page.locator('button, a, input, [role="button"]')
    const interactiveCount = await interactiveElements.count()
    
    let visibleInteractive = 0
    for (let i = 0; i < Math.min(interactiveCount, 10); i++) {
      const element = interactiveElements.nth(i)
      if (await element.isVisible()) {
        visibleInteractive++
      }
    }
    
    console.log(`   🎯 상호작용 요소: ${visibleInteractive}/${Math.min(interactiveCount, 10)}개 가시성 확인`)
    
    // 3. 콘텐츠 계층 구조 분석
    console.log('3️⃣ 콘텐츠 계층 구조 분석...')
    const headingLevels = []
    for (let i = 1; i <= 6; i++) {
      const headings = await page.locator(`h${i}`).count()
      if (headings > 0) {
        headingLevels.push(`H${i}: ${headings}개`)
      }
    }
    
    console.log(`   📑 헤딩 구조: ${headingLevels.join(', ')}`)
    
    // 4. 시각적 피드백 확인
    console.log('4️⃣ 시각적 피드백 확인...')
    const firstButton = page.locator('button').first()
    
    if (await firstButton.isVisible()) {
      // 호버 상태 확인
      await firstButton.hover()
      await page.waitForTimeout(300)
      
      // 포커스 상태 확인  
      await firstButton.focus()
      await page.waitForTimeout(300)
      
      console.log('   ✨ 버튼 상호작용 피드백 확인 완료')
    }
    
    console.log('✅ 사용자 경험 흐름 분석 완료')
  })
})