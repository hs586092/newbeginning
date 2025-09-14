const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-first-run', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('🔍 COMPREHENSIVE OAUTH PROBLEM ANALYSIS');
  console.log('=' .repeat(60));
  
  let allRequests = [];
  let allResponses = [];
  let allErrors = [];
  
  // Capture ALL network activity
  page.on('request', request => {
    allRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    });
    console.log(`→ REQ: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    allResponses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    });
    console.log(`← RES: ${response.status()} ${response.url()}`);
  });
  
  page.on('console', msg => {
    console.log(`🖥️ CONSOLE [${msg.type()}]: ${msg.text()}`);
    if (msg.type() === 'error') {
      allErrors.push({
        type: 'console_error',
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('pageerror', error => {
    console.log(`🚨 PAGE ERROR: ${error.message}`);
    allErrors.push({
      type: 'page_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('requestfailed', request => {
    console.log(`❌ REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    allErrors.push({
      type: 'request_failed',
      url: request.url(),
      error: request.failure()?.errorText,
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('\n📍 PHASE 1: DIRECT DOMAIN TESTS');
    console.log('-'.repeat(40));
    
    // Test 1: Check main domain
    console.log('🔗 Testing main domain...');
    try {
      await page.goto('https://newbeginning-seven.vercel.app', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      const mainUrl = page.url();
      const mainTitle = await page.title();
      console.log(`✅ Main domain: ${mainUrl}`);
      console.log(`📄 Title: "${mainTitle}"`);
      
    } catch (error) {
      console.log(`❌ Main domain failed: ${error.message}`);
    }
    
    // Test 2: Check deployment URL  
    console.log('🔗 Testing deployment URL...');
    try {
      await page.goto('https://newbeginning-qwe9jwcrw-hs586092s-projects.vercel.app', {
        waitUntil: 'networkidle', 
        timeout: 15000
      });
      
      const deployUrl = page.url();
      const deployTitle = await page.title();
      console.log(`✅ Deploy domain: ${deployUrl}`);
      console.log(`📄 Title: "${deployTitle}"`);
      
    } catch (error) {
      console.log(`❌ Deploy domain failed: ${error.message}`);
    }
    
    console.log('\n📍 PHASE 2: LOGIN PAGE ANALYSIS');
    console.log('-'.repeat(40));
    
    // Go to login page
    await page.goto('https://newbeginning-seven.vercel.app/login', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    await page.screenshot({ path: 'analysis-login-page.png', fullPage: true });
    
    // Check all form elements
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    const googleButton = await page.locator('text=Google로 로그인').first();
    
    console.log(`📝 Email input visible: ${await emailInput.isVisible()}`);
    console.log(`📝 Password input visible: ${await passwordInput.isVisible()}`);
    console.log(`🔘 Google button visible: ${await googleButton.isVisible()}`);
    
    console.log('\n📍 PHASE 3: OAUTH URL ANALYSIS');
    console.log('-'.repeat(40));
    
    // Click Google button and analyze the redirect
    console.log('🖱️ Clicking Google login...');
    
    await googleButton.click();
    
    // Wait for any navigation
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 Current URL after click: ${currentUrl}`);
    
    // Analyze URL components
    if (currentUrl.includes('accounts.google.com')) {
      console.log('✅ Successfully redirected to Google');
      
      const url = new URL(currentUrl);
      const params = url.searchParams;
      
      console.log('\n🔍 GOOGLE OAUTH PARAMETERS:');
      console.log(`   client_id: ${params.get('client_id')}`);
      console.log(`   redirect_uri: ${params.get('redirect_uri')}`);
      console.log(`   response_type: ${params.get('response_type')}`);
      console.log(`   scope: ${params.get('scope')}`);
      
      // Decode the redirect_to parameter
      const redirectTo = params.get('redirect_to');
      if (redirectTo) {
        const decodedRedirect = decodeURIComponent(redirectTo);
        console.log(`   redirect_to: ${decodedRedirect}`);
        
        if (decodedRedirect.includes('newbeginning-seven.vercel.app')) {
          console.log('✅ Correct production domain in redirect_to');
        } else {
          console.log('❌ Wrong domain in redirect_to!');
        }
      } else {
        console.log('❌ No redirect_to parameter found!');
      }
      
    } else if (currentUrl.includes('newbeginning')) {
      console.log('⚠️ Still on our domain - OAuth redirect may have failed');
    } else {
      console.log(`❓ Unexpected URL: ${currentUrl}`);
    }
    
    await page.screenshot({ path: 'analysis-after-oauth-click.png', fullPage: true });
    
    console.log('\n📍 PHASE 4: ERROR ANALYSIS');
    console.log('-'.repeat(40));
    
    console.log(`🚨 Total errors captured: ${allErrors.length}`);
    allErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. [${error.type}] ${error.message || error.text || error.error}`);
    });
    
    console.log('\n📍 PHASE 5: NETWORK ANALYSIS');
    console.log('-'.repeat(40));
    
    // Check for failed requests
    const failedRequests = allRequests.filter(req => {
      const response = allResponses.find(res => res.url === req.url);
      return !response || response.status >= 400;
    });
    
    console.log(`📡 Total requests: ${allRequests.length}`);
    console.log(`❌ Failed requests: ${failedRequests.length}`);
    
    failedRequests.forEach((req, index) => {
      const response = allResponses.find(res => res.url === req.url);
      console.log(`   ${index + 1}. ${req.method} ${req.url} - ${response ? response.status : 'NO_RESPONSE'}`);
    });
    
    // Check specific auth-related requests
    const authRequests = allRequests.filter(req => 
      req.url.includes('auth') || 
      req.url.includes('callback') || 
      req.url.includes('supabase') ||
      req.url.includes('google')
    );
    
    console.log(`\n🔐 Auth-related requests: ${authRequests.length}`);
    authRequests.forEach((req, index) => {
      const response = allResponses.find(res => res.url === req.url);
      console.log(`   ${index + 1}. ${req.method} ${req.url} - ${response ? response.status : 'NO_RESPONSE'}`);
    });
    
    console.log('\n📍 PHASE 6: MANUAL CALLBACK TEST');
    console.log('-'.repeat(40));
    
    // Test callback URL directly
    try {
      console.log('🔗 Testing callback URL directly...');
      await page.goto('https://newbeginning-seven.vercel.app/auth/callback?test=manual', {
        waitUntil: 'networkidle',
        timeout: 15000
      });
      
      const callbackUrl = page.url();
      console.log(`📍 Callback redirect to: ${callbackUrl}`);
      
      if (callbackUrl.includes('/login')) {
        console.log('✅ Callback route works (redirects to login)');
      } else {
        console.log('❌ Callback route issue');
      }
      
    } catch (error) {
      console.log(`❌ Callback test failed: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`💥 CRITICAL ERROR: ${error.message}`);
    allErrors.push({
      type: 'critical_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('\n🎯 FINAL DIAGNOSIS');
  console.log('='.repeat(60));
  
  // Summary of findings
  const hasNetworkErrors = allErrors.some(e => e.type === 'request_failed');
  const hasConsoleErrors = allErrors.some(e => e.type === 'console_error');
  const hasPageErrors = allErrors.some(e => e.type === 'page_error');
  
  console.log(`🌐 Network connectivity issues: ${hasNetworkErrors ? 'YES' : 'NO'}`);
  console.log(`🖥️ Console errors detected: ${hasConsoleErrors ? 'YES' : 'NO'}`);
  console.log(`📄 Page script errors: ${hasPageErrors ? 'YES' : 'NO'}`);
  
  // Save comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    requests: allRequests,
    responses: allResponses,
    errors: allErrors,
    analysis: {
      network_issues: hasNetworkErrors,
      console_errors: hasConsoleErrors,
      page_errors: hasPageErrors
    }
  };
  
  console.log('\n📊 Full analysis report saved to analysis-report.json');
  require('fs').writeFileSync('analysis-report.json', JSON.stringify(report, null, 2));
  
  await browser.close();
  
  console.log('\n✅ COMPREHENSIVE ANALYSIS COMPLETE');
})();