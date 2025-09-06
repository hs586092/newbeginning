const { chromium } = require('playwright');

async function testLoginFlow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🎭 Testing actual login flow...\n');

  try {
    // 1. 랜딩페이지 캡처
    console.log('📸 Capturing landing page (before login)...');
    await page.goto('https://newbeginning-seven.vercel.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/before-login.png', fullPage: true });

    // 랜딩페이지 요소 분석
    const landingAnalysis = await page.evaluate(() => {
      const heroText = document.querySelector('h1')?.textContent || '';
      const hasGradient = !!document.querySelector('.bg-gradient-to-br, .from-pink-400, .to-purple-400');
      const hasWarmMessage = heroText.includes('임신부터 첫돌까지') || heroText.includes('모든 순간을 함께');
      
      return {
        heroText,
        hasGradient,
        hasWarmMessage,
        buttonsCount: document.querySelectorAll('button').length,
        hasLoginButton: !!document.querySelector('a[href*="login"]') || !!document.querySelector('button')
      };
    });

    console.log('📊 Landing page analysis:', JSON.stringify(landingAnalysis, null, 2));

    // 2. 수동 로그인 안내
    console.log('\n👆 Please manually log in with Google in the browser window that opened.');
    console.log('After logging in, press Enter in the terminal to continue...');
    
    // 사용자가 수동으로 로그인할 때까지 대기
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    // 3. 로그인 후 페이지 캡처
    console.log('📸 Capturing dashboard page (after login)...');
    await page.waitForTimeout(3000); // 페이지 로딩 대기
    await page.screenshot({ path: '/tmp/after-login.png', fullPage: true });

    // 로그인 후 페이지 분석
    const dashboardAnalysis = await page.evaluate(() => {
      const heroText = document.querySelector('h1')?.textContent || '';
      const hasGradient = !!document.querySelector('.bg-gradient-to-br, .from-pink-400, .to-purple-400');
      const hasPersonalGreeting = heroText.includes('안녕하세요') || heroText.includes('님!');
      const hasWarmMessage = !!document.querySelector('p')?.textContent?.includes('오늘도 함께하는');
      
      return {
        heroText,
        hasGradient,
        hasPersonalGreeting,
        hasWarmMessage,
        currentUrl: window.location.href,
        hasPersonalSidebar: !!document.querySelector('[class*="personal"], .lg\\:w-80'),
        hasFeedContent: !!document.querySelector('[class*="feed"], [class*="posts"]')
      };
    });

    console.log('\n📊 Dashboard analysis:', JSON.stringify(dashboardAnalysis, null, 2));

    // 4. 비교 분석
    console.log('\n🔍 Before vs After Login Comparison:');
    console.log('=====================================');
    console.log(`Landing Hero: "${landingAnalysis.heroText}"`);
    console.log(`Dashboard Hero: "${dashboardAnalysis.heroText}"`);
    console.log(`Landing Gradient: ${landingAnalysis.hasGradient}`);
    console.log(`Dashboard Gradient: ${dashboardAnalysis.hasGradient}`);
    console.log(`Dashboard Personal Greeting: ${dashboardAnalysis.hasPersonalGreeting}`);
    console.log(`Dashboard Warm Message: ${dashboardAnalysis.hasWarmMessage}`);

    console.log('\n📋 Issues Found:');
    const issues = [];
    
    if (!dashboardAnalysis.hasPersonalGreeting) {
      issues.push('❌ No personal greeting found in dashboard');
    }
    if (!dashboardAnalysis.hasWarmMessage) {
      issues.push('❌ No warm messaging found in dashboard');
    }
    if (landingAnalysis.hasGradient !== dashboardAnalysis.hasGradient) {
      issues.push('❌ Gradient inconsistency between pages');
    }
    if (!dashboardAnalysis.hasFeedContent) {
      issues.push('❌ Feed content not detected');
    }

    if (issues.length === 0) {
      console.log('✅ All tone and manner elements are consistent!');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    console.log('\n✅ Screenshots saved to:');
    console.log('- Before login: /tmp/before-login.png');
    console.log('- After login: /tmp/after-login.png');

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testLoginFlow().catch(console.error);