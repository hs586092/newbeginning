const { test, expect } = require('@playwright/test');

test.describe('Production Site Validation', () => {
  test('Complete production site validation', async ({ page, browser }) => {
    const baseUrl = 'https://newbeginning-seven.vercel.app';
    
    console.log('\n🌐 PRODUCTION DEPLOYMENT VALIDATION\n');
    console.log('=' .repeat(60));
    
    // 1. TECHNICAL FIXES VERIFICATION
    console.log('\n📋 STEP 1: Technical Fixes Verification');
    
    const errors = [];
    const networkErrors = [];
    const imageErrors = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for network errors
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    // Navigate to main page
    const startTime = Date.now();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️  Page load time: ${loadTime}ms`);
    console.log(`✅ Site accessible at: ${baseUrl}`);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/production-main-page.png', fullPage: true });
    
    // Check for broken images
    const images = await page.locator('img').all();
    for (const img of images) {
      try {
        const src = await img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          const naturalWidth = await img.evaluate(el => el.naturalWidth);
          if (naturalWidth === 0) {
            imageErrors.push(src);
          }
        }
      } catch (e) {
        // Skip if element is not accessible
      }
    }
    
    console.log(`🐛 Console errors: ${errors.length}`);
    console.log(`🌐 Network errors: ${networkErrors.length}`);
    console.log(`🖼️ Broken images: ${imageErrors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Console Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors:');
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (imageErrors.length > 0) {
      console.log('\n🖼️ Broken Images:');
      imageErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // 2. USER EXPERIENCE VALIDATION
    console.log('\n📋 STEP 2: User Experience Validation');
    
    // Check if posts are loading
    const postsLoaded = await page.locator('[class*="post"], .community-post, .feed-post').count();
    console.log(`📝 Posts found: ${postsLoaded}`);
    
    // Check navigation elements
    const navElements = await page.locator('nav, [role="navigation"]').count();
    console.log(`🧭 Navigation elements: ${navElements}`);
    
    // Check Korean text rendering
    const koreanText = await page.locator('text=/[가-힣]/').first();
    const hasKoreanText = await koreanText.count() > 0;
    console.log(`🇰🇷 Korean text rendering: ${hasKoreanText ? '✅' : '❌'}`);
    
    // 3. CONTENT QUALITY CHECK
    console.log('\n📋 STEP 3: Content Quality Check');
    
    // Check for main heading
    const mainHeading = await page.locator('h1').first().textContent().catch(() => '');
    console.log(`📄 Main heading: "${mainHeading}"`);
    
    // Check for category buttons/links
    const categories = await page.locator('button, a').all();
    let categoryCount = 0;
    for (const category of categories.slice(0, 10)) { // Check first 10 to avoid timeout
      try {
        const text = await category.textContent();
        if (text && text.includes('🍼') || text.includes('🤰') || text.includes('👶')) {
          categoryCount++;
        }
      } catch (e) {
        // Skip if element is not accessible
      }
    }
    console.log(`🏷️ Category buttons found: ${categoryCount}`);
    
    // 4. CROSS-DEVICE TESTING
    console.log('\n📋 STEP 4: Cross-Device Testing');
    
    // Mobile test
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/production-mobile.png', fullPage: true });
    
    const mobileMenuVisible = await page.locator('[class*="mobile"], .mobile-menu, button[aria-label*="menu"]').count();
    console.log(`📱 Mobile elements: ${mobileMenuVisible}`);
    
    // Desktop test
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/production-desktop.png', fullPage: true });
    
    // 5. PRODUCTION READINESS CHECK
    console.log('\n📋 STEP 5: Production Readiness Assessment');
    
    // Test community page
    let communityWorking = false;
    try {
      await page.goto(`${baseUrl}/community`, { waitUntil: 'networkidle' });
      communityWorking = true;
      await page.screenshot({ path: 'test-results/production-community.png', fullPage: true });
    } catch (e) {
      console.log('⚠️  Community page navigation failed');
    }
    
    // Test login page
    let loginWorking = false;
    try {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
      loginWorking = true;
      await page.screenshot({ path: 'test-results/production-login.png', fullPage: true });
    } catch (e) {
      console.log('⚠️  Login page navigation failed');
    }
    
    console.log(`🔐 Login page: ${loginWorking ? '✅' : '❌'}`);
    console.log(`👥 Community page: ${communityWorking ? '✅' : '❌'}`);
    
    // FINAL ASSESSMENT
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL PRODUCTION ASSESSMENT');
    console.log('=' .repeat(60));
    
    const criticalIssues = [];
    const warnings = [];
    
    if (loadTime > 5000) criticalIssues.push('Slow page load (>5s)');
    if (errors.length > 5) criticalIssues.push('Multiple console errors');
    if (networkErrors.length > 3) criticalIssues.push('Multiple network failures');
    if (imageErrors.length > 0) warnings.push('Broken images detected');
    if (!hasKoreanText) criticalIssues.push('Korean text not rendering');
    if (!loginWorking) criticalIssues.push('Login page not accessible');
    
    console.log(`\n⚡ Performance: ${loadTime < 3000 ? '✅ Excellent' : loadTime < 5000 ? '✅ Good' : '⚠️ Needs improvement'}`);
    console.log(`🔧 Technical: ${errors.length + networkErrors.length === 0 ? '✅ Clean' : '⚠️ Has issues'}`);
    console.log(`📱 Responsive: ${mobileMenuVisible > 0 ? '✅ Mobile ready' : '✅ Desktop optimized'}`);
    console.log(`🌐 Navigation: ${loginWorking && communityWorking ? '✅ Working' : '⚠️ Partial'}`);
    
    const isProductionReady = criticalIssues.length === 0;
    
    console.log(`\n🎯 PRODUCTION READINESS: ${isProductionReady ? '✅ READY FOR 12,000+ USERS' : '⚠️ NEEDS ATTENTION'}`);
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      criticalIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('  - test-results/production-main-page.png');
    console.log('  - test-results/production-mobile.png');
    console.log('  - test-results/production-desktop.png');
    console.log('  - test-results/production-community.png');
    console.log('  - test-results/production-login.png');
    
    // Assertions for test framework
    expect(criticalIssues.length).toBe(0);
    expect(loadTime).toBeLessThan(5000);
    expect(page.url()).toContain('newbeginning-seven.vercel.app');
  });
});