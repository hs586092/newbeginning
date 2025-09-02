const { chromium } = require('playwright');

async function captureKeyPages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 800 });

  const pagesToCapture = [
    { name: 'homepage', url: 'https://newbeginning-seven.vercel.app/' },
    { name: 'community', url: 'https://newbeginning-seven.vercel.app/community' },
    { name: 'login', url: 'https://newbeginning-seven.vercel.app/login' },
    { name: '404-pregnancy', url: 'https://newbeginning-seven.vercel.app/pregnancy' },
    { name: '404-newborn', url: 'https://newbeginning-seven.vercel.app/newborn' }
  ];

  for (const pageInfo of pagesToCapture) {
    try {
      console.log(`📸 Capturing ${pageInfo.name}...`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ 
        path: `./screenshots-${pageInfo.name}.png`, 
        fullPage: true 
      });
    } catch (error) {
      console.log(`Error capturing ${pageInfo.name}: ${error.message}`);
    }
  }

  await browser.close();
  console.log('✅ Screenshots captured!');
}

captureKeyPages();