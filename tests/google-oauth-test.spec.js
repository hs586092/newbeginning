const { test, expect } = require('@playwright/test');

test.describe('Google OAuth Authentication Tests', () => {
  test('Google OAuth Login Flow Analysis', async ({ page }) => {
    console.log('🚀 Starting Google OAuth authentication test...');
    
    // Enable network monitoring
    const networkRequests = [];
    const networkResponses = [];
    const consoleMessages = [];
    
    // Capture network requests
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
      console.log(`→ REQUEST: ${request.method()} ${request.url()}`);
    });
    
    // Capture network responses
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      });
      if (response.status() >= 400) {
        console.log(`❌ ERROR RESPONSE: ${response.status()} ${response.url()}`);
      }
    });
    
    // Capture console messages
    page.on('console', msg => {
      const message = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(message);
      console.log(`🖥️ CONSOLE: ${message}`);
    });
    
    // Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'test-results/01-login-page.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot taken: 01-login-page.png');
    
    // Wait for and verify Google login button exists
    console.log('🔍 Looking for Google login button...');
    const googleLoginButton = page.locator('text=Google로 로그인').or(
      page.locator('[data-testid="google-login"]')).or(
      page.locator('button:has-text("Google")')
    ).first();
    
    await expect(googleLoginButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Google login button found and visible');
    
    // Take screenshot before clicking
    await page.screenshot({ 
      path: 'test-results/02-before-google-click.png', 
      fullPage: true 
    });
    
    // Click Google login button and monitor what happens
    console.log('🖱️ Clicking Google login button...');
    
    // Set up promise to catch any popup or redirect
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 10000 }).catch(() => null),
      googleLoginButton.click()
    ]);
    
    // Wait a moment for any redirects or changes
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking
    await page.screenshot({ 
      path: 'test-results/03-after-google-click.png', 
      fullPage: true 
    });
    
    // Check if we got a popup (OAuth window)
    if (popup) {
      console.log('🪟 OAuth popup detected!');
      console.log(`📍 Popup URL: ${popup.url()}`);
      
      // Take screenshot of popup
      await popup.screenshot({ 
        path: 'test-results/04-oauth-popup.png', 
        fullPage: true 
      });
      
      // Wait for OAuth flow
      await popup.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('⏰ Popup load timeout - continuing...');
      });
      
      // Check if it's Google's OAuth page
      const popupUrl = popup.url();
      if (popupUrl.includes('accounts.google.com') || popupUrl.includes('oauth')) {
        console.log('✅ Successfully redirected to Google OAuth!');
      } else {
        console.log(`❌ Unexpected popup URL: ${popupUrl}`);
      }
      
      popup.close();
    } else {
      console.log('❌ No OAuth popup detected');
      
      // Check if page redirected instead
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('accounts.google.com') || currentUrl.includes('oauth')) {
        console.log('✅ Page redirected to Google OAuth!');
        await page.screenshot({ 
          path: 'test-results/04-oauth-redirect.png', 
          fullPage: true 
        });
      } else {
        console.log('❌ No redirect to Google OAuth detected');
        
        // Check for error messages on page
        const errorElements = await page.locator('text=/error|Error|ERROR|fail|Fail|FAIL/i').all();
        if (errorElements.length > 0) {
          console.log('⚠️ Error messages found on page:');
          for (const element of errorElements) {
            const text = await element.textContent();
            console.log(`   - ${text}`);
          }
        }
      }
    }
    
    // Analyze network requests for OAuth-related traffic
    console.log('\n📡 Network Analysis:');
    
    const oauthRequests = networkRequests.filter(req => 
      req.url.includes('oauth') || 
      req.url.includes('auth') || 
      req.url.includes('google') ||
      req.url.includes('supabase')
    );
    
    console.log(`🔗 Found ${oauthRequests.length} auth-related requests:`);
    oauthRequests.forEach(req => {
      console.log(`   ${req.method} ${req.url}`);
    });
    
    const errorResponses = networkResponses.filter(resp => resp.status >= 400);
    if (errorResponses.length > 0) {
      console.log(`\n❌ Found ${errorResponses.length} error responses:`);
      errorResponses.forEach(resp => {
        console.log(`   ${resp.status} ${resp.url}`);
      });
    }
    
    // Check console for authentication errors
    const authErrors = consoleMessages.filter(msg => 
      msg.toLowerCase().includes('auth') || 
      msg.toLowerCase().includes('oauth') ||
      msg.toLowerCase().includes('error') ||
      msg.toLowerCase().includes('provider')
    );
    
    if (authErrors.length > 0) {
      console.log('\n🖥️ Authentication-related console messages:');
      authErrors.forEach(msg => console.log(`   ${msg}`));
    }
    
    // Final analysis
    console.log('\n📊 OAuth Analysis Summary:');
    console.log(`   - Login page loads: ✅`);
    console.log(`   - Google button visible: ✅`);
    console.log(`   - OAuth popup/redirect: ${popup ? '✅' : '❌'}`);
    console.log(`   - Auth requests made: ${oauthRequests.length > 0 ? '✅' : '❌'}`);
    console.log(`   - Error responses: ${errorResponses.length === 0 ? '✅' : '❌'}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/05-final-state.png', 
      fullPage: true 
    });
    
    console.log('🎯 Google OAuth test completed!');
  });
  
  test('OAuth Configuration Verification', async ({ page }) => {
    console.log('🔧 Checking OAuth configuration...');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check if auth endpoints are accessible
    const authEndpoints = [
      '/api/auth/callback/google',
      '/auth/v1/authorize',
    ];
    
    for (const endpoint of authEndpoints) {
      try {
        const response = await page.request.get(endpoint);
        console.log(`📍 ${endpoint}: ${response.status()}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    // Check for provider configuration in page source
    const pageContent = await page.content();
    const hasGoogleConfig = pageContent.includes('google') && 
                          (pageContent.includes('client_id') || 
                           pageContent.includes('oauth'));
    
    console.log(`🔑 Google OAuth config present: ${hasGoogleConfig ? '✅' : '❌'}`);
  });
});