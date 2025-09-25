import { test, expect } from '@playwright/test';

test.describe('Login Page - Functionality Test', () => {
  const baseURL = 'https://www.fortheorlingas.com';
  const loginURL = `${baseURL}/login`;

  test.beforeEach(async ({ page }) => {
    await page.goto(loginURL);
    await page.waitForLoadState('networkidle');
  });

  test('Complete Login Form Analysis', async ({ page }) => {
    console.log('🔍 Complete login form analysis...');

    // 기본 정보 확인
    const title = await page.title();
    const url = page.url();
    console.log(`📄 Page: "${title}" at ${url}`);

    // 정확한 버튼 찾기 (first()를 사용해서 충돌 방지)
    const formElements = {
      emailInput: page.locator('input[type="email"]').first(),
      passwordInput: page.locator('input[type="password"]').first(),
      submitButton: page.locator('button[type="submit"]').first(),
      googleButton: page.getByRole('button', { name: 'Google로 로그인' }),
      kakaoButton: page.getByRole('button', { name: /카카오.*로그인/ }),
      signupButton: page.getByRole('button', { name: '회원가입' })
    };

    // 각 요소 상태 확인
    for (const [name, locator] of Object.entries(formElements)) {
      try {
        const isVisible = await locator.isVisible();
        const isEnabled = await locator.isEnabled();

        if (isVisible) {
          console.log(`✅ ${name}: Visible and ${isEnabled ? 'Enabled' : 'Disabled'}`);
        } else {
          console.log(`❌ ${name}: Not visible`);
        }
      } catch (error) {
        console.log(`⚠️ ${name}: Error checking - ${error}`);
      }
    }
  });

  test('Button Click Testing', async ({ page }) => {
    console.log('🔘 Testing button click behaviors...');

    // 각 버튼 클릭 테스트
    const buttons = [
      { locator: page.getByRole('button', { name: 'Google로 로그인' }), name: 'Google 로그인' },
      { locator: page.getByRole('button', { name: '회원가입' }), name: '회원가입' },
      { locator: page.getByRole('button', { name: /카카오.*로그인/ }), name: '카카오 로그인' }
    ];

    for (const button of buttons) {
      try {
        const isVisible = await button.locator.isVisible();
        const isEnabled = await button.locator.isEnabled();

        if (isVisible && isEnabled) {
          console.log(`🔘 Testing ${button.name}...`);

          const urlBefore = page.url();

          // 버튼 클릭
          await button.locator.click({ timeout: 5000 });
          await page.waitForTimeout(2000); // 네비게이션이나 팝업 대기

          const urlAfter = page.url();

          if (urlBefore !== urlAfter) {
            console.log(`   └─ ✅ ${button.name}: Navigated to ${urlAfter}`);

            // 원래 페이지로 돌아가기
            await page.goto(loginURL);
            await page.waitForLoadState('networkidle');
          } else {
            console.log(`   └─ ℹ️ ${button.name}: No navigation (popup or same page action)`);
          }
        } else {
          console.log(`   └─ ⚠️ ${button.name}: ${!isVisible ? 'Not visible' : 'Disabled'}`);
        }
      } catch (error) {
        console.log(`   └─ ❌ ${button.name}: Error - ${error}`);
      }
    }
  });

  test('Form Validation Test', async ({ page }) => {
    console.log('📝 Testing form validation...');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    // 1. 빈 폼 제출
    console.log('🔍 Testing empty form submission...');

    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // HTML5 validation message 확인
      const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);

      if (emailValidation) {
        console.log(`✅ Email validation: "${emailValidation}"`);
      }
      if (passwordValidation) {
        console.log(`✅ Password validation: "${passwordValidation}"`);
      }

      // 페이지의 에러 메시지 확인
      const errorElements = page.locator('.error, .alert, [role="alert"], .text-red-500');
      const errorCount = await errorElements.count();

      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorElements.nth(i).textContent();
          if (errorText?.trim()) {
            console.log(`✅ Error message ${i + 1}: "${errorText.trim()}"`);
          }
        }
      } else {
        console.log('ℹ️ No visible error messages found');
      }
    }

    // 2. 잘못된 이메일 형식 테스트
    console.log('📧 Testing invalid email format...');

    await emailInput.fill('invalid-email');
    await passwordInput.fill('somepassword');

    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      if (emailValidation) {
        console.log(`✅ Invalid email validation: "${emailValidation}"`);
      }
    }

    // 3. 올바른 형식이지만 존재하지 않는 계정 테스트
    console.log('🔐 Testing non-existent account...');

    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('wrongpassword');

    if (await submitButton.isVisible()) {
      const urlBefore = page.url();

      await submitButton.click();
      await page.waitForTimeout(3000); // 서버 응답 대기

      const urlAfter = page.url();

      if (urlBefore === urlAfter) {
        console.log('✅ Form submission handled (stayed on login page - expected for invalid credentials)');

        // 에러 메시지 찾기
        const authErrorElements = page.locator('.error, .alert, [role="alert"], .text-red-500, .text-danger');
        const authErrorCount = await authErrorElements.count();

        if (authErrorCount > 0) {
          for (let i = 0; i < authErrorCount; i++) {
            const errorText = await authErrorElements.nth(i).textContent();
            if (errorText?.trim() && errorText.length > 5) { // 의미있는 에러만
              console.log(`✅ Auth error ${i + 1}: "${errorText.trim()}"`);
            }
          }
        } else {
          console.log('ℹ️ No authentication error messages visible');
        }
      } else {
        console.log(`⚠️ Unexpected navigation to: ${urlAfter}`);
      }
    }
  });

  test('Social Login Detailed Analysis', async ({ page }) => {
    console.log('🌐 Social login detailed analysis...');

    // Google 로그인 버튼 자세한 분석
    const googleButton = page.getByRole('button', { name: 'Google로 로그인' });

    if (await googleButton.isVisible()) {
      console.log('✅ Google 로그인 버튼 발견');

      // 버튼의 속성들 확인
      const buttonText = await googleButton.textContent();
      const isEnabled = await googleButton.isEnabled();
      const className = await googleButton.getAttribute('class');

      console.log(`   └─ 텍스트: "${buttonText}"`);
      console.log(`   └─ 활성화: ${isEnabled}`);
      console.log(`   └─ 클래스: ${className}`);

      if (isEnabled) {
        console.log('🔘 Google 로그인 버튼 클릭 테스트...');

        try {
          // 새 탭/팝업이 열릴 수 있으므로 준비
          const [popup] = await Promise.all([
            page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
            googleButton.click()
          ]);

          if (popup) {
            const popupUrl = popup.url();
            console.log(`✅ Google OAuth 팝업 열림: ${popupUrl}`);

            // 팝업 닫기
            await popup.close();
          } else {
            console.log('ℹ️ 팝업이 열리지 않음 (같은 탭에서 리다이렉션일 수도)');

            // URL 변화 확인
            await page.waitForTimeout(2000);
            const currentUrl = page.url();

            if (currentUrl !== loginURL) {
              console.log(`✅ 페이지 리다이렉션됨: ${currentUrl}`);

              // 다시 로그인 페이지로
              await page.goto(loginURL);
            }
          }
        } catch (error) {
          console.log(`⚠️ Google 로그인 테스트 중 오류: ${error}`);
        }
      }
    }

    // 카카오 로그인 버튼 분석
    const kakaoButton = page.getByRole('button', { name: /카카오.*로그인/ });

    if (await kakaoButton.isVisible()) {
      const isEnabled = await kakaoButton.isEnabled();
      const buttonText = await kakaoButton.textContent();

      console.log(`✅ 카카오 로그인 버튼: "${buttonText}" (${isEnabled ? '활성화' : '비활성화'})`);

      if (!isEnabled) {
        console.log('   └─ ℹ️ 카카오 로그인은 현재 준비 중인 것으로 보임');
      }
    }
  });

  test('Accessibility and User Experience', async ({ page }) => {
    console.log('♿ 접근성 및 사용자 경험 테스트...');

    // 키보드 네비게이션 테스트
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    console.log('⌨️ 키보드 네비게이션 테스트...');

    // 이메일 필드로 포커스
    await emailInput.focus();

    // Tab으로 다음 필드들로 이동
    await page.keyboard.press('Tab');
    const focusedElement1 = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`   └─ Tab 1: ${focusedElement1}`);

    await page.keyboard.press('Tab');
    const focusedElement2 = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`   └─ Tab 2: ${focusedElement2}`);

    // Enter 키로 폼 제출 테스트
    await emailInput.focus();
    await emailInput.fill('test@example.com');
    await page.keyboard.press('Tab');
    await passwordInput.fill('password123');

    console.log('⏎ Enter 키로 폼 제출 테스트...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const urlAfterEnter = page.url();
    if (urlAfterEnter === loginURL) {
      console.log('✅ Enter 키로 폼 제출 가능 (검증 오류로 인해 같은 페이지 유지)');
    } else {
      console.log(`⚠️ Enter 키로 다른 페이지로 이동: ${urlAfterEnter}`);
    }

    // 폼 라벨 확인
    const labels = page.locator('label');
    const labelCount = await labels.count();
    console.log(`🏷️ 폼 라벨 ${labelCount}개 발견`);

    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      const labelText = await label.textContent();
      const forAttribute = await label.getAttribute('for');

      console.log(`   └─ 라벨 ${i + 1}: "${labelText}" (for="${forAttribute}")`);
    }

    // 필수 필드 표시 확인
    const requiredFields = page.locator('input[required]');
    const requiredCount = await requiredFields.count();
    console.log(`⚠️ 필수 필드 ${requiredCount}개`);

    // 플레이스홀더 텍스트 확인
    const emailPlaceholder = await emailInput.getAttribute('placeholder');
    const passwordPlaceholder = await passwordInput.getAttribute('placeholder');

    console.log(`📝 이메일 플레이스홀더: "${emailPlaceholder}"`);
    console.log(`📝 비밀번호 플레이스홀더: "${passwordPlaceholder}"`);
  });

  test('Mobile Experience Test', async ({ page }) => {
    console.log('📱 모바일 경험 테스트...');

    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 모든 요소가 모바일에서 제대로 보이는지 확인
    const mobileElements = [
      { locator: page.locator('input[type="email"]').first(), name: '이메일 입력' },
      { locator: page.locator('input[type="password"]').first(), name: '비밀번호 입력' },
      { locator: page.locator('button[type="submit"]').first(), name: '로그인 버튼' },
      { locator: page.getByRole('button', { name: 'Google로 로그인' }), name: 'Google 로그인' },
      { locator: page.getByRole('button', { name: '회원가입' }), name: '회원가입' }
    ];

    for (const element of mobileElements) {
      const isVisible = await element.locator.isVisible();

      if (isVisible) {
        const box = await element.locator.boundingBox();
        const touchFriendly = box && box.height >= 44 && box.width >= 44;

        console.log(`📱 ${element.name}: ✅ 보임 ${box ? `(${Math.round(box.width)}x${Math.round(box.height)}px)` : ''} ${touchFriendly ? '👆 터치 친화적' : '⚠️ 터치하기 작음'}`);
      } else {
        console.log(`📱 ${element.name}: ❌ 안보임`);
      }
    }

    // 모바일에서 입력 테스트
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      console.log('📝 모바일 입력 테스트...');

      await emailInput.tap();
      await emailInput.fill('mobile@test.com');

      await passwordInput.tap();
      await passwordInput.fill('mobilepassword');

      const emailValue = await emailInput.inputValue();
      const passwordLength = (await passwordInput.inputValue()).length;

      console.log(`✅ 모바일 입력 성공: 이메일="${emailValue}", 비밀번호 길이=${passwordLength}`);
    }
  });
});