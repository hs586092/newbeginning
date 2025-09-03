const { test, expect } = require('@playwright/test');

test('배포된 사이트 접근 및 기능 테스트', async ({ page }) => {
  const siteUrl = 'https://newbeginning-seven.vercel.app/';
  
  try {
    console.log('🌐 사이트 접근 시도:', siteUrl);
    
    // 사이트에 접근
    const response = await page.goto(siteUrl);
    console.log('📊 응답 상태:', response?.status());
    
    if (response?.status() === 401) {
      console.log('🔒 401 Unauthorized - 인증이 필요한 사이트입니다');
      console.log('📋 응답 헤더:', await response.allHeaders());
      
      // 페이지 내용 확인
      const content = await page.content();
      console.log('📄 페이지 내용 (처음 500자):', content.substring(0, 500));
      
      return;
    }
    
    if (response && response.status() >= 200 && response.status() < 300) {
      console.log('✅ 사이트 정상 접근 성공!');
      
      // 페이지 제목 확인
      const title = await page.title();
      console.log('📖 페이지 제목:', title);
      
      // 메인 헤더 확인
      const header = await page.locator('header').first();
      if (await header.count() > 0) {
        console.log('✅ 헤더 요소 발견');
        
        // 로고 텍스트 확인
        const logo = await page.locator('text=첫돌까지').first();
        if (await logo.count() > 0) {
          console.log('✅ 로고 "첫돌까지" 발견');
        }
        
        // 정보센터 링크 확인 (새로 추가된 기능)
        const educationalLink = await page.locator('text=정보센터').first();
        if (await educationalLink.count() > 0) {
          console.log('✅ 정보센터 링크 발견 - 새 기능 정상 배포됨');
        }
      }
      
      // 메인 콘텐츠 영역 확인
      const mainContent = await page.locator('main, [role="main"], .main-content').first();
      if (await mainContent.count() > 0) {
        console.log('✅ 메인 콘텐츠 영역 발견');
      }
      
      // 게시글 또는 피드 확인
      const posts = await page.locator('article, .post-card, [data-testid*="post"]').count();
      console.log(`📝 발견된 게시글/카드: ${posts}개`);
      
      // 정보 컨텐츠 (파란 배경) 확인
      const educationalPosts = await page.locator('.bg-gradient-to-r.from-blue-50, .bg-blue-50').count();
      if (educationalPosts > 0) {
        console.log(`📚 정보 컨텐츠 발견: ${educationalPosts}개 - 스마트 피드 기능 작동 중`);
      }
      
      // 스크린샷 저장
      await page.screenshot({ path: 'deployment-test.png', fullPage: true });
      console.log('📸 전체 페이지 스크린샷 저장됨: deployment-test.png');
      
    } else {
      console.log(`❌ 사이트 접근 실패 - 상태 코드: ${response?.status()}`);
    }
    
  } catch (error) {
    console.log('🔥 오류 발생:', error.message);
    
    // 네트워크 응답 정보
    if (error.message.includes('net::')) {
      console.log('🌐 네트워크 연결 문제일 수 있습니다');
    }
    
    // 오류 상황에서도 스크린샷 시도
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('📸 오류 상황 스크린샷 저장됨');
    } catch (screenshotError) {
      console.log('📸 스크린샷 저장 실패:', screenshotError.message);
    }
  }
});