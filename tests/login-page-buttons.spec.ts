import { test, expect } from '@playwright/test';

test.describe('Login Page - Button Tests', () => {
  const baseURL = 'https://www.fortheorlingas.com';
  const loginURL = `${baseURL}/login`;

  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 직접 이동
    await page.goto(loginURL);
    await page.waitForLoadState('networkidle');
  });

  test('Login Page Loading and Basic Elements', async ({ page }) => {
    console.log('🔍 Testing login page basic elements...');

    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);

    // URL 확인
    const currentURL = page.url();
    console.log(`🌐 Current URL: ${currentURL}`);
    expect(currentURL).toContain('/login');

    // 로그인 폼 요소들 확인
    const formElements = [
      { selector: 'input[type="email"]', name: '이메일 입력 필드' },
      { selector: 'input[type="password"]', name: '비밀번호 입력 필드' },
      { selector: 'input[name="email"]', name: '이메일 필드 (name 속성)' },
      { selector: 'input[name="password"]', name: '비밀번호 필드 (name 속성)' },
      { selector: 'button[type="submit"]', name: '로그인 제출 버튼' },
      { selector: 'button:has-text("로그인")', name: '로그인 버튼 (텍스트)' },
      { selector: 'form', name: '로그인 폼' }
    ];

    for (const element of formElements) {
      const locator = page.locator(element.selector);
      const isVisible = await locator.isVisible();
      const count = await locator.count();

      if (isVisible && count > 0) {
        console.log(`✅ ${element.name} is visible (${count} found)`);
      } else {
        console.log(`❌ ${element.name} not found`);
      }
    }
  });

  test('Login Form Interactive Elements', async ({ page }) => {
    console.log('🔍 Testing login form interactive elements...');

    // 모든 input 필드 확인
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`📊 Found ${inputCount} input fields`);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const isVisible = await input.isVisible();
      const isEnabled = await input.isEnabled();

      if (isVisible) {
        console.log(`📝 Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}", enabled=${isEnabled}`);
      }
    }

    // 모든 버튼 확인
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`📊 Found ${buttonCount} buttons`);

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();

      if (isVisible) {
        console.log(`🔘 Button ${i + 1}: "${text?.trim()}", type="${type}", enabled=${isEnabled}`);
      }
    }
  });

  test('Social Login Buttons', async ({ page }) => {
    console.log('🔍 Testing social login buttons...');

    const socialButtons = [
      { text: 'Google', name: 'Google 로그인' },
      { text: 'GitHub', name: 'GitHub 로그인' },
      { text: 'Facebook', name: 'Facebook 로그인' },
      { text: 'Kakao', name: 'Kakao 로그인' },
      { text: 'Naver', name: 'Naver 로그인' },
      { text: '구글', name: '구글 로그인' },
      { text: '카카오', name: '카카오 로그인' },
      { text: '네이버', name: '네이버 로그인' }
    ];

    for (const social of socialButtons) {
      const button = page.locator(`button:has-text("${social.text}")`);
      const isVisible = await button.isVisible();

      if (isVisible) {
        const isEnabled = await button.isEnabled();
        console.log(`✅ ${social.name} button found - ${isEnabled ? 'Enabled' : 'Disabled'}`);

        // 버튼의 href나 onclick 속성도 확인
        const onClick = await button.getAttribute('onclick');
        const href = await button.getAttribute('href');

        if (onClick) {
          console.log(`   └─ onClick: ${onClick}`);
        }
        if (href) {
          console.log(`   └─ href: ${href}`);
        }
      } else {
        console.log(`❌ ${social.name} button not found`);
      }
    }
  });

  test('Navigation and Additional Links', async ({ page }) => {
    console.log('🔍 Testing navigation and additional links...');

    const navigationLinks = [
      { text: '회원가입', href: '/signup' },
      { text: '비밀번호 찾기', href: '/forgot-password' },
      { text: '홈으로', href: '/' },
      { text: '뒤로가기', href: 'javascript:history.back()' },
      { text: '처음 방문이세요?', href: '/signup' },
      { text: '비밀번호를 잊으셨나요?', href: '/forgot-password' }
    ];

    for (const link of navigationLinks) {
      const linkElement = page.locator(`a:has-text("${link.text}")`).or(
        page.locator(`button:has-text("${link.text}")`)
      );

      const isVisible = await linkElement.isVisible();

      if (isVisible) {
        const href = await linkElement.getAttribute('href');
        const isEnabled = await linkElement.isEnabled();
        console.log(`✅ "${link.text}" link found - ${isEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   └─ href: ${href}`);
      } else {
        console.log(`❌ "${link.text}" link not found`);
      }
    }
  });

  test('Form Validation and Submission', async ({ page }) => {
    console.log('🔍 Testing form validation and submission...');

    // 폼 찾기
    const form = page.locator('form');
    const formExists = await form.isVisible();

    if (formExists) {
      console.log('✅ Login form found');

      // 빈 폼 제출 테스트 (유효성 검사 확인)
      const submitButton = page.locator('button[type="submit"]').or(
        page.locator('button:has-text("로그인")')
      );

      if (await submitButton.isVisible()) {
        console.log('🔘 Testing empty form submission...');

        await submitButton.click();
        await page.waitForTimeout(1000);

        // 유효성 검사 메시지나 에러 확인
        const errorMessages = page.locator('.error, .alert, [role="alert"]');
        const errorCount = await errorMessages.count();

        if (errorCount > 0) {
          console.log(`✅ Form validation working - ${errorCount} error messages found`);

          for (let i = 0; i < errorCount; i++) {
            const errorText = await errorMessages.nth(i).textContent();
            console.log(`   └─ Error ${i + 1}: "${errorText?.trim()}"`);
          }
        } else {
          console.log('ℹ️ No validation errors displayed (or different error handling)');
        }

        // HTML5 유효성 검사도 확인
        const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
        if (await emailInput.isVisible()) {
          const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
          if (validationMessage) {
            console.log(`✅ HTML5 validation: "${validationMessage}"`);
          }
        }
      }
    } else {
      console.log('❌ No login form found');
    }
  });

  test('Test with Valid Email Format', async ({ page }) => {
    console.log('🔍 Testing with valid email format...');

    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));

    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      console.log('📝 Filling form with test data...');

      // 테스트 데이터 입력
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword123');

      // 입력된 값 확인
      const emailValue = await emailInput.inputValue();
      const passwordValue = await passwordInput.inputValue();

      console.log(`✅ Email filled: "${emailValue}"`);
      console.log(`✅ Password filled: ${passwordValue ? '***' + passwordValue.slice(-3) : 'empty'}`);

      // 제출 버튼 클릭 (실제 제출은 하지 않고 상태만 확인)
      const submitButton = page.locator('button[type="submit"]').or(
        page.locator('button:has-text("로그인")')
      );

      if (await submitButton.isVisible()) {
        const isEnabled = await submitButton.isEnabled();
        console.log(`🔘 Submit button enabled after input: ${isEnabled}`);

        // 실제 제출은 테스트 환경에서만 (실제 계정이 없으므로)
        console.log('ℹ️ Skipping actual form submission (no test account)');
      }
    } else {
      console.log('❌ Email or password input not found');
    }
  });

  test('Accessibility and ARIA Labels', async ({ page }) => {
    console.log('🔍 Testing accessibility features...');

    // ARIA labels과 접근성 속성들 확인
    const accessibilityElements = [
      { selector: 'input[aria-label]', name: 'Inputs with ARIA labels' },
      { selector: 'button[aria-label]', name: 'Buttons with ARIA labels' },
      { selector: 'label', name: 'Form labels' },
      { selector: '[role="alert"]', name: 'Alert roles' },
      { selector: '[role="button"]', name: 'Button roles' },
      { selector: 'input[required]', name: 'Required fields' }
    ];

    for (const element of accessibilityElements) {
      const locator = page.locator(element.selector);
      const count = await locator.count();

      if (count > 0) {
        console.log(`✅ ${element.name}: ${count} found`);

        // 첫 번째 요소의 상세 정보
        const firstElement = locator.first();
        const ariaLabel = await firstElement.getAttribute('aria-label');
        const role = await firstElement.getAttribute('role');

        if (ariaLabel) {
          console.log(`   └─ First ARIA label: "${ariaLabel}"`);
        }
        if (role) {
          console.log(`   └─ First role: "${role}"`);
        }
      } else {
        console.log(`❌ ${element.name}: none found`);
      }
    }

    // 키보드 네비게이션 테스트
    const focusableElements = page.locator('input, button, a, [tabindex]');
    const focusableCount = await focusableElements.count();
    console.log(`⌨️ Found ${focusableCount} focusable elements`);

    if (focusableCount > 0) {
      console.log('⌨️ Testing keyboard navigation...');

      // Tab 키를 여러 번 눌러서 포커스 이동 확인
      for (let i = 0; i < Math.min(focusableCount, 5); i++) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate((el: Element) => el.tagName.toLowerCase()).catch(() => 'unknown');
        console.log(`   └─ Tab ${i + 1}: Focused on ${tagName}`);
      }
    }
  });

  test('Mobile Login Page Responsiveness', async ({ page }) => {
    console.log('🔍 Testing mobile responsiveness...');

    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 모바일에서 요소들이 제대로 보이는지 확인
    const mobileElements = [
      'form',
      'input[type="email"], input[name="email"]',
      'input[type="password"], input[name="password"]',
      'button[type="submit"], button:has-text("로그인")'
    ];

    for (const selector of mobileElements) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible();
      const count = await element.count();

      console.log(`📱 Mobile - ${selector}: ${isVisible ? `✅ Visible (${count})` : '❌ Not visible'}`);
    }

    // 모바일에서 버튼 크기 확인 (터치 친화적인지)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          const touchFriendly = box.height >= 44 && box.width >= 44; // 44px는 최소 터치 영역
          const text = await button.textContent();
          console.log(`📱 Button "${text?.trim()}": ${box.width}x${box.height}px ${touchFriendly ? '✅ Touch-friendly' : '⚠️ Too small'}`);
        }
      }
    }
  });
});