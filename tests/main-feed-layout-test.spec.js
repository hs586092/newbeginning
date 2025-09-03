const { test, expect } = require('@playwright/test');

test('메인 피드 레이아웃 개선사항 테스트', async ({ page }) => {
  try {
    console.log('🌐 메인 사이트 접근...');
    
    // 메인 사이트 접근
    await page.goto('https://newbeginning-seven.vercel.app/');
    console.log('✅ 사이트 접근 완료');
    
    // 로그인 페이지로 이동 (테스트용)
    console.log('🔑 로그인 페이지로 이동...');
    await page.goto('https://newbeginning-seven.vercel.app/login');
    
    // 로그인 페이지에서 "뒤로가기" 또는 메인으로 이동
    const backToMainLink = await page.locator('a[href="/"]', { hasText: '메인으로' }).first();
    if (await backToMainLink.count() > 0) {
      await backToMainLink.click();
      console.log('🏠 메인으로 돌아가기 클릭');
      
      // 잠시 대기
      await page.waitForTimeout(2000);
    }
    
    // URL 파라미터를 추가해서 강제로 피드 모드 진입
    console.log('🔄 피드 모드로 강제 전환...');
    await page.goto('https://newbeginning-seven.vercel.app/?force=feed');
    
    await page.waitForTimeout(3000);
    
    // 현재 화면 상태 확인
    const currentUrl = page.url();
    console.log('📍 현재 URL:', currentUrl);
    
    // 피드 타이틀 확인 (우리가 변경한 부분)
    const feedTitle = await page.locator('h1:has-text("최신 피드"), h1:has-text("최신 게시글")').first();
    if (await feedTitle.count() > 0) {
      const titleText = await feedTitle.textContent();
      console.log('✅ 피드 타이틀 발견:', titleText);
      
      // 페이지가 피드 모드인지 확인
      const isLoggedInView = titleText?.includes('피드') || titleText?.includes('게시글');
      if (isLoggedInView) {
        console.log('✅ 로그인 사용자용 피드 화면 확인됨');
        
        // 컨테이너 너비 확인 (우리가 max-w-4xl로 변경한 부분)
        const mainContainer = await page.locator('.max-w-4xl, .max-w-5xl, .max-w-6xl').first();
        if (await mainContainer.count() > 0) {
          const containerClass = await mainContainer.getAttribute('class');
          console.log('📐 메인 컨테이너 클래스:', containerClass);
          
          if (containerClass?.includes('max-w-4xl')) {
            console.log('✅ 피드 컨테이너가 max-w-4xl로 변경됨 - 개선사항 적용됨!');
          }
        }
        
        // 사이드바가 제거되었는지 확인 (lg:col-span-1 클래스가 없어야 함)
        const sidebar = await page.locator('.lg\\:col-span-1').count();
        if (sidebar === 0) {
          console.log('✅ 사이드바 제거됨 - 메인 피드 전체 너비 활용');
        } else {
          console.log('ℹ️  사이드바 여전히 존재:', sidebar + '개');
        }
        
        // 네비게이션 바 확인
        const navigation = await page.locator('[class*="py-3"]', '[class*="카테고리별"]').first();
        if (await navigation.count() > 0) {
          console.log('✅ 축소된 네비게이션 바 확인됨 (py-3)');
        }
        
      } else {
        console.log('ℹ️  아직 랜딩페이지 모드인 것 같습니다');
      }
    } else {
      console.log('ℹ️  피드 타이틀을 찾을 수 없음 - 여전히 랜딩페이지일 가능성');
    }
    
    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'main-feed-layout-test.png', fullPage: true });
    console.log('📸 메인 피드 레이아웃 테스트 스크린샷 저장됨');
    
    // 다른 접근 방법: 직접 커뮤니티 페이지로 이동
    console.log('🔄 커뮤니티 페이지로 직접 이동...');
    await page.goto('https://newbeginning-seven.vercel.app/community');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'community-page-layout.png', fullPage: true });
    console.log('📸 커뮤니티 페이지 스크린샷 저장됨');
    
  } catch (error) {
    console.log('🔥 오류 발생:', error.message);
    
    try {
      await page.screenshot({ path: 'layout-test-error.png' });
      console.log('📸 오류 스크린샷 저장됨');
    } catch (e) {
      console.log('스크린샷 실패');
    }
  }
});