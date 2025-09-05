const { chromium } = require('playwright');

async function comprehensiveValidation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Comprehensive tracking
  const allRequests = [];
  const allResponses = [];
  const consoleMessages = [];
  
  page.on('request', request => {
    allRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers()
    });
  });
  
  page.on('response', response => {
    allResponses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers()
    });
  });
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  try {
    console.log('🔍 TECHNICAL FIXES VALIDATION REPORT');
    console.log('=====================================\n');
    
    // Navigate and wait
    console.log('1️⃣ LOADING SITE...');
    await page.goto('https://newbeginning-seven.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for potential async operations
    await page.waitForTimeout(5000);
    
    console.log('✅ Site loaded successfully\n');
    
    // 2. API ERRORS CHECK
    console.log('2️⃣ API ERRORS CHECK');
    console.log('-------------------');
    
    const apiCalls = allResponses.filter(r => 
      r.url.includes('supabase') || 
      r.url.includes('posts') ||
      r.url.includes('api')
    );
    
    const apiErrors = apiCalls.filter(r => r.status >= 400);
    
    console.log(`📊 Total API calls: ${apiCalls.length}`);
    console.log(`❌ API errors: ${apiErrors.length}`);
    
    apiCalls.forEach(call => {
      const status = call.status >= 400 ? '❌' : '✅';
      console.log(`  ${status} ${call.status} - ${call.url}`);
    });
    
    // 3. IMAGE LOADING CHECK
    console.log('\n3️⃣ IMAGE LOADING CHECK');
    console.log('----------------------');
    
    const imageRequests = allResponses.filter(r => 
      r.url.includes('.jpg') || 
      r.url.includes('.png') || 
      r.url.includes('.gif') ||
      r.url.includes('image')
    );
    
    const imageErrors = imageRequests.filter(r => r.status === 404);
    
    console.log(`📊 Total image requests: ${imageRequests.length}`);
    console.log(`❌ Image 404 errors: ${imageErrors.length}`);
    
    imageErrors.forEach(err => {
      console.log(`  ❌ 404 - ${err.url}`);
    });
    
    // Check for specific images mentioned
    const sleepingBabyErrors = imageRequests.filter(r => 
      r.url.includes('sleeping-baby.jpg') && r.status === 404
    );
    const ultrasoundErrors = imageRequests.filter(r => 
      r.url.includes('ultrasound.jpg') && r.status === 404
    );
    
    console.log(`🛌 sleeping-baby.jpg errors: ${sleepingBabyErrors.length}`);
    console.log(`🏥 ultrasound.jpg errors: ${ultrasoundErrors.length}`);
    
    // 4. DATA LOADING VALIDATION
    console.log('\n4️⃣ DATA LOADING VALIDATION');
    console.log('--------------------------');
    
    // Check for posts
    const posts = await page.$$eval('[class*="post"], article, .card', elements => 
      elements.map(el => ({
        text: el.textContent.trim().substring(0, 100),
        hasTitle: !!el.querySelector('h1, h2, h3, .title'),
        hasAuthor: !!el.querySelector('.author, [class*="author"]'),
        hasCategory: !!el.querySelector('.category, [class*="category"]')
      }))
    ).catch(() => []);
    
    console.log(`📝 Posts found: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log('📄 Post details:');
      posts.slice(0, 3).forEach((post, i) => {
        console.log(`  Post ${i + 1}:`);
        console.log(`    ✅ Has title: ${post.hasTitle}`);
        console.log(`    ✅ Has author: ${post.hasAuthor}`);
        console.log(`    ✅ Has category: ${post.hasCategory}`);
        console.log(`    📝 Preview: ${post.text.substring(0, 50)}...`);
      });
    }
    
    // Check for loading states
    const loadingElements = await page.$('.loading, [class*="loading"], .spinner').then(el => !!el);
    console.log(`⏳ Loading states present: ${loadingElements}`);
    
    // 5. ERROR HANDLING TEST
    console.log('\n5️⃣ ERROR HANDLING TEST');
    console.log('----------------------');
    
    const consoleErrors = consoleMessages.filter(m => m.type === 'error');
    const consoleWarnings = consoleMessages.filter(m => m.type === 'warning');
    
    console.log(`❌ Console errors: ${consoleErrors.length}`);
    console.log(`⚠️ Console warnings: ${consoleWarnings.length}`);
    
    consoleErrors.forEach(err => {
      console.log(`  ❌ ${err.text}`);
    });
    
    consoleWarnings.slice(0, 3).forEach(warn => {
      console.log(`  ⚠️ ${warn.text}`);
    });
    
    // 6. OVERALL STATUS
    console.log('\n6️⃣ OVERALL VALIDATION STATUS');
    console.log('============================');
    
    const totalErrors = apiErrors.length + imageErrors.length + consoleErrors.length;
    const hasContent = posts.length > 0;
    const hasWorkingContent = posts.some(p => p.hasTitle);
    
    console.log(`📊 Total errors detected: ${totalErrors}`);
    console.log(`📝 Content loading: ${hasContent ? '✅' : '❌'}`);
    console.log(`🎯 Functional content: ${hasWorkingContent ? '✅' : '❌'}`);
    
    if (totalErrors === 0 && hasWorkingContent) {
      console.log('\n🎉 ALL TECHNICAL FIXES VALIDATED SUCCESSFULLY!');
    } else {
      console.log('\n⚠️ Some issues still present:');
      if (apiErrors.length > 0) console.log('  - API errors still occurring');
      if (imageErrors.length > 0) console.log('  - Image loading issues persist');
      if (consoleErrors.length > 0) console.log('  - Console errors present');
      if (!hasWorkingContent) console.log('  - Content not loading properly');
    }
    
    // Take comprehensive screenshots
    console.log('\n📸 Taking screenshots...');
    await page.screenshot({ path: 'validation-full-page.png', fullPage: true });
    
    // Screenshot of just the main content area
    const mainContent = await page.$('main, .main, #main, body > div');
    if (mainContent) {
      await mainContent.screenshot({ path: 'validation-main-content.png' });
    }
    
    console.log('✅ Screenshots saved');
    console.log('\n📋 VALIDATION COMPLETE');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

comprehensiveValidation().catch(console.error);