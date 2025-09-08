const { test, expect } = require('@playwright/test');

test('카테고리 버튼 수동 테스트', async ({ page }) => {
  console.log('🔍 수동 테스트 시작 - 브라우저에서 직접 확인');
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  // 스크린샷 촬영
  await page.screenshot({ path: 'test-results/main-page.png', fullPage: true });
  console.log('📸 메인 페이지 스크린샷 저장됨');
  
  // 로그인 시도
  try {
    const loginBtn = page.locator('a:has-text("로그인"), button:has-text("로그인")').first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await page.waitForTimeout(2000);
      
      // 로그인 페이지 스크린샷
      await page.screenshot({ path: 'test-results/login-page.png', fullPage: true });
      console.log('📸 로그인 페이지 스크린샷 저장됨');
    }
  } catch (error) {
    console.log('ℹ️ 로그인 버튼 클릭 시도 중 오류:', error.message);
  }
  
  // 대시보드 직접 접근
  try {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    // 대시보드 스크린샷
    await page.screenshot({ path: 'test-results/dashboard-page.png', fullPage: true });
    console.log('📸 대시보드 페이지 스크린샷 저장됨');
    
    // 페이지 HTML 덤프 (카테고리 버튼 확인용)
    const html = await page.content();
    require('fs').writeFileSync('test-results/dashboard-html.txt', html);
    console.log('📄 대시보드 HTML 저장됨');
    
    // 다양한 셀렉터로 카테고리 버튼 검색
    const selectors = [
      'button:has-text("예비맘")',
      'button:has-text("🤰")', 
      '[data-category="pregnant"]',
      'button[class*="category"]',
      'button:has-text("전체")',
      'button:has-text("🌟")'
    ];
    
    for (const selector of selectors) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        console.log(`✅ 카테고리 버튼 발견: ${selector}`);
        try {
          await element.click();
          await page.waitForTimeout(1000);
          console.log(`✅ 버튼 클릭 성공: ${selector}`);
        } catch (clickError) {
          console.log(`⚠️ 클릭 실패: ${selector}`);
        }
      } else {
        console.log(`❌ 버튼 미발견: ${selector}`);
      }
    }
    
  } catch (error) {
    console.log('ℹ️ 대시보드 접근 오류:', error.message);
  }
  
  // 30초 대기 (수동 확인 시간)
  console.log('⏰ 30초 대기 중... 브라우저에서 수동으로 확인해보세요');
  await page.waitForTimeout(30000);
});