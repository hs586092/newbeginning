import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  const baseUrl = 'https://newbeginning-rxnespbew-hs586092s-projects.vercel.app';
  
  console.log('🔍 UI 차이점 분석 시작...\n');
  
  // 로그아웃 상태 분석
  console.log('📋 로그아웃 상태 랜딩페이지 분석:');
  console.log('================================');
  
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');
  
  // 전체 페이지 구조 분석
  const loggedOutElements = {
    // 네비게이션
    navigation: await page.locator('nav.bg-white.border-b').isVisible(),
    navigationTabs: await page.locator('nav.bg-white.border-b button').count(),
    
    // 히어로 섹션
    heroSection: await page.locator('div.bg-gradient-to-r.from-blue-600.to-purple-600').isVisible(),
    heroTitle: await page.locator('h1').first().textContent(),
    heroCTA: await page.locator('a[href="/signup"]').first().textContent(),
    
    // 사이드바들 (화면 너비에 따라 숨겨질 수 있음)
    leftSidebar: await page.locator('aside').first().isVisible().catch(() => false),
    rightSidebar: await page.locator('aside').last().isVisible().catch(() => false),
    sidebarCount: await page.locator('aside').count(),
    
    // 메인 콘텐츠
    mainTitle: await page.locator('h2').first().textContent(),
    
    // CTA 요소들
    signupButtons: await page.locator('a[href="/signup"], button:has-text("무료")').count(),
    loginLinks: await page.locator('a[href="/login"]').count(),
    
    // 전체 구조
    mainSections: await page.locator('main, .space-y-6, .space-y-4').count(),
    gradientBackgrounds: await page.locator('[class*="gradient"]').count(),
  };
  
  // 로그아웃 상태 결과 출력
  for (const [key, value] of Object.entries(loggedOutElements)) {
    console.log(`${key}: ${value}`);
  }
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'logged-out-full.png', 
    fullPage: true 
  });
  
  // 사이드바별 스크린샷
  if (loggedOutElements.leftSidebar) {
    await page.locator('aside').first().screenshot({ path: 'logged-out-left-sidebar.png' });
  }
  if (loggedOutElements.rightSidebar) {
    await page.locator('aside').last().screenshot({ path: 'logged-out-right-sidebar.png' });
  }
  
  console.log('\n📊 로그아웃 상태 특징:');
  console.log('- 히어로 섹션 존재:', loggedOutElements.heroSection);
  console.log('- 회원가입 버튼 개수:', loggedOutElements.signupButtons);
  console.log('- 로그인 링크 개수:', loggedOutElements.loginLinks);
  console.log('- 왼쪽 사이드바 카드 개수:', loggedOutElements.leftSidebarCards);
  console.log('- 오른쪽 사이드바 카드 개수:', loggedOutElements.rightSidebarCards);
  
  // 이제 로그인 시뮬레이션을 위해 로그인 페이지로 이동
  // (실제 로그인은 복잡하므로 로컬에서 개발 서버를 통해 확인 필요)
  console.log('\n🔐 로그인 상태 분석을 위해서는 실제 인증이 필요합니다.');
  console.log('로컬 개발 서버에서 로그인 후 동일한 분석을 진행해야 합니다.');
  
  await browser.close();
  console.log('\n✅ 로그아웃 상태 분석 완료!');
})();