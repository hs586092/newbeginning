import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  const localUrl = 'http://localhost:3000';
  
  console.log('🔍 로그인 후 상태 시뮬레이션 분석...\n');
  
  await page.goto(localUrl);
  await page.waitForLoadState('networkidle');
  
  // 로그인 상태를 시뮬레이션하기 위해 localStorage 설정
  await page.evaluate(() => {
    // 임시 사용자 데이터 설정
    localStorage.setItem('supabase.auth.token', 'fake-token');
    localStorage.setItem('auth-storage', JSON.stringify({
      user: { 
        id: 'test-user-id',
        email: 'test@example.com'
      },
      session: {
        access_token: 'fake-token'
      }
    }));
  });
  
  // 페이지 새로고침으로 상태 반영
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('📋 로그인 상태 시뮬레이션 분석:');
  console.log('===============================');
  
  // 로그인 상태 스크린샷
  await page.screenshot({ 
    path: 'local-authenticated-full.png', 
    fullPage: true 
  });
  
  // 로그인 상태 DOM 분석
  const authenticatedAnalysis = {
    // 레이아웃 구조
    navigation: await page.locator('nav').count(),
    heroSection: await page.locator('div:has(h1):has-text("임신부터")').count(),
    dashboardHeader: await page.locator('h1:has-text("안녕하세요")').count(),
    leftSidebar: await page.locator('aside').first().isVisible().catch(() => false),
    rightSidebar: await page.locator('aside').last().isVisible().catch(() => false),
    totalSidebars: await page.locator('aside').count(),
    
    // 콘텐츠 차이
    mainTitle: await page.locator('h1').first().textContent().catch(() => '없음'),
    welcomeMessage: await page.locator('h1:has-text("안녕하세요")').textContent().catch(() => '없음'),
    writeButton: await page.locator('a[href="/write"], button:has-text("글쓰기")').count(),
    
    // 사이드바 내용 분석
    friendsList: await page.locator('aside h3:has-text("친구"), aside:has-text("친구")').count(),
    quickAccess: await page.locator('aside h3:has-text("빠른"), aside:has-text("액세스")').count(),
    communityStats: await page.locator('aside:has-text("커뮤니티 현황"), aside:has-text("통계")').count(),
    
    // CTA 요소 변화
    signupElements: await page.locator('text="무료"').count(),
    premiumElements: await page.locator('text="프리미엄"').count(),
  };
  
  // 결과 출력
  console.log('📊 로그인 상태 구조:');
  for (const [key, value] of Object.entries(authenticatedAnalysis)) {
    console.log(`  ${key}: ${value}`);
  }
  
  // 상세 분석
  console.log('\n🔍 상세 요소 분석:');
  
  // 사이드바 제목들 확인
  try {
    const sidebarTitles = await page.locator('aside h3, aside h4').allTextContents();
    console.log('📋 사이드바 제목들:', sidebarTitles.filter(title => title.trim()));
    
    const buttons = await page.locator('button, a[class*="Button"]').allTextContents();
    const filteredButtons = buttons.filter(btn => btn.trim() && btn.length < 30);
    console.log('🔘 주요 버튼들:', filteredButtons.slice(0, 10));
    
  } catch (error) {
    console.log('상세 분석 중 오류:', error.message);
  }
  
  console.log('\n⏳ 10초 후 브라우저를 닫습니다...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('✅ 로그인 상태 분석 완료!');
})();