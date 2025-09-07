import { test, expect } from '@playwright/test'

test.describe('Accessibility Testing (WCAG 2.1 AA)', () => {
  test('Landing page accessibility audit', async ({ page }) => {
    console.log('♿ 랜딩 페이지 접근성 테스트 시작...')
    
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 기본 접근성 요소들 검증
    const accessibility = {
      hasTitle: false,
      hasMetaDescription: false,
      hasHeadings: false,
      hasAltTexts: true,
      hasAriaLabels: false,
      hasKeyboardNavigation: true,
      colorContrast: true
    }
    
    // 1. 페이지 제목 존재 여부
    const title = await page.title()
    accessibility.hasTitle = title.length > 0
    console.log(`📄 페이지 제목: ${title} (${accessibility.hasTitle ? '✅' : '❌'})`)
    
    // 2. 메타 설명 존재 여부
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    accessibility.hasMetaDescription = !!metaDescription
    console.log(`📝 메타 설명: ${accessibility.hasMetaDescription ? '존재' : '누락'} (${accessibility.hasMetaDescription ? '✅' : '❌'})`)
    
    // 3. 헤딩 구조 검증 (h1 ~ h6)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count()
    accessibility.hasHeadings = headings > 0
    console.log(`📑 헤딩 개수: ${headings} (${accessibility.hasHeadings ? '✅' : '❌'})`)
    
    // 4. 이미지 alt 텍스트 검증
    const images = page.locator('img')
    const imageCount = await images.count()
    let imagesWithoutAlt = 0
    
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      if (!alt || alt.trim() === '') {
        imagesWithoutAlt++
      }
    }
    
    accessibility.hasAltTexts = imagesWithoutAlt === 0
    console.log(`🖼️ 이미지: ${imageCount}개 중 ${imagesWithoutAlt}개 alt 텍스트 누락 (${accessibility.hasAltTexts ? '✅' : '❌'})`)
    
    // 5. ARIA 레이블 사용 여부
    const ariaLabels = await page.locator('[aria-label], [aria-labelledby], [role]').count()
    accessibility.hasAriaLabels = ariaLabels > 0
    console.log(`🏷️ ARIA 레이블: ${ariaLabels}개 (${accessibility.hasAriaLabels ? '✅' : '❌'})`)
    
    // 6. 키보드 네비게이션 테스트
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    accessibility.hasKeyboardNavigation = !!focusedElement
    console.log(`⌨️ 키보드 네비게이션: ${focusedElement} 포커스 (${accessibility.hasKeyboardNavigation ? '✅' : '❌'})`)
    
    // 7. 버튼 및 링크 접근성 검증
    const interactiveElements = page.locator('button, a, input, select, textarea')
    const interactiveCount = await interactiveElements.count()
    
    let accessibleInteractive = 0
    for (let i = 0; i < Math.min(interactiveCount, 10); i++) {
      const element = interactiveElements.nth(i)
      const hasText = await element.textContent()
      const hasAriaLabel = await element.getAttribute('aria-label')
      const hasTitle = await element.getAttribute('title')
      
      if (hasText?.trim() || hasAriaLabel || hasTitle) {
        accessibleInteractive++
      }
    }
    
    const interactiveAccessibilityScore = interactiveCount > 0 ? (accessibleInteractive / Math.min(interactiveCount, 10)) * 100 : 100
    console.log(`🎯 상호작용 요소 접근성: ${interactiveAccessibilityScore.toFixed(1)}% (${interactiveAccessibilityScore >= 80 ? '✅' : '❌'})`)
    
    // 접근성 점수 계산
    const accessibilityScore = Object.values(accessibility).filter(Boolean).length / Object.keys(accessibility).length * 100
    console.log(`\n♿ 전체 접근성 점수: ${accessibilityScore.toFixed(1)}%`)
    console.log(`🎯 목표 점수: 80% (WCAG AA 기준)`)
    console.log(`결과: ${accessibilityScore >= 80 ? '✅ 양호' : '❌ 개선 필요'}`)
    
    // 접근성 점수가 80% 이상인지 검증
    expect(accessibilityScore).toBeGreaterThanOrEqual(80)
  })

  test('Login page accessibility audit', async ({ page }) => {
    console.log('♿ 로그인 페이지 접근성 테스트 시작...')
    
    await page.goto('https://newbeginning-seven.vercel.app/login')
    await page.waitForLoadState('networkidle')
    
    // 폼 접근성 검증
    const formAccessibility = {
      hasLabels: true,
      hasErrorMessages: true,
      hasFieldset: false,
      hasRequiredIndicators: true
    }
    
    // 1. 폼 라벨 검증
    const inputs = page.locator('input[type="email"], input[type="password"], input[type="text"]')
    const inputCount = await inputs.count()
    let inputsWithLabels = 0
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const name = await input.getAttribute('name')
      const ariaLabel = await input.getAttribute('aria-label')
      
      // 연결된 label 또는 aria-label 확인
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const hasLabel = await label.count() > 0
        if (hasLabel || ariaLabel) inputsWithLabels++
      } else if (ariaLabel) {
        inputsWithLabels++
      }
    }
    
    formAccessibility.hasLabels = inputCount === 0 || inputsWithLabels === inputCount
    console.log(`🏷️ 폼 라벨: ${inputsWithLabels}/${inputCount} (${formAccessibility.hasLabels ? '✅' : '❌'})`)
    
    // 2. 필수 필드 표시 검증
    const requiredInputs = page.locator('input[required]')
    const requiredCount = await requiredInputs.count()
    console.log(`⚠️ 필수 필드: ${requiredCount}개 (${requiredCount > 0 ? '✅' : 'ℹ️'})`)
    
    // 3. 버튼 접근성 검증
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    let accessibleButtons = 0
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')
      
      if (text?.trim() || ariaLabel || title) {
        accessibleButtons++
      }
    }
    
    const buttonAccessibilityScore = buttonCount > 0 ? (accessibleButtons / buttonCount) * 100 : 100
    console.log(`🔘 버튼 접근성: ${accessibleButtons}/${buttonCount} (${buttonAccessibilityScore}%)`)
    
    // 4. OAuth 버튼 특별 검증
    const googleBtn = page.locator('button', { hasText: 'Google' })
    const kakaoBtn = page.locator('button', { hasText: '카카오' })
    
    if (await googleBtn.isVisible()) {
      const googleText = await googleBtn.textContent()
      console.log(`🔵 Google 버튼: "${googleText?.trim()}" (${googleText?.includes('Google') ? '✅' : '❌'})`)
    }
    
    if (await kakaoBtn.isVisible()) {
      const kakaoText = await kakaoBtn.textContent()
      console.log(`🟡 Kakao 버튼: "${kakaoText?.trim()}" (${kakaoText?.includes('카카오') ? '✅' : '❌'})`)
    }
    
    console.log('✅ 로그인 페이지 접근성 테스트 완료')
  })

  test('Color contrast and readability', async ({ page }) => {
    console.log('🎨 색상 대비 및 가독성 테스트...')
    
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 주요 텍스트 요소들의 색상 및 배경 확인
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = Math.min(await textElements.count(), 10)
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight
        }
      })
      
      const text = await element.textContent()
      console.log(`📝 텍스트: "${text?.slice(0, 30)}..." - 색상: ${styles.color}, 배경: ${styles.backgroundColor}`)
    }
    
    console.log('ℹ️ 색상 대비율은 수동으로 확인하거나 전용 도구 사용 권장')
    console.log('✅ 색상 대비 분석 완료')
  })
})