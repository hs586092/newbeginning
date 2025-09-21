/**
 * Test header text orientation fix
 * Verifies that "첫돌까지" displays horizontally on mobile
 */

import { chromium } from 'playwright';

async function testHeaderFix() {
  console.log('🧪 Testing header text orientation fix...\n');

  const browser = await chromium.launch({ headless: false });

  // Test multiple mobile viewports
  const viewports = [
    { name: 'iPhone 13', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];

  for (const viewport of viewports) {
    console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);

    const context = await browser.newContext({
      viewport,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();

    try {
      // Visit the site
      await page.goto('https://www.fortheorlingas.com', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Check header text element
      const headerText = await page.locator('header h1').first();
      await headerText.waitFor({ timeout: 5000 });

      // Get computed styles and dimensions
      const textInfo = await page.evaluate(() => {
        const h1 = document.querySelector('header h1');
        if (!h1) return null;

        const rect = h1.getBoundingClientRect();
        const computed = window.getComputedStyle(h1);

        return {
          text: h1.textContent,
          rect: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            x: Math.round(rect.x),
            y: Math.round(rect.y)
          },
          styles: {
            writingMode: computed.writingMode,
            textOrientation: computed.textOrientation,
            direction: computed.direction,
            display: computed.display,
            flexDirection: computed.flexDirection
          },
          isVertical: rect.height > rect.width && rect.height > 60,
          isHorizontal: rect.width > rect.height
        };
      });

      if (textInfo) {
        console.log(`  Text: "${textInfo.text}"`);
        console.log(`  Dimensions: ${textInfo.rect.width}x${textInfo.rect.height}`);
        console.log(`  Writing Mode: ${textInfo.styles.writingMode}`);
        console.log(`  Text Orientation: ${textInfo.styles.textOrientation}`);
        console.log(`  Direction: ${textInfo.styles.direction}`);

        if (textInfo.isHorizontal) {
          console.log(`  ✅ HORIZONTAL - Fix working correctly`);
        } else if (textInfo.isVertical) {
          console.log(`  ❌ VERTICAL - Issue still present`);
        } else {
          console.log(`  ⚠️  UNCLEAR - Check dimensions manually`);
        }
      } else {
        console.log(`  ❌ Header text not found`);
      }

      // Take screenshot
      await page.screenshot({
        path: `header-fix-test-${viewport.name.replace(/\s+/g, '-')}.png`,
        fullPage: false
      });
      console.log(`  📸 Screenshot saved`);

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }

    await context.close();
    console.log('');
  }

  await browser.close();
  console.log('✅ Header fix test completed!');
}

testHeaderFix().catch(console.error);