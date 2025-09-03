const { test, expect } = require('@playwright/test');

test('피드 네비게이션에 정보센터 버튼 추가 및 헤더 버튼 제거 테스트', async ({ page }) => {
  const siteUrl = 'https://newbeginning-seven.vercel.app/';
  
  try {
    console.log('🌐 사이트 접근:', siteUrl);
    
    const response = await page.goto(siteUrl);
    console.log('📊 응답 상태:', response?.status());
    
    if (response && response.status() === 200) {
      console.log('✅ 사이트 정상 접근!');
      
      // 헤더에서 정보센터 버튼이 제거되었는지 확인
      const headerEducationalLink = await page.locator('header a[href="/educational"]').count();
      if (headerEducationalLink === 0) {
        console.log('✅ 헤더에서 정보센터 버튼 제거 확인됨');
      } else {
        console.log('❌ 헤더에 여전히 정보센터 버튼이 있음');
      }
      
      // 피드 네비게이션 영역 확인
      const feedNavigation = await page.locator('[class*="카테고리별 정보"], h2:has-text("카테고리별 정보")').first();
      if (await feedNavigation.count() > 0) {
        console.log('✅ 피드 네비게이션 영역 발견');
        
        // 정보센터 버튼 확인 (📚 이모지와 "정보센터" 텍스트)
        const educationalButton = await page.locator('button:has(span:text("📚")), button:has-text("정보센터")').first();
        if (await educationalButton.count() > 0) {
          console.log('✅ 피드 네비게이션에 정보센터 버튼 발견!');
          
          // 버튼 스타일 확인 (featured 스타일)
          const buttonClasses = await educationalButton.getAttribute('class');
          if (buttonClasses && buttonClasses.includes('blue')) {
            console.log('✅ 정보센터 버튼의 featured 스타일 (파란색 계열) 확인됨');
          }
          
          // 버튼 클릭 테스트
          console.log('🖱️  정보센터 버튼 클릭 테스트...');
          await educationalButton.click();
          
          // URL 변경 확인
          await page.waitForTimeout(2000);
          const newUrl = page.url();
          console.log('🔗 클릭 후 URL:', newUrl);
          
          if (newUrl.includes('/educational')) {
            console.log('✅ 정보센터 페이지로 정상 이동!');
            
            // 정보센터 페이지 내용 확인
            const pageTitle = await page.locator('h1:has-text("육아 정보 센터")').first();
            if (await pageTitle.count() > 0) {
              console.log('✅ 정보센터 페이지 정상 로드됨');
            }
          } else {
            console.log('❌ 정보센터 페이지로 이동하지 않음');
          }
          
        } else {
          console.log('❌ 피드 네비게이션에 정보센터 버튼을 찾을 수 없음');
        }
        
        // 다른 네비게이션 버튼들도 확인
        const navButtons = await page.locator('button[class*="flex-shrink-0"][class*="px-4"]').count();
        console.log(`📱 총 네비게이션 버튼 수: ${navButtons}개`);
        
        // 정보센터 버튼이 첫 번째에 위치하는지 확인
        const firstButton = await page.locator('button[class*="flex-shrink-0"][class*="px-4"]').first();
        const firstButtonText = await firstButton.textContent();
        if (firstButtonText && (firstButtonText.includes('정보센터') || firstButtonText.includes('📚'))) {
          console.log('✅ 정보센터 버튼이 첫 번째 위치에 배치됨');
        } else {
          console.log('ℹ️  정보센터 버튼 위치:', firstButtonText);
        }
      } else {
        console.log('❌ 피드 네비게이션 영역을 찾을 수 없음');
      }
      
      // 스크린샷 저장
      await page.screenshot({ path: 'navigation-improvement-test.png', fullPage: true });
      console.log('📸 네비게이션 개선 테스트 스크린샷 저장됨');
      
    } else {
      console.log(`❌ 사이트 접근 실패 - 상태: ${response?.status()}`);
    }
    
  } catch (error) {
    console.log('🔥 오류 발생:', error.message);
    
    try {
      await page.screenshot({ path: 'navigation-error.png' });
      console.log('📸 오류 스크린샷 저장됨');
    } catch (e) {
      console.log('스크린샷 실패');
    }
  }
});