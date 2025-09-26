import { test, expect } from '@playwright/test';

test.describe('Login Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console logging to capture debug messages
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Listen for network errors
    page.on('requestfailed', request => {
      console.log(`[NETWORK ERROR] ${request.url()}: ${request.failure()?.errorText}`);
    });
  });

  test('should load homepage without errors', async ({ page }) => {
    console.log('🏠 Testing homepage...');
    await page.goto('https://fortheorlingas.com');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Take screenshot
    await page.screenshot({ path: 'homepage.png' });

    // Basic checks
    expect(title).toBeTruthy();
  });

  test('should load login page and check for infinite loading', async ({ page }) => {
    console.log('🔐 Testing login page...');

    await page.goto('https://fortheorlingas.com/auth/login');
    await page.waitForLoadState('networkidle');

    // Check if login form exists
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();

    // Check for email and password fields
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Check if button is not in loading state initially
    const buttonText = await loginButton.textContent();
    console.log(`🔘 Login button text: ${buttonText}`);
    expect(buttonText).not.toContain('로딩');
    expect(buttonText).not.toContain('loading');

    // Take screenshot
    await page.screenshot({ path: 'login-page.png' });
  });

  test('should test login button interaction without infinite loading', async ({ page }) => {
    console.log('🧪 Testing login button behavior...');

    await page.goto('https://fortheorlingas.com/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill form with test data (invalid credentials to avoid actual login)
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    await emailField.fill('test@example.com');
    await passwordField.fill('testpassword');

    // Monitor button state changes
    const initialButtonText = await loginButton.textContent();
    console.log(`🔘 Initial button text: ${initialButtonText}`);

    // Click login button
    await loginButton.click();

    // Wait a moment and check if button shows loading state
    await page.waitForTimeout(1000);
    const loadingButtonText = await loginButton.textContent();
    console.log(`⏳ Button text during loading: ${loadingButtonText}`);

    // Wait up to 10 seconds for loading to complete or error to appear
    const maxWaitTime = 10000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const currentButtonText = await loginButton.textContent();
      const isLoading = currentButtonText?.includes('로딩') || currentButtonText?.includes('loading') || await loginButton.isDisabled();

      if (!isLoading) {
        console.log(`✅ Loading completed in ${Date.now() - startTime}ms`);
        break;
      }

      await page.waitForTimeout(500);
    }

    // Final check - button should not be stuck in loading state
    const finalButtonText = await loginButton.textContent();
    const isStillLoading = finalButtonText?.includes('로딩') || finalButtonText?.includes('loading');
    const isStillDisabled = await loginButton.isDisabled();

    console.log(`🔍 Final button text: ${finalButtonText}`);
    console.log(`🔍 Still disabled: ${isStillDisabled}`);

    // Take screenshot of final state
    await page.screenshot({ path: 'login-after-click.png' });

    // Assert no infinite loading
    expect(isStillLoading).toBeFalsy();
    if (isStillDisabled) {
      // If still disabled, there might be an error message
      const errorMessage = page.locator('.text-red-700');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      console.log('✅ Button disabled due to error message (expected behavior)');
    }
  });

  test('should test Google login button', async ({ page }) => {
    console.log('🌐 Testing Google login button...');

    await page.goto('https://fortheorlingas.com/auth/login');
    await page.waitForLoadState('networkidle');

    // Find Google login button
    const googleButton = page.locator('button:has-text("Google로 로그인")');
    await expect(googleButton).toBeVisible();

    // Check initial state
    const initialText = await googleButton.textContent();
    console.log(`🔘 Google button text: ${initialText}`);

    // Note: We won't actually click this as it would redirect to Google
    // Just verify it's present and functional
    expect(initialText).toContain('Google');

    await page.screenshot({ path: 'google-login-button.png' });
  });

  test('should test signup page', async ({ page }) => {
    console.log('📝 Testing signup page...');

    await page.goto('https://fortheorlingas.com/auth/signup');
    await page.waitForLoadState('networkidle');

    // Check form elements
    const nameField = page.locator('input[id="fullName"]');
    const usernameField = page.locator('input[id="username"]');
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[id="password"]');
    const confirmPasswordField = page.locator('input[id="confirmPassword"]');
    const signupButton = page.locator('button[type="submit"]');

    await expect(nameField).toBeVisible();
    await expect(usernameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(confirmPasswordField).toBeVisible();
    await expect(signupButton).toBeVisible();

    const buttonText = await signupButton.textContent();
    console.log(`🔘 Signup button text: ${buttonText}`);

    await page.screenshot({ path: 'signup-page.png' });
  });

  test('should check for console errors and warnings', async ({ page }) => {
    console.log('🔍 Checking for console errors...');

    const errors = [];
    const warnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('https://fortheorlingas.com/auth/login');
    await page.waitForLoadState('networkidle');

    // Wait a bit more for any delayed console messages
    await page.waitForTimeout(3000);

    console.log(`❌ Console errors (${errors.length}):`, errors);
    console.log(`⚠️ Console warnings (${warnings.length}):`, warnings);

    // Filter out common non-critical warnings
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('ServiceWorker')
    );

    console.log(`🚨 Critical errors: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      console.log('Critical errors:', criticalErrors);
    }
  });
});