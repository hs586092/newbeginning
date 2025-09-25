import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test multiple deployment URLs to find one that works
  const deploymentUrls = [
    'https://newbeginning-g8uqhmkt2-hs586092s-projects.vercel.app',
    'https://newbeginning-k3wbyj5jr-hs586092s-projects.vercel.app',
    'https://newbeginning-drmuiag3d-hs586092s-projects.vercel.app'
  ];

  for (const url of deploymentUrls) {
    try {
      console.log(`🔍 Testing: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      const title = await page.title();
      console.log(`📄 Title: ${title}`);

      // Check if it's our app (not Vercel login)
      const isOurApp = await page.evaluate(() => {
        return document.body.textContent.includes('육아') ||
               document.body.textContent.includes('게시글') ||
               document.querySelector('[class*="homepage"]') ||
               !document.body.textContent.includes('Log in to Vercel');
      });

      if (isOurApp) {
        console.log(`✅ Found working deployment: ${url}`);

        // Take screenshot
        await page.screenshot({
          path: `working-deployment-${Date.now()}.png`,
          fullPage: true
        });

        // Check for social elements
        const socialElements = await page.evaluate(() => {
          return {
            hasNotificationBell: !!document.querySelector('[class*="notification"]'),
            hasActivityFeed: !!document.querySelector('[class*="activity"]'),
            hasFollowButton: !!document.querySelector('[class*="follow"]'),
            hasRecommendedUsers: !!document.querySelector('[class*="recommended"]'),
            hasLoginLink: !!document.querySelector('a[href="/login"]'),
            totalElements: document.querySelectorAll('*').length,
            bodyContent: document.body.textContent.substring(0, 200)
          };
        });

        console.log('🔍 Social elements found:', JSON.stringify(socialElements, null, 2));
        break;
      } else {
        console.log(`❌ ${url} shows Vercel login page`);
      }

    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
    }
  }

  await browser.close();
})();