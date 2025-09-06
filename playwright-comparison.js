const { chromium } = require('playwright');

async function comparePages() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🎭 Starting Playwright comparison of landing vs logged-in pages...\n');

  // 1. Landing page (anonymous user)
  console.log('📸 Capturing landing page (anonymous user)...');
  await page.goto('https://newbeginning-seven.vercel.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for dynamic content
  await page.screenshot({ path: '/tmp/landing-page.png', fullPage: true });

  // Analyze landing page elements
  const landingElements = await page.evaluate(() => {
    return {
      heroSection: !!document.querySelector('section .text-3xl, section .text-4xl, section .text-5xl, section .text-6xl'),
      gradient: !!document.querySelector('.bg-gradient-to-br, .bg-gradient-to-r'),
      userTypeButtons: document.querySelectorAll('button').length,
      socialProof: !!document.querySelector('.text-white'),
      sidebar: !!document.querySelector('aside, .lg\\:w-80'),
      feedLayout: !!document.querySelector('.lg\\:flex-row'),
      colors: {
        hasBlue: !!document.querySelector('.text-blue-500, .bg-blue-500, .from-blue-500, .to-blue-500'),
        hasPink: !!document.querySelector('.text-pink-500, .bg-pink-500, .from-pink-500, .to-pink-500'),
        hasGradient: !!document.querySelector('.bg-gradient-to-r, .bg-gradient-to-br')
      }
    };
  });

  console.log('📊 Landing page analysis:', JSON.stringify(landingElements, null, 2));

  // 2. Try to simulate login or go to a page that shows logged-in state
  console.log('\n📸 Capturing logged-in dashboard simulation...');
  
  // Navigate to a different state - let's see what happens when we try to access the main content
  await page.goto('https://newbeginning-seven.vercel.app/?logged=true', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check if it shows a different layout or if we need to actually log in
  const currentUrl = page.url();
  const pageTitle = await page.title();
  
  console.log(`Current URL: ${currentUrl}`);
  console.log(`Page title: ${pageTitle}`);

  // Analyze what we see on this page
  const dashboardElements = await page.evaluate(() => {
    const dashboard = document.querySelector('[class*="dashboard"], [class*="personal"]');
    const sidebar = document.querySelector('aside, .lg\\:w-80, .lg\\:col-span-1');
    const feeds = document.querySelector('.space-y-6, [class*="feed"]');
    
    return {
      hasDashboard: !!dashboard,
      hasSidebar: !!sidebar,
      hasFeeds: !!feeds,
      hasUserProfile: !!document.querySelector('.w-12.h-12, [class*="avatar"]'),
      hasStats: !!document.querySelector('.grid-cols-2, .grid-cols-3'),
      layout: {
        isGrid: !!document.querySelector('.grid, .lg\\:grid-cols-4'),
        hasSidebar: !!document.querySelector('.lg\\:col-span-1'),
        hasMainContent: !!document.querySelector('.lg\\:col-span-3')
      },
      colors: {
        hasBlue: !!document.querySelector('.text-blue-500, .bg-blue-500, .from-blue-500, .to-blue-500'),
        hasPink: !!document.querySelector('.text-pink-500, .bg-pink-500, .from-pink-500, .to-pink-500'),
        hasGradient: !!document.querySelector('.bg-gradient-to-r, .bg-gradient-to-br')
      }
    };
  });

  await page.screenshot({ path: '/tmp/dashboard-page.png', fullPage: true });
  console.log('\n📊 Dashboard page analysis:', JSON.stringify(dashboardElements, null, 2));

  // 3. Compare the two
  console.log('\n🔍 Tone & Manner Comparison:');
  console.log('=====================================');
  
  console.log('\n🎨 Color Consistency:');
  console.log(`Landing - Blue: ${landingElements.colors.hasBlue}, Pink: ${landingElements.colors.hasPink}, Gradient: ${landingElements.colors.hasGradient}`);
  console.log(`Dashboard - Blue: ${dashboardElements.colors.hasBlue}, Pink: ${dashboardElements.colors.hasPink}, Gradient: ${dashboardElements.colors.hasGradient}`);
  
  console.log('\n📐 Layout Structure:');
  console.log(`Landing - Hero: ${landingElements.heroSection}, Sidebar: ${landingElements.sidebar}, Feed Layout: ${landingElements.feedLayout}`);
  console.log(`Dashboard - Grid Layout: ${dashboardElements.layout.isGrid}, Sidebar: ${dashboardElements.layout.hasSidebar}, Main Content: ${dashboardElements.layout.hasMainContent}`);

  console.log('\n💡 Issues Found:');
  const issues = [];
  
  if (landingElements.colors.hasGradient !== dashboardElements.colors.hasGradient) {
    issues.push('- Gradient usage inconsistency');
  }
  if (landingElements.colors.hasPink !== dashboardElements.colors.hasPink) {
    issues.push('- Pink color scheme inconsistency');
  }
  if (landingElements.colors.hasBlue !== dashboardElements.colors.hasBlue) {
    issues.push('- Blue color scheme inconsistency');
  }
  if (landingElements.sidebar !== dashboardElements.layout.hasSidebar) {
    issues.push('- Sidebar layout inconsistency');
  }

  if (issues.length > 0) {
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('✅ No major inconsistencies detected');
  }

  console.log('\n📋 Recommendations:');
  console.log('1. Ensure gradient backgrounds are used consistently');
  console.log('2. Maintain pink-to-blue color scheme in dashboard');
  console.log('3. Keep sidebar design consistent with landing page');
  console.log('4. Apply same typography and spacing patterns');
  console.log('5. Use consistent button styles and interactive elements');

  await browser.close();
  
  console.log('\n✅ Screenshots saved to /tmp/landing-page.png and /tmp/dashboard-page.png');
  console.log('📝 Detailed analysis complete!');
}

comparePages().catch(console.error);