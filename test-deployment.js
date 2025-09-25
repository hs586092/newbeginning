import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🚀 Testing production deployment...');

    // Navigate to production site
    await page.goto('https://newbeginning-6ew32them-hs586092s-projects.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Production site loaded successfully');

    // Take screenshot
    await page.screenshot({
      path: 'production-deployment-test.png',
      fullPage: true
    });

    console.log('📸 Screenshot saved: production-deployment-test.png');

    // Check for social elements
    const socialElements = await page.evaluate(() => {
      const selectors = [
        '[data-testid="notification-bell"]',
        '[data-testid="activity-feed"]',
        '[data-testid="recommended-users"]',
        '[data-testid="follow-button"]',
        '.activity-feed',
        '.notification-bell',
        '.recommended-users'
      ];

      const found = [];
      selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          found.push(selector);
        }
      });

      return {
        found,
        hasNotificationBell: !!document.querySelector('[class*="notification"]'),
        hasActivityFeed: !!document.querySelector('[class*="activity"]'),
        hasFollowButton: !!document.querySelector('[class*="follow"]'),
        hasRecommendedUsers: !!document.querySelector('[class*="recommended"]'),
        totalElements: document.querySelectorAll('*').length,
        hasLoginButton: !!document.querySelector('a[href="/login"]'),
        isHomePage: document.title.includes('육아') || document.body.textContent.includes('육아')
      };
    });

    console.log('🔍 Social elements analysis:', JSON.stringify(socialElements, null, 2));

    // Check page title and basic content
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check for any errors in console
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    console.log('📊 Production deployment test completed');

  } catch (error) {
    console.error('❌ Error testing production site:', error.message);

    // Still try to take screenshot for debugging
    try {
      await page.screenshot({
        path: 'production-error-screenshot.png',
        fullPage: true
      });
      console.log('📸 Error screenshot saved: production-error-screenshot.png');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError.message);
    }
  }

  await browser.close();
})();