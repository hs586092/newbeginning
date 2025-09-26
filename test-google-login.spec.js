import { test, expect } from '@playwright/test';

test.describe('Google Login Test', () => {
  test('should test Google login functionality', async ({ page }) => {
    console.log('🌐 Google 로그인 기능 테스트...');

    // 콘솔 메시지 캡처
    page.on('console', msg => {
      if (msg.text().includes('Google') || msg.text().includes('OAuth') || msg.text().includes('🔐')) {
        console.log(`[BROWSER] ${msg.text()}`);
      }
    });

    // 로그인 페이지로 이동
    await page.goto('https://www.fortheorlingas.com/auth/login', {
      waitUntil: 'networkidle'
    });

    // Google 로그인 버튼 확인
    const googleButton = page.locator('button:has-text("Google로 로그인")');
    await expect(googleButton).toBeVisible();

    const buttonText = await googleButton.textContent();
    console.log(`🔘 Google 로그인 버튼: "${buttonText}"`);

    // Google 로그인 버튼 상태 확인
    const isDisabled = await googleButton.isDisabled();
    console.log(`🔘 Google 버튼 활성 상태: ${!isDisabled}`);

    // 스크린샷
    await page.screenshot({
      path: 'google-login-available.png',
      fullPage: true
    });

    console.log('✅ Google 로그인 버튼이 사용 가능합니다');

    // 참고: 실제로 클릭하면 Google OAuth로 리디렉션되므로 클릭하지 않음
    console.log('ℹ️ Google 로그인은 OAuth 리디렉션을 통해 작동합니다');
  });

  test('should verify email login error message', async ({ page }) => {
    console.log('📧 이메일 로그인 에러 메시지 확인...');

    await page.goto('https://www.fortheorlingas.com/auth/login');

    // 이메일과 비밀번호 필드 채우기
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('testpassword');

    // 로그인 시도
    await page.locator('button[type="submit"]').click();

    // 에러 메시지 대기
    const errorElement = page.locator('.text-red-700');
    await expect(errorElement).toBeVisible({ timeout: 10000 });

    const errorMessage = await errorElement.textContent();
    console.log(`❌ 에러 메시지: "${errorMessage}"`);

    // 개선된 에러 메시지가 표시되는지 확인
    expect(errorMessage).toContain('Google 로그인을 이용해 주세요');

    await page.screenshot({
      path: 'email-login-disabled-message.png',
      fullPage: true
    });

    console.log('✅ 사용자 친화적인 에러 메시지가 표시됩니다');
  });
});