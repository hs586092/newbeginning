import { chromium } from 'playwright';

async function analyzeSite() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🌐 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'homepage-analysis.png', fullPage: true });
    console.log('📸 Homepage screenshot saved');

    // Analyze page structure
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check for navigation elements
    const navElements = await page.locator('nav').count();
    console.log(`🧭 Navigation elements: ${navElements}`);

    // Check for social/network features
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const forms = await page.locator('form').count();

    console.log(`🔘 Interactive buttons: ${buttons}`);
    console.log(`🔗 Links: ${links}`);
    console.log(`📝 Forms: ${forms}`);

    // Check for user engagement elements
    const socialElements = await page.locator('[class*="social"], [class*="share"], [class*="follow"], [class*="like"], [class*="comment"]').count();
    console.log(`👥 Social engagement elements: ${socialElements}`);

    // Check for login/signup elements
    const authElements = await page.locator('[class*="login"], [class*="signup"], [class*="auth"], button:has-text("Login"), button:has-text("Sign"), a:has-text("Login"), a:has-text("Sign")').count();
    console.log(`🔐 Authentication elements: ${authElements}`);

    // Check for content areas
    const articles = await page.locator('article').count();
    const sections = await page.locator('section').count();
    console.log(`📰 Article elements: ${articles}`);
    console.log(`📑 Section elements: ${sections}`);

    // Check mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'mobile-view.png' });
    console.log('📱 Mobile view screenshot saved');

    // Check for accessibility features
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const altTexts = await page.locator('img[alt]').count();
    const totalImages = await page.locator('img').count();

    console.log(`📊 Headings: ${headings}`);
    console.log(`🖼️  Images with alt text: ${altTexts}/${totalImages}`);

    // Performance check
    const performanceEntry = JSON.parse(
      await page.evaluate(() => JSON.stringify(performance.getEntriesByType('navigation')[0]))
    );

    console.log(`⚡ Page load time: ${Math.round(performanceEntry.loadEventEnd - performanceEntry.fetchStart)}ms`);

  } catch (error) {
    console.error('❌ Error analyzing site:', error.message);
  }

  await browser.close();
}

analyzeSite();