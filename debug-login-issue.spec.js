import { test, expect } from '@playwright/test';

test.describe('Login Button Infinite Loading Debug', () => {
  test('should debug login button infinite loading issue', async ({ page }) => {
    console.log('🔍 로그인 버튼 무한 로딩 문제 디버깅...');

    // 콘솔 메시지 캡처
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      console.log(`[BROWSER ${msg.type().toUpperCase()}] ${text}`);
    });

    // 네트워크 요청 모니터링
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });

    const networkResponses = [];
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        timestamp: Date.now()
      });
    });

    // 로그인 페이지로 이동
    await page.goto('https://www.fortheorlingas.com/auth/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('📄 로그인 페이지 로드 완료');

    // 폼 요소들 확인
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();

    // 초기 버튼 상태 확인
    const initialButtonText = await loginButton.textContent();
    const initialDisabled = await loginButton.isDisabled();
    console.log(`🔘 초기 버튼 상태: "${initialButtonText}", disabled: ${initialDisabled}`);

    // 테스트 credentials 입력
    await emailField.fill('test@example.com');
    await passwordField.fill('testpassword123');

    console.log('📝 테스트 자격증명 입력 완료');

    // 로그인 버튼 클릭 전 상태
    const beforeClickTime = Date.now();
    console.log(`⏰ 로그인 버튼 클릭 시작: ${new Date(beforeClickTime).toLocaleTimeString()}`);

    // 로그인 버튼 클릭
    await loginButton.click();

    // 클릭 후 즉시 상태 확인
    await page.waitForTimeout(100);
    const afterClickText = await loginButton.textContent();
    const afterClickDisabled = await loginButton.isDisabled();
    console.log(`🔘 클릭 후 버튼 상태: "${afterClickText}", disabled: ${afterClickDisabled}`);

    // 무한 로딩 모니터링 (최대 15초)
    let isStillLoading = false;
    let checkCount = 0;
    const maxChecks = 30; // 15초 (500ms * 30)

    while (checkCount < maxChecks) {
      await page.waitForTimeout(500);
      checkCount++;

      const currentText = await loginButton.textContent();
      const currentDisabled = await loginButton.isDisabled();
      const isLoading = currentText?.includes('로딩') || currentText?.includes('loading') || currentText?.includes('중');

      console.log(`🔄 체크 ${checkCount}/30: "${currentText}", disabled: ${currentDisabled}, 로딩중: ${isLoading}`);

      // 로딩이 끝났는지 확인
      if (!isLoading && !currentDisabled) {
        console.log(`✅ 로딩 완료! (${checkCount * 500}ms 후)`);
        break;
      }

      // 에러 메시지가 나타났는지 확인
      const errorElement = page.locator('.text-red-700, .bg-red-50');
      const errorCount = await errorElement.count();
      if (errorCount > 0) {
        const errorText = await errorElement.first().textContent();
        console.log(`❌ 에러 메시지 발견: ${errorText}`);
        break;
      }

      // 마지막 체크에서 여전히 로딩 중이면 무한 로딩
      if (checkCount === maxChecks && (isLoading || currentDisabled)) {
        isStillLoading = true;
        console.log('🚨 무한 로딩 감지됨!');
      }
    }

    // 관련 네트워크 요청 분석
    const authRequests = networkRequests.filter(req =>
      req.url.includes('auth') ||
      req.url.includes('signin') ||
      req.url.includes('supabase')
    );

    console.log(`🌐 인증 관련 네트워크 요청: ${authRequests.length}개`);
    authRequests.forEach(req => {
      console.log(`  - ${req.method} ${req.url}`);
    });

    const authResponses = networkResponses.filter(res =>
      res.url.includes('auth') ||
      res.url.includes('signin') ||
      res.url.includes('supabase')
    );

    console.log(`📡 인증 관련 응답: ${authResponses.length}개`);
    authResponses.forEach(res => {
      console.log(`  - ${res.status} ${res.url}`);
    });

    // 콘솔에서 로그인 관련 메시지 분석
    const loginMessages = consoleMessages.filter(msg =>
      msg.includes('🔐') ||
      msg.includes('로그인') ||
      msg.includes('Login') ||
      msg.includes('signIn') ||
      msg.includes('error') ||
      msg.includes('Error')
    );

    console.log(`📝 로그인 관련 콘솔 메시지: ${loginMessages.length}개`);
    loginMessages.forEach(msg => {
      console.log(`  - ${msg}`);
    });

    // 스크린샷 저장
    await page.screenshot({
      path: 'login-infinite-loading-debug.png',
      fullPage: true
    });

    // 최종 상태 보고
    const finalButtonText = await loginButton.textContent();
    const finalDisabled = await loginButton.isDisabled();

    console.log('\n📋 최종 진단 보고서:');
    console.log(`- 무한 로딩 발생: ${isStillLoading ? '예' : '아니오'}`);
    console.log(`- 최종 버튼 텍스트: "${finalButtonText}"`);
    console.log(`- 최종 버튼 비활성화: ${finalDisabled}`);
    console.log(`- 총 체크 횟수: ${checkCount}/30`);
    console.log(`- 네트워크 요청: ${networkRequests.length}개`);
    console.log(`- 콘솔 메시지: ${consoleMessages.length}개`);

    // 테스트 결과: 무한 로딩이 발생하지 않아야 함
    expect(isStillLoading).toBe(false);
  });

  test('should test with different credentials', async ({ page }) => {
    console.log('🔍 다른 자격증명으로 로그인 테스트...');

    page.on('console', msg => {
      if (msg.text().includes('🔐') || msg.text().includes('로그인') || msg.text().includes('Error')) {
        console.log(`[BROWSER] ${msg.text()}`);
      }
    });

    await page.goto('https://www.fortheorlingas.com/auth/login');

    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    // 빈 필드로 시도 (유효성 검사 테스트)
    console.log('📝 빈 필드로 로그인 시도...');
    await loginButton.click();

    await page.waitForTimeout(2000);

    let buttonText = await loginButton.textContent();
    console.log(`🔘 빈 필드 후 버튼: "${buttonText}"`);

    // 유효한 이메일 형식이지만 틀린 credentials
    console.log('📝 잘못된 자격증명으로 시도...');
    await emailField.fill('wrong@email.com');
    await passwordField.fill('wrongpassword');
    await loginButton.click();

    // 5초 대기 후 상태 확인
    await page.waitForTimeout(5000);

    buttonText = await loginButton.textContent();
    const isDisabled = await loginButton.isDisabled();
    console.log(`🔘 잘못된 자격증명 후 버튼: "${buttonText}", disabled: ${isDisabled}`);

    // 에러 메시지 확인
    const errorElement = page.locator('.text-red-700');
    const hasError = await errorElement.count() > 0;
    if (hasError) {
      const errorText = await errorElement.textContent();
      console.log(`❌ 에러 메시지: ${errorText}`);
    }

    await page.screenshot({ path: 'login-different-credentials.png' });
  });
});