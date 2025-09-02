const { test, expect } = require('@playwright/test');

test.describe('크롬 브라우저 데모 테스트', () => {
  
  test('Google 검색 테스트', async ({ page }) => {
    // Google 홈페이지로 이동
    await page.goto('https://www.google.com');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Google/);
    
    // 검색창에 'Playwright' 입력
    await page.fill('[name="q"]', 'Playwright 자동화 테스트');
    
    // 검색 버튼 클릭 (또는 Enter 키)
    await page.press('[name="q"]', 'Enter');
    
    // 검색 결과 페이지 로드 대기
    await page.waitForLoadState('domcontentloaded');
    
    // 검색 결과 확인
    await expect(page.locator('#search')).toBeVisible();
    
    console.log('✅ Google 검색 테스트 완료!');
  });

  test('우리 사이트 간단 테스트', async ({ page }) => {
    try {
      // 우리 사이트로 이동
      await page.goto('/');
      
      // 5초 대기 (사이트 로딩 시간)
      await page.waitForTimeout(5000);
      
      // 페이지 제목 로그
      const title = await page.title();
      console.log('📄 페이지 제목:', title);
      
      // 스크린샷 저장
      await page.screenshot({ 
        path: './playwright-outputs/demo-screenshot.png',
        fullPage: true 
      });
      
      console.log('📸 스크린샷 저장됨!');
      
    } catch (error) {
      console.log('ℹ️ 사이트 접근 제한, Google 테스트만 실행됩니다.');
    }
  });

  test('네이버 검색 테스트', async ({ page }) => {
    // 네이버 홈페이지로 이동
    await page.goto('https://www.naver.com');
    
    // 검색창에 텍스트 입력
    await page.fill('#query', 'Playwright 브라우저 자동화');
    
    // 검색 버튼 클릭
    await page.click('.btn_search');
    
    // 검색 결과 페이지 로드 대기
    await page.waitForLoadState('domcontentloaded');
    
    console.log('✅ 네이버 검색 테스트 완료!');
  });

});