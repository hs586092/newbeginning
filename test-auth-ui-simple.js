import { chromium } from 'playwright';

async function testAuthUISimple() {
  console.log('🎯 간단 인증 UI 테스트 시작...');

  const browser = await chromium.launch({
    headless: false,
    devtools: false
  });
  const page = await browser.newPage();

  // 콘솔 로그 캡처
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('UnifiedHomepage: Authentication state') || text.includes('UNAUTHENTICATED') || text.includes('AUTHENTICATED')) {
      logs.push(text);
      console.log(`🔍 인증 로그: ${text}`);
    }
  });

  try {
    console.log('📍 1. 홈페이지 접속...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('📍 2. 로그인 전 텍스트 확인...');
    const preLoginText = await page.evaluate(() => {
      const heroElement = document.querySelector('p.text-blue-100');
      return heroElement ? heroElement.textContent : '';
    });

    console.log('로그인 전 히어로 텍스트:', preLoginText);

    console.log('📍 3. 로그인 페이지로 이동...');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 로그인 폼 대기
    await page.waitForSelector('form', { timeout: 10000 });

    console.log('📍 4. 로그인 시도...');
    await page.fill('input[name="email"]', 'test@newbeginning.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('📍 5. 홈페이지로 복귀...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('📍 6. 로그인 후 텍스트 확인...');
    const postLoginText = await page.evaluate(() => {
      const heroElement = document.querySelector('p.text-blue-100');
      return heroElement ? heroElement.textContent : '';
    });

    console.log('로그인 후 히어로 텍스트:', postLoginText);

    console.log('📍 7. 버튼 상태 확인...');
    const buttonStates = await page.evaluate(() => {
      const writeButton = document.querySelector('button:has-text("새 글 작성하기")');
      const signupButton = document.querySelector('button:has-text("무료로 시작하기")');
      const loginLinks = document.querySelectorAll('a[href*="login"]');

      return {
        hasWriteButton: !!writeButton,
        hasSignupButton: !!signupButton,
        loginLinksCount: loginLinks.length
      };
    });

    console.log('버튼 상태:', buttonStates);

    console.log('📍 8. 결과 분석...');
    const textChanged = preLoginText !== postLoginText;
    const hasAuthLogs = logs.some(log => log.includes('UnifiedHomepage: Authentication state'));

    console.log(`📊 텍스트 변화: ${textChanged ? 'YES' : 'NO'}`);
    console.log(`📊 인증 로그 존재: ${hasAuthLogs ? 'YES' : 'NO'}`);
    console.log(`📊 총 로그 수: ${logs.length}개`);

    if (logs.length > 0) {
      console.log('\n✅ 인증 로그:');
      logs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }

    if (textChanged && hasAuthLogs) {
      console.log('\n🎉 테스트 성공! UI가 인증 상태를 반영하고 있습니다!');
    } else {
      console.log('\n⚠️ 일부 개선이 필요할 수 있습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }

  console.log('\n⏳ 브라우저를 15초 동안 열어두어 수동 확인이 가능합니다...');
  await page.waitForTimeout(15000);

  await browser.close();
}

testAuthUISimple().catch(console.error);