// Playwright MCP 테스트 스크립트
const { chromium } = require('playwright');

async function testPlaywright() {
  console.log('🎭 Playwright 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--ignore-certificate-errors'] 
  });
  
  const page = await browser.newPage();
  
  try {
    // 배포된 사이트로 이동
    await page.goto('https://newbeginning-96pm37uh4-hs586092s-projects.vercel.app');
    
    // 페이지 로드 확인
    await page.waitForLoadState('domcontentloaded');
    
    const title = await page.title();
    console.log('✅ 페이지 제목:', title);
    
    // 헤더 확인
    const headerText = await page.textContent('h1');
    console.log('✅ 헤더 텍스트:', headerText);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: './playwright-outputs/homepage-screenshot.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장됨: ./playwright-outputs/homepage-screenshot.png');
    
    // 네비게이션 테스트
    const jobsLink = await page.getByText('구인구직').first();
    if (await jobsLink.isVisible()) {
      await jobsLink.click();
      await page.waitForLoadState('domcontentloaded');
      console.log('✅ 구인구직 페이지 네비게이션 성공');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await browser.close();
    console.log('🎭 브라우저 종료 완료');
  }
}

if (require.main === module) {
  testPlaywright().catch(console.error);
}

module.exports = { testPlaywright };