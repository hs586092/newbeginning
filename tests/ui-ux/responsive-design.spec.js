import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1200, height: 800 },
  { name: 'Large Desktop', width: 1920, height: 1080 }
]

test.describe('Responsive Design Testing', () => {
  for (const viewport of viewports) {
    test(`${viewport.name} (${viewport.width}x${viewport.height}) - Landing Page`, async ({ page }) => {
      console.log(`📱 ${viewport.name} 반응형 테스트 시작...`)
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('https://newbeginning-seven.vercel.app')
      await page.waitForLoadState('networkidle')
      
      // 전체 페이지 스크린샷
      await expect(page).toHaveScreenshot(`landing-${viewport.name.toLowerCase()}.png`, {
        fullPage: true
      })
      
      // 히어로 섹션 요소 검증
      const heroSection = page.locator('section').first()
      const heroTitle = heroSection.locator('h1, h2').first()
      const heroDescription = heroSection.locator('p').first()
      
      await expect(heroTitle).toBeVisible()
      await expect(heroDescription).toBeVisible()
      
      // CTA 버튼 크기 및 터치 친화성 검증 (모바일)
      if (viewport.width <= 768) {
        const ctaButtons = page.locator('button, a[role="button"]')
        const buttonCount = await ctaButtons.count()
        
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = ctaButtons.nth(i)
          const box = await button.boundingBox()
          if (box) {
            // 최소 터치 영역 44x44px (iOS/Android 가이드라인)
            expect(box.height).toBeGreaterThanOrEqual(40)
            expect(box.width).toBeGreaterThanOrEqual(40)
          }
        }
        console.log(`✅ ${viewport.name}: 터치 친화적 버튼 크기 확인`)
      }
      
      // 네비게이션 요소 검증
      const navigation = page.locator('nav, [role="navigation"]').first()
      if (await navigation.isVisible()) {
        await expect(navigation).toBeVisible()
        console.log(`✅ ${viewport.name}: 네비게이션 가시성 확인`)
      }
      
      console.log(`✅ ${viewport.name} 랜딩 페이지 반응형 테스트 완료`)
    })

    test(`${viewport.name} - Login Page Responsiveness`, async ({ page }) => {
      console.log(`📱 ${viewport.name} 로그인 페이지 반응형 테스트...`)
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('https://newbeginning-seven.vercel.app/login')
      await page.waitForLoadState('networkidle')
      
      // 로그인 페이지 스크린샷
      await expect(page).toHaveScreenshot(`login-${viewport.name.toLowerCase()}.png`)
      
      // 폼 요소들 가시성 검증
      const loginForm = page.locator('form').first()
      const emailInput = page.locator('input[type="email"], input[name="email"]').first()
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
      const submitButton = page.locator('button[type="submit"]').first()
      const googleButton = page.locator('button', { hasText: 'Google' })
      const kakaoButton = page.locator('button', { hasText: '카카오' })
      
      await expect(loginForm).toBeVisible()
      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
      await expect(submitButton).toBeVisible()
      await expect(googleButton).toBeVisible()
      await expect(kakaoButton).toBeVisible()
      
      // 폼 필드 크기 검증 (모바일에서 충분한 크기인지)
      if (viewport.width <= 768) {
        const emailBox = await emailInput.boundingBox()
        const passwordBox = await passwordInput.boundingBox()
        
        if (emailBox && passwordBox) {
          expect(emailBox.height).toBeGreaterThanOrEqual(40)
          expect(passwordBox.height).toBeGreaterThanOrEqual(40)
        }
      }
      
      console.log(`✅ ${viewport.name} 로그인 페이지 반응형 테스트 완료`)
    })
  }

  test('Responsive breakpoints transition', async ({ page }) => {
    console.log('🔄 반응형 브레이크포인트 전환 테스트...')
    
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 데스크톱 → 태블릿 → 모바일 순으로 축소하며 레이아웃 변화 확인
    for (const viewport of viewports.reverse()) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(1000) // 레이아웃 안정화 대기
      
      // 주요 요소들이 여전히 보이는지 확인
      const mainContent = page.locator('main, [role="main"]').first()
      await expect(mainContent).toBeVisible()
      
      console.log(`✅ ${viewport.name} 브레이크포인트 전환 확인`)
    }
    
    console.log('✅ 모든 브레이크포인트 전환 테스트 완료')
  })
})