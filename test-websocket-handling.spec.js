import { test, expect } from '@playwright/test';

test.describe('WebSocket Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    const consoleMessages = [];
    const errorMessages = [];

    // Capture console messages
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      if (msg.type() === 'error') {
        errorMessages.push(msg.text());
      }
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Store messages for later analysis
    page.consoleMessages = consoleMessages;
    page.errorMessages = errorMessages;
  });

  test('should handle WebSocket connection failures gracefully', async ({ page }) => {
    console.log('🔍 Testing WebSocket error handling...');

    // Navigate to the site and wait for loading
    await page.goto('https://www.fortheorlingas.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for any realtime connections to attempt
    await page.waitForTimeout(5000);

    // Check console messages
    const consoleMessages = page.consoleMessages || [];
    const errorMessages = page.errorMessages || [];

    console.log(`📊 Total console messages: ${consoleMessages.length}`);
    console.log(`❌ Error messages: ${errorMessages.length}`);

    // Look for our graceful degradation messages
    const gracefulMessages = consoleMessages.filter(msg =>
      msg.includes('User not authenticated, skipping realtime subscriptions') ||
      msg.includes('gracefully degrading') ||
      msg.includes('WebSocket failed') ||
      msg.includes('RealtimeConnectionManager')
    );

    console.log(`✅ Graceful degradation messages: ${gracefulMessages.length}`);
    gracefulMessages.forEach(msg => console.log(`  - ${msg}`));

    // Look for WebSocket connection failures
    const webSocketErrors = errorMessages.filter(msg =>
      msg.includes('WebSocket connection') ||
      msg.includes('wss://') ||
      msg.includes('connection failed')
    );

    console.log(`🔌 WebSocket error messages: ${webSocketErrors.length}`);
    webSocketErrors.forEach(msg => console.log(`  - ${msg.substring(0, 100)}...`));

    // Check if the app is still functional despite WebSocket errors
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Verify app functionality
    expect(title).toBe('첫돌까지 - 육아맘 커뮤니티');

    // Check if auth gate is working
    const authMessage = page.locator('text=인증 상태 확인 중');
    await expect(authMessage).toBeVisible({ timeout: 10000 });

    console.log(`✅ App remains functional despite ${webSocketErrors.length} WebSocket errors`);

    // Take screenshot for analysis
    await page.screenshot({ path: 'websocket-error-handling.png' });
  });

  test('should verify graceful degradation in realtime features', async ({ page }) => {
    console.log('🔄 Testing realtime feature graceful degradation...');

    // Navigate to login page (which might use realtime features)
    await page.goto('https://www.fortheorlingas.com/auth/login', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Wait for any realtime subscriptions to attempt
    await page.waitForTimeout(3000);

    const consoleMessages = page.consoleMessages || [];

    // Look for authentication-related realtime messages
    const authRealtimeMessages = consoleMessages.filter(msg =>
      msg.includes('User not authenticated') ||
      msg.includes('skipping realtime subscriptions') ||
      msg.includes('Auth state change') ||
      msg.includes('INITIAL_SESSION')
    );

    console.log(`🔐 Auth realtime messages: ${authRealtimeMessages.length}`);
    authRealtimeMessages.forEach(msg => console.log(`  - ${msg}`));

    // Verify login form is still functional
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();

    console.log('✅ Login form functional despite realtime connection issues');

    // Take screenshot
    await page.screenshot({ path: 'login-graceful-degradation.png' });
  });

  test('should verify error messages are user-friendly', async ({ page }) => {
    console.log('👥 Testing user-facing error messages...');

    await page.goto('https://www.fortheorlingas.com', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    // Check if there are any visible error messages to users
    const errorElements = await page.locator('.text-red-500, .text-red-700, .bg-red-50, .border-red-200, [class*="error"]').count();

    console.log(`🚨 Visible error elements: ${errorElements}`);

    // Check for technical error messages that shouldn't be visible to users
    const bodyText = await page.locator('body').textContent();

    const technicalErrors = [
      'WebSocket connection',
      'wss://',
      'connection failed',
      'createWebSocket',
      'realtime/v1/websocket'
    ];

    const visibleTechnicalErrors = technicalErrors.filter(error =>
      bodyText?.toLowerCase().includes(error.toLowerCase())
    );

    console.log(`🔧 Visible technical errors: ${visibleTechnicalErrors.length}`);
    if (visibleTechnicalErrors.length > 0) {
      console.log('Technical errors visible to users:', visibleTechnicalErrors);
    }

    // App should work without showing technical WebSocket errors to users
    expect(visibleTechnicalErrors.length).toBe(0);

    console.log('✅ No technical WebSocket errors visible to users');
  });
});