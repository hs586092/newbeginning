const { test, expect } = require('@playwright/test');

test.describe('🎭 브라우저 창 확인 데모', () => {
  
  test('브라우저 창이 보이는지 확인', async ({ page }) => {
    console.log('🚀 브라우저 창을 엽니다...');
    
    // 간단한 사이트로 이동
    await page.goto('https://example.com');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('📄 페이지 제목:', title);
    
    // 10초 동안 대기 (브라우저 창을 볼 수 있도록)
    console.log('⏳ 10초 동안 브라우저 창을 확인해보세요...');
    await page.waitForTimeout(10000);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: './playwright-outputs/visual-demo.png',
      fullPage: true 
    });
    console.log('📸 스크린샷이 ./playwright-outputs/visual-demo.png에 저장되었습니다');
    
    // 기본적인 assertion
    await expect(page.locator('h1')).toContainText('Example Domain');
    
    console.log('✅ 테스트 완료! 브라우저 창이 보였나요?');
  });

  test('한국 사이트 테스트 - 네이버', async ({ page }) => {
    console.log('🇰🇷 네이버 사이트를 엽니다...');
    
    await page.goto('https://www.naver.com');
    
    // 네이버 로고가 보이는지 확인
    await expect(page.locator('.logo_naver')).toBeVisible();
    
    console.log('⏳ 5초 동안 네이버 사이트를 확인해보세요...');
    await page.waitForTimeout(5000);
    
    console.log('✅ 네이버 사이트 로드 완료!');
  });

});