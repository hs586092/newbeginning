const { test, expect } = require('@playwright/test');

test.describe('🔐 Login Page Comprehensive Analysis', () => {
  const BASE_URL = 'https://newbeginning-seven.vercel.app';

  test('Complete Login Page Analysis', async ({ page, browser }) => {
    console.log('🚀 Starting comprehensive login page analysis...\n');

    // 1. INITIAL LOAD AND BASIC ANALYSIS
    console.log('📍 STEP 1: Initial Page Load Analysis');
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️  Page load time: ${loadTime}ms`);
    console.log(`🌐 Current URL: ${page.url()}`);
    console.log(`📄 Page title: ${await page.title()}`);

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/login-initial-state.png', fullPage: true });
    console.log('📸 Initial state screenshot saved');

    // 2. AUTHENTICATION FLOW ANALYSIS
    console.log('\n📍 STEP 2: Authentication Flow Analysis');
    
    // Check for login methods
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const googleButton = page.locator('button:has-text("Google"), [aria-label*="Google"], .google-login, [id*="google"], [class*="google"]');
    const loginButton = page.locator('button[type="submit"]:has-text("로그인")').first();
    const googleLoginButton = page.locator('button:has-text("Google")').first();
    const signupTab = page.locator(':text("회원가입"), :text("Sign up"), :text("Register")');

    const hasEmailLogin = await emailInput.isVisible();
    const hasPasswordLogin = await passwordInput.isVisible();
    const hasGoogleLogin = await googleLoginButton.isVisible();
    const hasLoginButton = await loginButton.isVisible();
    const hasSignupOption = await signupTab.isVisible();

    console.log(`✅ Email/Password Login: ${hasEmailLogin ? 'Available' : 'Not Found'}`);
    console.log(`✅ Google OAuth: ${hasGoogleLogin ? 'Available' : 'Not Found'}`);
    console.log(`✅ Login Button: ${hasLoginButton ? 'Available' : 'Not Found'}`);
    console.log(`✅ Signup Option: ${hasSignupOption ? 'Available' : 'Not Found'}`);

    // 3. FORM VALIDATION TESTING
    console.log('\n📍 STEP 3: Form Validation Testing');
    
    if (hasEmailLogin && hasPasswordLogin) {
      // Test empty form submission
      if (hasLoginButton) {
        await loginButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation errors
        const errorMessages = await page.locator('.text-red-500, .error, .invalid, [class*="error"], [class*="invalid"]').allTextContents();
        console.log(`🚨 Validation errors: ${errorMessages.length > 0 ? errorMessages.join(', ') : 'None visible'}`);
        
        // Screenshot validation state
        await page.screenshot({ path: 'test-results/login-validation-errors.png', fullPage: true });
        console.log('📸 Validation errors screenshot saved');
      }

      // Test invalid email format
      await emailInput.fill('invalid-email');
      await passwordInput.fill('test123');
      if (hasLoginButton) {
        await loginButton.click();
        await page.waitForTimeout(1000);
        
        const emailErrors = await page.locator('[class*="error"]:near(input[type="email"]), .text-red-500:near(input[type="email"])').allTextContents();
        console.log(`📧 Email validation: ${emailErrors.length > 0 ? emailErrors.join(', ') : 'No specific error shown'}`);
      }

      // Clear form
      await emailInput.fill('');
      await passwordInput.fill('');
    }

    // 4. USER EXPERIENCE ANALYSIS
    console.log('\n📍 STEP 4: User Experience Analysis');
    
    // Check page layout and design elements
    const pageContent = await page.locator('body').innerHTML();
    const hasLogo = pageContent.includes('logo') || pageContent.includes('brand');
    const hasWelcomeMessage = pageContent.includes('환영') || pageContent.includes('Welcome') || pageContent.includes('로그인');
    
    console.log(`🎨 Logo/Branding: ${hasLogo ? 'Present' : 'Not clearly visible'}`);
    console.log(`👋 Welcome Message: ${hasWelcomeMessage ? 'Present' : 'Not found'}`);

    // Check for trust indicators
    const hasPrivacyLink = await page.locator('a:has-text("개인정보"), a:has-text("Privacy")').isVisible();
    const hasTermsLink = await page.locator('a:has-text("이용약관"), a:has-text("Terms")').isVisible();
    const hasSecurityInfo = pageContent.includes('보안') || pageContent.includes('secure') || pageContent.includes('SSL');

    console.log(`🔒 Privacy Policy Link: ${hasPrivacyLink ? 'Available' : 'Not found'}`);
    console.log(`📋 Terms Link: ${hasTermsLink ? 'Available' : 'Not found'}`);
    console.log(`🛡️  Security Indicators: ${hasSecurityInfo ? 'Present' : 'Not visible'}`);

    // 5. MOBILE RESPONSIVENESS TEST
    console.log('\n📍 STEP 5: Mobile Responsiveness Test');
    
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(500);
    
    const mobileEmailVisible = hasEmailLogin && await emailInput.isVisible();
    const mobilePasswordVisible = hasPasswordLogin && await passwordInput.isVisible();
    const mobileLoginButtonVisible = hasLoginButton && await loginButton.isVisible();
    
    console.log(`📱 Mobile Email Input: ${mobileEmailVisible ? 'Visible' : 'Hidden/Cut off'}`);
    console.log(`📱 Mobile Password Input: ${mobilePasswordVisible ? 'Visible' : 'Hidden/Cut off'}`);
    console.log(`📱 Mobile Login Button: ${mobileLoginButtonVisible ? 'Visible' : 'Hidden/Cut off'}`);

    // Screenshot mobile view
    await page.screenshot({ path: 'test-results/login-mobile-view.png', fullPage: true });
    console.log('📸 Mobile view screenshot saved');

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 6. PERFORMANCE AND CONSOLE ERRORS
    console.log('\n📍 STEP 6: Technical Performance Analysis');
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Reload page to catch any console errors
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log(`🐛 Console Errors: ${consoleErrors.length === 0 ? 'None' : consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 7. CONVERSION OPTIMIZATION ANALYSIS
    console.log('\n📍 STEP 7: Conversion Optimization Analysis');
    
    // Look for value proposition elements
    const headings = await page.locator('h1, h2, h3').allTextContents();
    const hasValueProp = headings.some(h => 
      h.includes('첫돌까지') || h.includes('엄마') || h.includes('육아') || 
      h.includes('newbeginning') || h.includes('여정') || h.includes('함께')
    );
    
    console.log(`💡 Value Proposition: ${hasValueProp ? 'Present in headings' : 'Not clearly stated'}`);
    console.log(`📝 Headings found: ${headings.join(' | ')}`);

    // Check for social proof or testimonials
    const socialProof = pageContent.includes('리뷰') || pageContent.includes('후기') || 
                       pageContent.includes('testimonial') || pageContent.includes('만명') ||
                       pageContent.includes('사용자');
    
    console.log(`⭐ Social Proof: ${socialProof ? 'Present' : 'Not visible'}`);

    // 8. SECURITY ANALYSIS
    console.log('\n📍 STEP 8: Security Analysis');
    
    const isHTTPS = page.url().startsWith('https://');
    const hasPasswordRequirements = pageContent.includes('8자') || pageContent.includes('문자') || 
                                   pageContent.includes('비밀번호') && pageContent.includes('조건');
    
    console.log(`🔐 HTTPS: ${isHTTPS ? 'Secure connection' : 'Not secure'}`);
    console.log(`🔑 Password Requirements: ${hasPasswordRequirements ? 'Visible' : 'Not shown'}`);

    // 9. FINAL COMPREHENSIVE SCREENSHOT
    await page.screenshot({ path: 'test-results/login-final-analysis.png', fullPage: true });
    console.log('📸 Final comprehensive screenshot saved');

    // 10. SUMMARY AND RECOMMENDATIONS
    console.log('\n' + '='.repeat(60));
    console.log('📊 LOGIN PAGE ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    
    const analysisScore = [
      hasEmailLogin && hasPasswordLogin ? 1 : 0,
      hasGoogleLogin ? 1 : 0,
      hasSignupOption ? 1 : 0,
      loadTime < 3000 ? 1 : 0,
      consoleErrors.length === 0 ? 1 : 0,
      isHTTPS ? 1 : 0,
      hasValueProp ? 1 : 0,
      (hasPrivacyLink || hasTermsLink) ? 1 : 0
    ].reduce((a, b) => a + b, 0);
    
    console.log(`🎯 Overall Score: ${analysisScore}/8 (${Math.round(analysisScore/8*100)}%)`);
    console.log(`⏱️  Load Performance: ${loadTime < 3000 ? '✅ Good' : '⚠️ Needs improvement'}`);
    console.log(`🔐 Security: ${isHTTPS ? '✅ Secure' : '❌ Not secure'}`);
    console.log(`📱 Mobile Ready: ${mobileEmailVisible && mobilePasswordVisible ? '✅ Responsive' : '⚠️ Check mobile UX'}`);
    console.log(`🛠️  Technical Issues: ${consoleErrors.length === 0 ? '✅ Clean' : `❌ ${consoleErrors.length} errors`}`);

    console.log('\n🎯 KEY RECOMMENDATIONS:');
    
    if (loadTime > 3000) {
      console.log('⚡ Improve page load speed (current: ' + loadTime + 'ms)');
    }
    
    if (!hasGoogleLogin) {
      console.log('🔑 Consider adding Google OAuth for easier registration');
    }
    
    if (!hasValueProp) {
      console.log('💡 Add clear value proposition on login page');
    }
    
    if (!hasPrivacyLink && !hasTermsLink) {
      console.log('📋 Add privacy policy and terms links for trust');
    }
    
    if (consoleErrors.length > 0) {
      console.log('🐛 Fix console errors for better user experience');
    }
    
    console.log('\n✅ Analysis complete! Check screenshots in test-results/ folder');
  });
});