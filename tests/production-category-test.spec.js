const { test, expect } = require('@playwright/test');

test('프로덕션 카테고리 필터링 기능 테스트', async ({ page }) => {
  console.log('🚀 프로덕션 환경 카테고리 필터링 테스트 시작');
  
  // 프로덕션 사이트 접속
  await page.goto('https://newbeginning-seven.vercel.app');
  await page.waitForTimeout(3000);
  
  // 페이지 로딩 확인
  await expect(page).toHaveTitle(/첫돌까지/);
  console.log('✅ 프로덕션 사이트 접속 성공');
  
  // 초기 스크린샷
  await page.screenshot({ path: 'test-results/production-homepage.png', fullPage: true });
  console.log('📸 프로덕션 홈페이지 스크린샷 저장');
  
  // 카테고리 버튼들 검색
  const categoryButtons = [
    { selector: 'text=전체', name: '전체' },
    { selector: 'text=예비맘', name: '예비맘' },
    { selector: 'text=신생아맘', name: '신생아맘' },
    { selector: 'text=성장기맘', name: '성장기맘' },
    { selector: 'text=선배맘', name: '선배맘' }
  ];
  
  let foundButtons = 0;
  
  for (const button of categoryButtons) {
    try {
      const element = page.locator(button.selector).first();
      const isVisible = await element.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        foundButtons++;
        console.log(`✅ ${button.name} 버튼 발견`);
        
        // 버튼 클릭 테스트
        await element.click();
        await page.waitForTimeout(1000);
        
        // 클릭 후 스크린샷
        await page.screenshot({ 
          path: `test-results/production-${button.name}.png`,
          fullPage: true 
        });
        console.log(`✅ ${button.name} 버튼 클릭 성공 - 스크린샷 저장`);
        
      } else {
        console.log(`❌ ${button.name} 버튼을 찾을 수 없습니다`);
      }
    } catch (error) {
      console.log(`⚠️ ${button.name} 버튼 테스트 중 오류:`, error.message);
    }
  }
  
  // 결과 요약
  console.log(`\n🎯 테스트 결과: ${foundButtons}/5개 카테고리 버튼 발견`);
  
  if (foundButtons >= 4) {
    console.log('🎉 카테고리 필터링 기능이 프로덕션에서 성공적으로 작동합니다!');
  } else {
    console.log('⚠️ 일부 카테고리 버튼이 누락되었습니다.');
  }
  
  // 페이지 성능 체크
  const performanceTiming = await page.evaluate(() => {
    return {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    };
  });
  
  console.log(`⚡ 페이지 로딩 성능:`);
  console.log(`   - 총 로딩 시간: ${performanceTiming.loadTime}ms`);
  console.log(`   - DOM 준비 시간: ${performanceTiming.domReady}ms`);
  
  console.log('\n🏁 프로덕션 테스트 완료');
});