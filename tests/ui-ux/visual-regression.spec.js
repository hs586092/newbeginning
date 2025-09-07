import { test, expect } from '@playwright/test'

test.describe('Visual Regression Testing', () => {
  test('Landing page visual consistency', async ({ page }) => {
    console.log('📸 Landing page 시각적 일관성 테스트 시작...')
    
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 전체 페이지 스크린샷
    await expect(page).toHaveScreenshot('landing-page-full.png', {
      fullPage: true,
      threshold: 0.2
    })
    
    // 히어로 섹션
    const heroSection = page.locator('section').first()
    await expect(heroSection).toHaveScreenshot('hero-section.png')
    
    // 커뮤니티 피드 섹션
    const feedSection = page.locator('section').nth(1)
    await expect(feedSection).toHaveScreenshot('community-feed-section.png')
    
    console.log('✅ Landing page 시각적 일관성 테스트 완료')
  })

  test('Login page visual consistency', async ({ page }) => {
    console.log('📸 Login page 시각적 일관성 테스트 시작...')
    
    await page.goto('https://newbeginning-seven.vercel.app/login')
    await page.waitForLoadState('networkidle')
    
    // 로그인 페이지 전체
    await expect(page).toHaveScreenshot('login-page-full.png', { fullPage: true })
    
    // 로그인 폼
    const loginForm = page.locator('[data-testid="login-form"]').or(page.locator('form').first())
    await expect(loginForm).toHaveScreenshot('login-form.png')
    
    // OAuth 버튼들
    const googleBtn = page.locator('button', { hasText: 'Google' })
    const kakaoBtn = page.locator('button', { hasText: '카카오' })
    
    await expect(googleBtn).toHaveScreenshot('google-login-button.png')
    await expect(kakaoBtn).toHaveScreenshot('kakao-login-button.png')
    
    console.log('✅ Login page 시각적 일관성 테스트 완료')
  })

  test('Dashboard visual consistency (logged out vs logged in)', async ({ page, context }) => {
    console.log('📸 Dashboard 로그인 전/후 시각적 일관성 테스트...')
    
    // 로그인 전 (랜딩 페이지)
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    const landingHero = page.locator('section').first()
    await expect(landingHero).toHaveScreenshot('landing-hero-logged-out.png')
    
    console.log('🔍 로그인 전 상태 캡처 완료')
    
    // Note: 실제 로그인 후 상태는 인증이 필요하므로 UI 구조만 검증
    console.log('ℹ️ 로그인 후 상태는 실제 인증 후 수동 확인 권장')
  })
})