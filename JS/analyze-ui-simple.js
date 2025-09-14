import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  const baseUrl = 'https://newbeginning-rxnespbew-hs586092s-projects.vercel.app';
  
  console.log('🔍 로그아웃 상태 UI 분석 시작...\n');
  
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('📷 스크린샷 캡처 중...');
  
  // 전체 페이지 스크린샷
  await page.screenshot({ 
    path: 'logged-out-full.png', 
    fullPage: true 
  });
  
  // 뷰포트 크기 스크린샷
  await page.screenshot({ 
    path: 'logged-out-viewport.png'
  });
  
  console.log('✅ 스크린샷 저장 완료');
  
  // DOM 구조 분석
  console.log('\n📊 DOM 구조 분석:');
  
  try {
    // 기본 구조 확인
    const hasNavigation = await page.locator('nav').count();
    const hasHero = await page.locator('.bg-gradient-to-r').count();
    const sidebarCount = await page.locator('aside').count();
    const mainContent = await page.locator('main').count();
    
    console.log(`- 네비게이션 요소: ${hasNavigation}개`);
    console.log(`- 히어로 섹션: ${hasHero}개`);
    console.log(`- 사이드바: ${sidebarCount}개`);
    console.log(`- 메인 콘텐츠: ${mainContent}개`);
    
    // CTA 요소들
    const signupElements = await page.locator('text="무료"').count();
    const loginElements = await page.locator('text="로그인"').count();
    
    console.log(`- 회원가입 관련 요소: ${signupElements}개`);
    console.log(`- 로그인 관련 요소: ${loginElements}개`);
    
    // 페이지 제목들 확인
    const titles = await page.locator('h1, h2, h3').allTextContents();
    console.log('\n📝 페이지 제목들:');
    titles.forEach((title, index) => {
      if (title.trim()) {
        console.log(`  ${index + 1}. ${title.trim()}`);
      }
    });
    
    // 버튼 텍스트들 확인
    const buttons = await page.locator('button, a[class*="button"]').allTextContents();
    console.log('\n🔘 버튼/링크 텍스트들:');
    buttons.forEach((btn, index) => {
      if (btn.trim() && btn.length < 50) {
        console.log(`  ${index + 1}. "${btn.trim()}"`);
      }
    });
    
  } catch (error) {
    console.error('분석 중 오류:', error.message);
  }
  
  console.log('\n⏳ 5초 후 브라우저를 닫습니다...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('✅ 로그아웃 상태 분석 완료!');
})();