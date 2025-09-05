const { test } = require('@playwright/test');

test('Complete Landing Page Capture', async ({ page }) => {
  const url = 'https://newbeginning-seven.vercel.app/';
  
  console.log('\n📸 COMPLETE LANDING PAGE CAPTURE');
  
  // Desktop full page capture
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Take complete full page screenshot
  await page.screenshot({
    path: '/Users/hyeonsoo/newbeginning/complete-landing-desktop.png',
    fullPage: true
  });
  console.log('✅ Complete desktop landing page captured');
  
  // Mobile full page capture
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload({ waitUntil: 'networkidle' });
  
  await page.screenshot({
    path: '/Users/hyeonsoo/newbeginning/complete-landing-mobile.png',
    fullPage: true
  });
  console.log('✅ Complete mobile landing page captured');
  
  // Capture content sections separately for better analysis
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });
  
  // Scroll and capture content sections
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  
  await page.screenshot({
    path: '/Users/hyeonsoo/newbeginning/content-sections-desktop.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });
  console.log('✅ Content sections captured');
  
  // Capture bottom sections
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  await page.screenshot({
    path: '/Users/hyeonsoo/newbeginning/bottom-sections-desktop.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });
  console.log('✅ Bottom sections captured');
});