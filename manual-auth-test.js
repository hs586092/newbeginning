import { chromium } from 'playwright';

async function manualAuthUITest() {
  console.log('🎯 Manual Authentication UI Verification Test');

  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();

  // Capture authentication logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍 HybridAuthWrapper State:') || text.includes('🔍 UnifiedHomepage:')) {
      console.log(`📱 UI State: ${text}`);
    }
  });

  try {
    console.log('📍 1. Loading homepage...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('📍 2. Checking UI elements visibility...');
    const homePageState = await page.evaluate(() => {
      const heroText = document.querySelector('p')?.textContent || '';
      const signupButton = document.querySelector('a[href="/signup"]');
      const loginLinks = document.querySelectorAll('a[href*="login"]');

      return {
        heroText: heroText.substring(0, 50) + '...',
        hasSignupButton: !!signupButton,
        signupButtonText: signupButton?.textContent || '',
        loginLinksCount: loginLinks.length,
        pageLoaded: document.readyState === 'complete'
      };
    });

    console.log('📊 Homepage State:', homePageState);

    if (homePageState.pageLoaded && homePageState.hasSignupButton) {
      console.log('✅ SUCCESS: Homepage loads and shows unauthenticated UI elements!');
    } else {
      console.log('⚠️ WARNING: Some elements missing or page not fully loaded');
    }

    console.log('📍 3. Manual verification available - check the browser window');
    console.log('   - Hero section should be visible');
    console.log('   - "무료로 시작하기" button should be visible');
    console.log('   - Page should not be stuck on loading screen');

    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  await browser.close();
}

manualAuthUITest().catch(console.error);