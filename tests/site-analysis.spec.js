const { test, expect } = require('@playwright/test');

test.describe('🔍 BUDICONNECTS 사이트 분석', () => {
  
  test('사이트 전체 탐색 및 분석', async ({ page }) => {
    console.log('🚀 BUDICONNECTS 사이트 분석을 시작합니다...');
    
    // 메인 사이트로 이동
    await page.goto('https://newbeginning-seven.vercel.app/');
    
    // 페이지 로드 대기
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 기본 정보 수집
    const title = await page.title();
    const url = page.url();
    console.log('📄 페이지 제목:', title);
    console.log('🌐 현재 URL:', url);
    
    // 메인 페이지 스크린샷
    await page.screenshot({ 
      path: './playwright-outputs/homepage-analysis.png',
      fullPage: true 
    });
    console.log('📸 홈페이지 스크린샷 저장됨');
    
    // 페이지 구조 분석
    console.log('\n🏗️ === 페이지 구조 분석 ===');
    
    // 헤더 분석
    const headerExists = await page.locator('header').isVisible();
    console.log('🔝 헤더 존재:', headerExists);
    
    // 네비게이션 메뉴 확인
    const navItems = await page.locator('nav a, nav button').allTextContents();
    console.log('🧭 네비게이션 메뉴:', navItems);
    
    // 메인 헤딩 확인
    const mainHeading = await page.locator('h1').first().textContent();
    console.log('📋 메인 헤딩:', mainHeading);
    
    // CTA 버튼들 확인
    const buttons = await page.locator('button, a[role="button"]').allTextContents();
    console.log('🔘 발견된 버튼들:', buttons.slice(0, 10)); // 처음 10개만
    
    console.log('\n🎨 === UI/UX 요소 분석 ===');
    
    // 색상 테마 분석 (배경색 확인)
    const bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log('🎨 바디 배경색:', bodyBgColor);
    
    // 폰트 분석
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    console.log('📝 폰트 패밀리:', fontFamily);
    
    // 반응형 확인 - 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: './playwright-outputs/mobile-view.png',
      fullPage: true 
    });
    console.log('📱 모바일 뷰 스크린샷 저장됨');
    
    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(2000);
    
    console.log('\n🔗 === 네비게이션 테스트 ===');
    
    // 주요 페이지들 탐색
    const pagesToCheck = [
      { name: '구인구직', selector: 'a[href*="jobs"], a:has-text("구인구직")' },
      { name: '커뮤니티', selector: 'a[href*="community"], a:has-text("커뮤니티")' },
      { name: '글쓰기', selector: 'a[href*="write"], a:has-text("글쓰기")' }
    ];
    
    for (const pageInfo of pagesToCheck) {
      try {
        const element = page.locator(pageInfo.selector).first();
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          console.log(`✅ ${pageInfo.name} 링크 발견됨`);
          
          // 클릭해서 페이지 이동
          await element.click();
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          const newTitle = await page.title();
          console.log(`   🔗 이동된 URL: ${newUrl}`);
          console.log(`   📄 페이지 제목: ${newTitle}`);
          
          // 스크린샷 저장
          await page.screenshot({ 
            path: `./playwright-outputs/${pageInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}-page.png`,
            fullPage: true 
          });
          
          // 뒤로가기
          await page.goBack();
          await page.waitForTimeout(2000);
        } else {
          console.log(`❌ ${pageInfo.name} 링크를 찾을 수 없음`);
        }
      } catch (error) {
        console.log(`⚠️ ${pageInfo.name} 페이지 테스트 중 오류:`, error.message);
      }
    }
    
    console.log('\n⚡ === 성능 분석 ===');
    
    // 페이지 로드 시간 측정
    const navigationStart = await page.evaluate(() => performance.timing.navigationStart);
    const loadComplete = await page.evaluate(() => performance.timing.loadEventEnd);
    const loadTime = loadComplete - navigationStart;
    console.log('⏱️ 페이지 로드 시간:', loadTime + 'ms');
    
    // 이미지 개수 확인
    const imageCount = await page.locator('img').count();
    console.log('🖼️ 이미지 개수:', imageCount);
    
    // 링크 개수 확인
    const linkCount = await page.locator('a').count();
    console.log('🔗 링크 개수:', linkCount);
    
    console.log('\n✨ 사이트 분석 완료!');
  });

  test('특별 기능 테스트', async ({ page }) => {
    console.log('🎯 특별 기능들을 테스트합니다...');
    
    await page.goto('https://newbeginning-seven.vercel.app/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 다크모드 토글 확인
    const darkModeToggle = await page.locator('button:has-text("다크"), button[aria-label*="dark"], button[data-theme]').count();
    console.log('🌙 다크모드 토글:', darkModeToggle > 0 ? '있음' : '없음');
    
    // 검색 기능 확인
    const searchBox = await page.locator('input[type="search"], input[placeholder*="검색"]').count();
    console.log('🔍 검색 기능:', searchBox > 0 ? '있음' : '없음');
    
    // 로그인/회원가입 버튼 확인
    const authButtons = await page.locator('a:has-text("로그인"), a:has-text("회원가입"), button:has-text("로그인")').count();
    console.log('👤 인증 버튼:', authButtons > 0 ? '있음' : '없음');
    
    // 언어 선택 확인
    const languageSelector = await page.locator('select[name*="lang"], button:has-text("한국어"), button:has-text("English")').count();
    console.log('🌍 언어 선택:', languageSelector > 0 ? '있음' : '없음');
    
    console.log('🎯 특별 기능 테스트 완료!');
  });

});