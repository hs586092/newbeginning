import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🌐 Testing custom domain: fortheorlingas.com');

    await page.goto('https://fortheorlingas.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check if it's our app
    const isOurApp = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      return bodyText.includes('육아') ||
             bodyText.includes('게시글') ||
             bodyText.includes('첫돌까지') ||
             document.querySelector('[class*="homepage"]') ||
             !bodyText.includes('Log in to Vercel');
    });

    if (isOurApp) {
      console.log('✅ Custom domain is working with our app!');

      // Take screenshot
      await page.screenshot({
        path: 'custom-domain-success.png',
        fullPage: true
      });

      // Check for social elements we implemented
      const socialAnalysis = await page.evaluate(() => {
        return {
          hasNotificationBell: !!document.querySelector('[class*="notification"]'),
          hasActivityFeed: !!document.querySelector('[class*="activity"]'),
          hasFollowButton: !!document.querySelector('[class*="follow"]'),
          hasRecommendedUsers: !!document.querySelector('[class*="recommended"]'),
          hasLoginLink: !!document.querySelector('a[href="/login"]'),
          hasDataConnectionInfo: !!document.querySelector('[class*="connection"]'),
          hasSystemStatus: !!document.querySelector('[class*="시스템"]') || !!document.querySelector('[class*="status"]'),
          hasTrendingSection: !!document.querySelector('[class*="trending"]') || !!document.querySelector('[class*="인기"]'),
          totalElements: document.querySelectorAll('*').length,
          bodyTextSample: document.body.textContent.substring(0, 300)
        };
      });

      console.log('🔍 Social features analysis:');
      console.log(JSON.stringify(socialAnalysis, null, 2));

      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({
        path: 'custom-domain-mobile.png',
        fullPage: true
      });

      console.log('📱 Mobile screenshot saved');

    } else {
      console.log('❌ Custom domain shows Vercel login or other content');

      // Take screenshot for debugging
      await page.screenshot({
        path: 'custom-domain-issue.png',
        fullPage: true
      });
    }

  } catch (error) {
    console.error('❌ Error testing custom domain:', error.message);

    // Take screenshot for debugging
    try {
      await page.screenshot({
        path: 'custom-domain-error.png',
        fullPage: true
      });
    } catch (screenshotError) {
      console.error('Failed to take error screenshot');
    }
  }

  await browser.close();
})();