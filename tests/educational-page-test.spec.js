const { test, expect } = require('@playwright/test');

test('정보센터 페이지 기능 테스트', async ({ page }) => {
  const siteUrl = 'https://newbeginning-seven.vercel.app/educational';
  
  try {
    console.log('🌐 정보센터 페이지 접근:', siteUrl);
    
    const response = await page.goto(siteUrl);
    console.log('📊 응답 상태:', response?.status());
    
    if (response && response.status() === 200) {
      console.log('✅ 정보센터 페이지 정상 접근!');
      
      // 페이지 제목 확인
      const title = await page.title();
      console.log('📖 페이지 제목:', title);
      
      // 메인 헤딩 확인
      const mainHeading = await page.locator('h1:has-text("육아 정보 센터")').first();
      if (await mainHeading.count() > 0) {
        console.log('✅ "육아 정보 센터" 헤딩 발견');
      }
      
      // 카테고리 그리드 확인
      const categoryCards = await page.locator('[class*="grid"] a[class*="p-6"]').count();
      console.log(`📚 카테고리 카드: ${categoryCards}개 발견`);
      
      // 각 카테고리 확인
      const categories = [
        { name: '임신 정보', icon: '🤱' },
        { name: '육아 가이드', icon: '👶' },
        { name: '건강 정보', icon: '🏥' },
        { name: '영양 가이드', icon: '🥗' },
        { name: '발달 정보', icon: '🎯' },
        { name: '안전 수칙', icon: '🛡️' }
      ];
      
      for (const category of categories) {
        const categoryElement = await page.locator(`text=${category.name}`).first();
        if (await categoryElement.count() > 0) {
          console.log(`✅ "${category.name}" 카테고리 발견`);
        }
      }
      
      // 타겟 오디언스 필터 확인
      const audienceFilters = await page.locator('a[class*="px-4"]:has-text("부모")').count();
      console.log(`👥 타겟 오디언스 필터: ${audienceFilters}개`);
      
      // 첫 번째 카테고리 클릭 테스트
      const firstCategory = await page.locator('[class*="grid"] a[class*="p-6"]').first();
      if (await firstCategory.count() > 0) {
        console.log('🖱️  첫 번째 카테고리 클릭 테스트...');
        await firstCategory.click();
        
        // URL 변경 확인
        await page.waitForTimeout(1000);
        const newUrl = page.url();
        console.log('🔗 새 URL:', newUrl);
        
        // 뒤로가기
        await page.goBack();
        await page.waitForTimeout(500);
      }
      
      // 스크린샷 저장
      await page.screenshot({ path: 'educational-page-test.png', fullPage: true });
      console.log('📸 정보센터 페이지 스크린샷 저장됨');
      
    } else {
      console.log(`❌ 정보센터 페이지 접근 실패 - 상태: ${response?.status()}`);
    }
    
  } catch (error) {
    console.log('🔥 오류 발생:', error.message);
    
    try {
      await page.screenshot({ path: 'educational-error.png' });
      console.log('📸 오류 스크린샷 저장됨');
    } catch (e) {
      console.log('스크린샷 실패');
    }
  }
});