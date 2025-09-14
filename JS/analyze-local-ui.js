import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  const localUrl = 'http://localhost:3000';
  
  console.log('🔍 로컬 서버 UI 차이점 분석 시작...\n');
  
  // 로그아웃 상태 분석
  console.log('📋 1. 로그아웃 상태 분석:');
  console.log('==========================');
  
  await page.goto(localUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // 추가 로딩 대기
  
  // 로그아웃 상태 스크린샷
  await page.screenshot({ 
    path: 'local-logged-out-full.png', 
    fullPage: true 
  });
  
  // 로그아웃 상태 DOM 분석
  const loggedOutAnalysis = {
    // 레이아웃 구조
    navigation: await page.locator('nav').count(),
    heroSection: await page.locator('div:has(h1):has-text("임신부터")').count(),
    leftSidebar: await page.locator('aside').first().isVisible().catch(() => false),
    rightSidebar: await page.locator('aside').last().isVisible().catch(() => false),
    totalSidebars: await page.locator('aside').count(),
    
    // 콘텐츠 요소
    mainTitle: await page.locator('h1').first().textContent().catch(() => '없음'),
    secondaryTitle: await page.locator('h2').first().textContent().catch(() => '없음'),
    
    // CTA 및 액션 요소
    signupButtons: await page.locator('text="무료"').count(),
    signupLinks: await page.locator('a[href="/signup"]').count(),
    loginLinks: await page.locator('a[href="/login"]').count(),
    
    // 사이드바 내용 (로그아웃 상태)
    leftSidebarContent: [],
    rightSidebarContent: [],
  };
  
  // 사이드바 내용 분석
  try {
    if (loggedOutAnalysis.totalSidebars > 0) {
      const leftCards = await page.locator('aside').first().locator('.bg-gradient-to-br, .bg-white, .bg-blue-50').count();
      const rightCards = await page.locator('aside').last().locator('.bg-gradient-to-br, .bg-white, .bg-blue-50').count();
      
      loggedOutAnalysis.leftSidebarContent = [`${leftCards}개의 카드`];
      loggedOutAnalysis.rightSidebarContent = [`${rightCards}개의 카드`];
      
      // 사이드바 제목들
      const leftTitles = await page.locator('aside').first().locator('h3, h4').allTextContents();
      const rightTitles = await page.locator('aside').last().locator('h3, h4').allTextContents();
      
      loggedOutAnalysis.leftSidebarContent.push(...leftTitles);
      loggedOutAnalysis.rightSidebarContent.push(...rightTitles);
    }
  } catch (error) {
    console.log('사이드바 분석 중 오류:', error.message);
  }
  
  // 결과 출력
  console.log('📊 로그아웃 상태 구조:');
  for (const [key, value] of Object.entries(loggedOutAnalysis)) {
    if (Array.isArray(value)) {
      console.log(`  ${key}: [${value.join(', ')}]`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  console.log('\n🔐 로그인 상태 시뮬레이션:');
  console.log('=============================');
  
  // 로그인 페이지로 이동해서 로그인 시뮬레이션
  await page.goto(`${localUrl}/login`);
  await page.waitForLoadState('networkidle');
  
  // 로그인 페이지 스크린샷
  await page.screenshot({ 
    path: 'local-login-page.png', 
    fullPage: true 
  });
  
  console.log('📝 분석 요약:');
  console.log('- 로그아웃 상태 네비게이션:', loggedOutAnalysis.navigation, '개');
  console.log('- 히어로 섹션 존재:', loggedOutAnalysis.heroSection > 0 ? 'YES' : 'NO');
  console.log('- 사이드바 개수:', loggedOutAnalysis.totalSidebars, '개');
  console.log('- 왼쪽 사이드바 표시:', loggedOutAnalysis.leftSidebar ? 'YES' : 'NO');
  console.log('- 오른쪽 사이드바 표시:', loggedOutAnalysis.rightSidebar ? 'YES' : 'NO');
  console.log('- 회원가입 관련 요소:', loggedOutAnalysis.signupButtons + loggedOutAnalysis.signupLinks, '개');
  
  console.log('\n⏳ 10초 후 브라우저를 닫습니다...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('✅ UI 분석 완료!');
  
  // 추가 분석을 위한 가이드 출력
  console.log('\n📋 추가 분석이 필요한 항목:');
  console.log('1. 실제 로그인 후 상태 - Supabase 인증 필요');
  console.log('2. 친구 리스트 표시 여부');
  console.log('3. 대시보드 헤더 vs 히어로 섹션 차이');
  console.log('4. 사이드바 내용 변화 (CTA → 통계/기능)');
})();