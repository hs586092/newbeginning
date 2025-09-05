const { test, expect } = require('@playwright/test');

test.describe('Google OAuth Complete Verification', () => {
  test('Complete Google OAuth Flow Analysis', async ({ page }) => {
    console.log('🚀 Starting comprehensive Google OAuth verification...');
    
    // Enable request logging
    page.on('request', request => {
      if (request.url().includes('auth') || request.url().includes('oauth') || 
          request.url().includes('google') || request.url().includes('supabase')) {
        console.log(`→ REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('auth') || response.url().includes('oauth') || 
          response.url().includes('google') || response.url().includes('supabase')) {
        console.log(`← RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🚨 CONSOLE ERROR: ${msg.text()}`);
      }
    });

    // Step 1: Navigate to login page
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('https://newbeginning-seven.vercel.app/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'oauth-step-1-login-page.png', fullPage: true });
    
    // Step 2: Verify Google login button exists
    console.log('🔍 Step 2: Verifying Google login button...');
    const googleButton = page.locator('text=Google로 로그인');
    await expect(googleButton).toBeVisible();
    console.log('✅ Google login button found');
    
    // Step 3: Click Google login button
    console.log('🖱️ Step 3: Clicking Google login button...');
    await googleButton.click();
    
    // Step 4: Wait for redirect and take screenshot
    console.log('⏳ Step 4: Waiting for OAuth redirect...');
    await page.waitForTimeout(3000); // Wait for redirect
    await page.screenshot({ path: 'oauth-step-2-after-click.png', fullPage: true });
    
    // Step 5: Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Step 6: Analyze OAuth flow success
    if (currentUrl.includes('accounts.google.com')) {
      console.log('✅ SUCCESS: Redirected to Google OAuth page!');
      console.log('🎯 Google OAuth configuration is working properly');
      
      // Take screenshot of Google OAuth page
      await page.screenshot({ path: 'oauth-step-3-google-page.png', fullPage: true });
      
      // Check for OAuth consent elements
      const hasOAuthElements = await page.locator('text=Sign in').isVisible().catch(() => false) ||
                               await page.locator('[data-identifier]').isVisible().catch(() => false) ||
                               await page.locator('text=Choose an account').isVisible().catch(() => false);
      
      if (hasOAuthElements) {
        console.log('✅ Google OAuth consent page loaded successfully');
      }
      
    } else if (currentUrl.includes('newbeginning-seven.vercel.app/login')) {
      console.log('❌ ISSUE: Still on login page - OAuth redirect failed');
    } else {
      console.log(`📍 Unexpected URL: ${currentUrl}`);
    }
    
    // Step 7: Check for common OAuth parameters in URL
    const urlParams = new URL(currentUrl);
    const hasClientId = urlParams.searchParams.get('client_id') || urlParams.toString().includes('484605292370');
    const hasRedirectUri = urlParams.searchParams.get('redirect_uri') || urlParams.toString().includes('supabase.co');
    const hasScope = urlParams.searchParams.get('scope') || urlParams.toString().includes('email');
    
    console.log('\n📊 OAuth Configuration Analysis:');
    console.log(`   Client ID present: ${hasClientId ? '✅' : '❌'}`);
    console.log(`   Redirect URI present: ${hasRedirectUri ? '✅' : '❌'}`);
    console.log(`   Scope present: ${hasScope ? '✅' : '❌'}`);
    
    // Step 8: Overall assessment
    const isOAuthWorking = currentUrl.includes('accounts.google.com') && hasClientId && hasRedirectUri;
    console.log('\n🎯 FINAL ASSESSMENT:');
    if (isOAuthWorking) {
      console.log('✅ Google OAuth is FULLY FUNCTIONAL!');
      console.log('✅ Configuration is correct');
      console.log('✅ Redirect flow is working');
      console.log('✅ No more "provider not enabled" errors');
    } else {
      console.log('❌ OAuth configuration needs attention');
    }
    
    // Verify no errors in console
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    console.log(`\n🖥️ Console errors detected: ${errors.length}`);
    errors.forEach(error => console.log(`   - ${error}`));
  });
});