import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🌐 Testing www domain: https://www.fortheorlingas.com/');

    await page.goto('https://www.fortheorlingas.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Take screenshot of homepage
    await page.screenshot({
      path: 'www-domain-homepage.png',
      fullPage: true
    });

    // Check for our app content
    const appAnalysis = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      return {
        isParentingApp: bodyText.includes('육아') || bodyText.includes('첫돌까지'),
        hasLoginButton: !!document.querySelector('a[href="/login"]'),
        hasNotificationBell: !!document.querySelector('[class*="notification"]'),
        hasActivityFeed: !!document.querySelector('[class*="activity"]'),
        hasFollowElements: !!document.querySelector('[class*="follow"]'),
        hasRecommendedUsers: !!document.querySelector('[class*="recommended"]'),
        hasSystemStatus: bodyText.includes('시스템 상태') || bodyText.includes('데이터 소스'),
        hasConnectionStatus: bodyText.includes('데이터베이스 연결') || bodyText.includes('connection'),
        hasTrendingCategories: bodyText.includes('지금 뜬 카테고리') || bodyText.includes('trending'),
        totalPosts: (bodyText.match(/게시글/g) || []).length,
        bodyTextSample: bodyText.substring(0, 400)
      };
    });

    console.log('🔍 Application analysis:');
    console.log(JSON.stringify(appAnalysis, null, 2));

    // Test if login page works
    if (appAnalysis.hasLoginButton) {
      console.log('🔐 Testing login page...');
      await page.click('a[href="/login"]');
      await page.waitForTimeout(2000);

      const loginTitle = await page.title();
      console.log(`📄 Login page title: ${loginTitle}`);

      await page.screenshot({
        path: 'www-domain-login-page.png'
      });
    }

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://www.fortheorlingas.com/', {
      waitUntil: 'networkidle'
    });

    await page.screenshot({
      path: 'www-domain-mobile-view.png',
      fullPage: true
    });

    console.log('✅ Testing completed successfully');

  } catch (error) {
    console.error('❌ Error testing www domain:', error.message);

    try {
      await page.screenshot({
        path: 'www-domain-error.png',
        fullPage: true
      });
    } catch (screenshotError) {
      console.error('Failed to take error screenshot');
    }
  }

  await browser.close();
})();