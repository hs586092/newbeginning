import { chromium } from 'playwright';

async function testActualFunctionality() {
  console.log('🔍 실제 좋아요/댓글 기능 테스트 시작...');

  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });

  const page = await browser.newPage();

  // 모든 네트워크 요청과 콘솔 로그 캡처
  const networkLogs = [];
  const consoleLogs = [];
  const errors = [];

  page.on('request', request => {
    networkLogs.push(`📤 ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    networkLogs.push(`📥 ${response.status()} ${response.url()}`);
  });

  page.on('console', msg => {
    consoleLogs.push(`💬 ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    errors.push(`❌ Page Error: ${error.message}`);
  });

  try {
    console.log('1. 홈페이지 접속...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    console.log('2. 인증 상태 확인...');
    const authButton = await page.locator('a[href*="login"], button:has-text("로그인")').first();
    const isLoggedOut = await authButton.isVisible();

    if (isLoggedOut) {
      console.log('❌ 로그아웃 상태 - 로그인 필요');
      await authButton.click();
      await page.waitForLoadState('networkidle');

      // Google 로그인 시도
      const googleLogin = await page.locator('button:has-text("Google")').first();
      if (await googleLogin.isVisible()) {
        console.log('3. Google 로그인 시도...');
        await googleLogin.click();
        await page.waitForTimeout(5000);
      }
    }

    console.log('4. 홈페이지로 돌아가서 포스트 확인...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // 좋아요 버튼 찾기
    console.log('5. 좋아요 버튼 찾기...');
    const likeButtons = await page.locator('button[aria-label*="좋아요"], button:has-text("♡"), button:has-text("❤️")').all();

    if (likeButtons.length === 0) {
      console.log('❌ 좋아요 버튼을 찾을 수 없음');
    } else {
      console.log(`✅ 좋아요 버튼 ${likeButtons.length}개 발견`);

      console.log('6. 첫 번째 좋아요 버튼 클릭 테스트...');
      await likeButtons[0].click();
      await page.waitForTimeout(2000);
    }

    // 댓글 입력 찾기
    console.log('7. 댓글 입력 필드 찾기...');
    const commentInputs = await page.locator('textarea[placeholder*="댓글"], input[placeholder*="댓글"]').all();

    if (commentInputs.length === 0) {
      console.log('❌ 댓글 입력 필드를 찾을 수 없음');
    } else {
      console.log(`✅ 댓글 입력 필드 ${commentInputs.length}개 발견`);

      console.log('8. 첫 번째 댓글 입력 테스트...');
      await commentInputs[0].fill('테스트 댓글입니다');

      const commentSubmit = await page.locator('button:has-text("작성"), button:has-text("댓글"), button[type="submit"]').first();
      if (await commentSubmit.isVisible()) {
        await commentSubmit.click();
        await page.waitForTimeout(2000);
      }
    }

    console.log('\n📊 테스트 결과:');
    console.log('='.repeat(50));

    console.log('\n🌐 네트워크 로그 (마지막 10개):');
    networkLogs.slice(-10).forEach(log => console.log(log));

    console.log('\n💬 콘솔 로그 (마지막 10개):');
    consoleLogs.slice(-10).forEach(log => console.log(log));

    if (errors.length > 0) {
      console.log('\n❌ 오류들:');
      errors.forEach(error => console.log(error));
    }

    console.log('\n⏳ 수동 확인을 위해 15초간 브라우저 유지...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testActualFunctionality().catch(console.error);