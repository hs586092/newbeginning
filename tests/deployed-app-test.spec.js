const { test, expect } = require('@playwright/test');

test.describe('🚀 Deployed Application Testing', () => {
  const deployedUrl = 'https://newbeginning-8q9bp17do-hs586092s-projects.vercel.app';

  test('🏠 Landing Page Test - Check main feed section', async ({ page }) => {
    console.log('🏠 Navigating to deployed landing page...');
    
    // Navigate to the home page
    await page.goto(deployedUrl, { waitUntil: 'networkidle' });
    
    // Wait a moment for content to load
    await page.waitForTimeout(3000);
    
    // Take screenshot of the main feed section
    await page.screenshot({ 
      path: 'deployed-landing-page.png', 
      fullPage: true 
    });
    
    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`📍 Page Title: ${title}`);
    console.log(`📍 Current URL: ${url}`);
    
    // Check what content is displayed
    const bodyText = await page.textContent('body');
    console.log('📄 Page contains content:', bodyText ? 'Yes' : 'No');
    
    // Look for specific feed elements
    const feedElements = await page.locator('[class*="feed"]').count();
    const postElements = await page.locator('[class*="post"]').count();
    const cardElements = await page.locator('[class*="card"]').count();
    console.log(`📊 Feed elements found: ${feedElements}`);
    console.log(`📊 Post elements found: ${postElements}`);
    console.log(`📊 Card elements found: ${cardElements}`);
    
    // Check for any errors in console
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
    });
    
    // Wait for any console messages
    await page.waitForTimeout(2000);
    
    const errors = logs.filter(log => log.type === 'error');
    const warnings = logs.filter(log => log.type === 'warning');
    
    console.log(`⚠️ Console errors: ${errors.length}`);
    console.log(`⚠️ Console warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('🚨 Console Errors:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error.text}`));
    }
    
    // Check if there are any authentication error messages
    const authErrors = await page.locator('text=/401|unauthorized|authentication|login required/i').count();
    console.log(`🔐 Authentication errors visible: ${authErrors}`);
    
    // Look for main navigation or header
    const navElements = await page.locator('nav').count();
    const headerElements = await page.locator('header').count();
    console.log(`🧭 Navigation elements: ${navElements}`);
    console.log(`🧭 Header elements: ${headerElements}`);
    
    // Check for loading states
    const loadingElements = await page.locator('text=/loading|로딩|Loading/i').count();
    console.log(`⏳ Loading indicators: ${loadingElements}`);
  });

  test('🔐 Login Flow Test', async ({ page }) => {
    console.log('🔐 Testing login flow...');
    
    // Navigate to login page
    const loginUrl = `${deployedUrl}/login`;
    console.log(`🔗 Navigating to: ${loginUrl}`);
    
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'deployed-login-page.png', 
      fullPage: true 
    });
    
    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`📍 Login Page Title: ${title}`);
    console.log(`📍 Login Page URL: ${url}`);
    
    // Check if login form elements exist
    const emailInputs = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count();
    const passwordInputs = await page.locator('input[type="password"], input[name="password"]').count();
    const submitButtons = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').count();
    
    console.log(`📧 Email inputs found: ${emailInputs}`);
    console.log(`🔒 Password inputs found: ${passwordInputs}`);
    console.log(`🔘 Submit buttons found: ${submitButtons}`);
    
    // If login form exists, try to test it (but don't actually login without credentials)
    if (emailInputs > 0 && passwordInputs > 0) {
      console.log('✅ Login form detected');
      
      // Check for any placeholder text or labels
      const emailPlaceholder = await page.locator('input[type="email"], input[name="email"]').first().getAttribute('placeholder');
      const loginText = await page.textContent('body');
      
      console.log(`📧 Email placeholder: ${emailPlaceholder || 'None'}`);
      console.log(`📄 Page contains login text: ${loginText.includes('로그인') || loginText.includes('Login') ? 'Yes' : 'No'}`);
    }
    
    // Check console for any errors
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
    });
    
    await page.waitForTimeout(2000);
    
    const errors = logs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log('🚨 Login Page Console Errors:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error.text}`));
    }
  });

  test('🔍 Check for 401 Authentication Errors', async ({ page }) => {
    console.log('🔍 Checking for 401 authentication errors...');
    
    // Monitor network requests
    const failedRequests = [];
    const allRequests = [];
    
    page.on('response', response => {
      allRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      
      if (response.status() === 401) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Visit main page
    await page.goto(deployedUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log(`📡 Total network requests: ${allRequests.length}`);
    console.log(`🚨 401 errors found: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('📊 401 Error Details:');
      failedRequests.forEach((req, i) => {
        console.log(`${i + 1}. URL: ${req.url}`);
        console.log(`   Status: ${req.status} ${req.statusText}`);
      });
    } else {
      console.log('✅ No 401 authentication errors detected!');
    }
    
    // Show sample of successful requests
    const successfulRequests = allRequests.filter(req => req.status >= 200 && req.status < 300);
    console.log(`✅ Successful requests (2xx): ${successfulRequests.length}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'deployed-auth-check.png', 
      fullPage: true 
    });
  });

  test('📊 Compare Landing vs Authenticated Content', async ({ page }) => {
    console.log('🔍 Comparing landing page vs authenticated content...');
    
    // First visit landing page
    await page.goto(deployedUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const landingContent = await page.textContent('body');
    const landingFeedElements = await page.locator('[class*="feed"], [class*="post"], [class*="card"]').count();
    
    console.log(`📊 Landing page feed elements: ${landingFeedElements}`);
    console.log(`📄 Landing page has content: ${landingContent ? 'Yes' : 'No'}`);
    
    // Check if there are any login buttons or links
    const loginLinks = await page.locator('a:has-text("로그인"), a:has-text("Login"), a[href*="login"]').count();
    console.log(`🔗 Login links found: ${loginLinks}`);
    
    // Check if content is accessible without authentication
    const isContentRestricted = landingContent.includes('로그인') || landingContent.includes('Login') || landingContent.includes('Sign in');
    console.log(`🔐 Content appears restricted: ${isContentRestricted ? 'Yes' : 'No'}`);
    
    // Look for specific content types
    const hasPostContent = landingContent.includes('게시') || landingContent.includes('post') || landingContent.includes('피드');
    const hasUserContent = landingContent.includes('사용자') || landingContent.includes('user') || landingContent.includes('프로필');
    
    console.log(`📝 Has post-related content: ${hasPostContent ? 'Yes' : 'No'}`);
    console.log(`👤 Has user-related content: ${hasUserContent ? 'Yes' : 'No'}`);
    
    await page.screenshot({ 
      path: 'deployed-content-comparison.png', 
      fullPage: true 
    });
  });

  test('🎯 Specific Feed Content Analysis', async ({ page }) => {
    console.log('🎯 Analyzing specific feed content...');
    
    await page.goto(deployedUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Look for specific component patterns from your code
    const personalizedDashboard = await page.locator('[data-testid*="dashboard"], [class*="dashboard"]').count();
    const postsWrapper = await page.locator('[data-testid*="posts"], [class*="posts-wrapper"]').count();
    const clientPosts = await page.locator('[data-testid*="client-posts"]').count();
    
    console.log(`🏠 Personalized dashboard elements: ${personalizedDashboard}`);
    console.log(`📄 Posts wrapper elements: ${postsWrapper}`);
    console.log(`👥 Client posts elements: ${clientPosts}`);
    
    // Check for error messages
    const errorMessages = await page.locator('text=/error|오류|Error|ERROR/i').count();
    const loadingMessages = await page.locator('text=/loading|로딩|Loading/i').count();
    
    console.log(`❌ Error messages visible: ${errorMessages}`);
    console.log(`⏳ Loading messages visible: ${loadingMessages}`);
    
    // Check if any actual posts or content are displayed
    const visibleText = await page.textContent('main') || await page.textContent('body');
    const hasActualContent = visibleText.length > 100; // Assuming meaningful content is longer
    
    console.log(`📖 Page has substantial content: ${hasActualContent ? 'Yes' : 'No'}`);
    console.log(`📏 Content length: ${visibleText.length} characters`);
    
    await page.screenshot({ 
      path: 'deployed-feed-analysis.png', 
      fullPage: true 
    });
  });
});