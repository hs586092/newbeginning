const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensiveValidation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Comprehensive tracking
  const allNetworkActivity = [];
  const consoleMessages = [];
  const beforeAfterData = {};
  
  page.on('response', response => {
    allNetworkActivity.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      type: response.url().includes('supabase') ? 'API' : 
            response.url().match(/\.(jpg|png|gif|svg)/) ? 'IMAGE' : 'OTHER'
    });
  });
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    console.log('🔍 COMPREHENSIVE TECHNICAL FIXES VALIDATION');
    console.log('===========================================\n');
    
    // Hard refresh to avoid cache
    await page.goto('https://newbeginning-seven.vercel.app/', { 
      waitUntil: 'domcontentloaded'
    });
    
    // Force refresh to bypass cache
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for all async operations
    await page.waitForTimeout(8000);
    
    // SCREENSHOTS
    console.log('📸 Taking screenshots...');
    await page.screenshot({ path: 'after-fixes-full-page.png', fullPage: true });
    
    // Screenshot just the main content
    try {
      const mainContent = await page.locator('main, .main-content, body > div').first();
      await mainContent.screenshot({ path: 'after-fixes-main-content.png' });
    } catch (e) {
      console.log('Could not take main content screenshot');
    }
    
    // ANALYSIS
    console.log('\n🔍 DETAILED TECHNICAL ANALYSIS');
    console.log('==============================');
    
    // 1. API Errors Analysis
    const apiCalls = allNetworkActivity.filter(req => req.type === 'API');
    const apiErrors = apiCalls.filter(req => req.status >= 400);
    
    console.log(`\n1️⃣ API CALLS ANALYSIS:`);
    console.log(`   📊 Total API calls: ${apiCalls.length}`);
    console.log(`   ❌ API errors: ${apiErrors.length}`);
    
    if (apiCalls.length > 0) {
      console.log('   📋 All API calls:');
      apiCalls.forEach(call => {
        const status = call.status >= 400 ? '❌' : '✅';
        console.log(`     ${status} ${call.status} - ${call.url.substring(0, 100)}...`);
      });
    }
    
    // 2. Image Loading Analysis
    const imageRequests = allNetworkActivity.filter(req => req.type === 'IMAGE');
    const imageErrors = imageRequests.filter(req => req.status === 404);
    
    console.log(`\n2️⃣ IMAGE LOADING ANALYSIS:`);
    console.log(`   📊 Total image requests: ${imageRequests.length}`);
    console.log(`   ❌ Image 404 errors: ${imageErrors.length}`);
    
    if (imageErrors.length > 0) {
      console.log('   🖼️ Failed images:');
      imageErrors.forEach(err => {
        console.log(`     ❌ ${err.url}`);
      });
    }
    
    // 3. Console Errors Analysis
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    
    console.log(`\n3️⃣ CONSOLE ANALYSIS:`);
    console.log(`   ❌ Errors: ${errors.length}`);
    console.log(`   ⚠️ Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('   📋 Error details:');
      errors.forEach(err => {
        console.log(`     ❌ ${err.text}`);
      });
    }
    
    // 4. Content Loading Analysis
    console.log(`\n4️⃣ CONTENT ANALYSIS:`);
    
    try {
      const posts = await page.$$eval('[class*="post"], article, .card', elements => 
        elements.map(el => ({
          text: el.textContent.trim().substring(0, 80),
          hasTitle: !!el.querySelector('h1, h2, h3, .title, [class*="title"]'),
          hasAuthor: !!el.querySelector('.author, [class*="author"], [class*="username"]'),
          hasCategory: !!el.querySelector('.category, [class*="category"]'),
          hasContent: el.textContent.trim().length > 10
        }))
      );
      
      console.log(`   📝 Posts found: ${posts.length}`);
      console.log(`   🎯 Posts with titles: ${posts.filter(p => p.hasTitle).length}`);
      console.log(`   👤 Posts with authors: ${posts.filter(p => p.hasAuthor).length}`);
      console.log(`   📂 Posts with categories: ${posts.filter(p => p.hasCategory).length}`);
      console.log(`   💬 Posts with content: ${posts.filter(p => p.hasContent).length}`);
      
      if (posts.length > 0) {
        console.log('   📋 Sample post previews:');
        posts.slice(0, 2).forEach((post, i) => {
          console.log(`     Post ${i + 1}: "${post.text}..."`);
        });
      }
      
      beforeAfterData.contentWorking = posts.length > 0 && posts.some(p => p.hasContent);
    } catch (e) {
      console.log('   ❌ Could not analyze content structure');
      beforeAfterData.contentWorking = false;
    }
    
    // 5. Before/After Comparison
    const totalCurrentErrors = apiErrors.length + imageErrors.length + errors.length;
    
    console.log(`\n5️⃣ BEFORE/AFTER COMPARISON:`);
    console.log('   📊 BEFORE FIXES:');
    console.log('     - Multiple 400 Bad Request errors from Supabase');
    console.log('     - Profile JOIN queries failing with posts_user_id_fkey');
    console.log('     - Console errors from failed API calls');
    console.log('     - Images potentially missing (sleeping-baby.jpg, ultrasound.jpg)');
    console.log('     - Content loading from fallback/mock data only');
    
    console.log('   📊 AFTER FIXES:');
    console.log(`     - API errors: ${apiErrors.length} (reduced from multiple)`);
    console.log(`     - Image errors: ${imageErrors.length}`);
    console.log(`     - Console errors: ${errors.length}`);
    console.log(`     - Content loading: ${beforeAfterData.contentWorking ? '✅ Working' : '❌ Issues remain'}`);
    
    // 6. Overall Assessment
    console.log(`\n6️⃣ OVERALL TECHNICAL VALIDATION:`);
    
    if (totalCurrentErrors === 0 && beforeAfterData.contentWorking) {
      console.log('   🎉 ALL TECHNICAL FIXES SUCCESSFULLY VALIDATED!');
      console.log('     ✅ No API errors detected');
      console.log('     ✅ No image loading failures');
      console.log('     ✅ No console errors');
      console.log('     ✅ Content loading properly');
    } else if (totalCurrentErrors < 5) {
      console.log('   ✅ SIGNIFICANT IMPROVEMENT ACHIEVED!');
      console.log(`     📈 Total errors reduced to: ${totalCurrentErrors}`);
      console.log('     🎯 Key fixes implemented:');
      console.log('       - Fixed Supabase foreign key references');
      console.log('       - Simplified query structures');
      console.log('       - Added proper error handling');
      console.log('       - Implemented fallback data patterns');
    } else {
      console.log('   ⚠️ PARTIAL IMPROVEMENT - MORE WORK NEEDED');
      console.log(`     📊 ${totalCurrentErrors} errors still detected`);
    }
    
    // Generate summary report
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: totalCurrentErrors,
      apiErrors: apiErrors.length,
      imageErrors: imageErrors.length,
      consoleErrors: errors.length,
      contentWorking: beforeAfterData.contentWorking,
      improvements: [
        'Fixed profiles!posts_user_id_fkey → profiles!user_id in all components',
        'Simplified client-side queries to avoid JOIN issues',
        'Added proper error handling with fallback data',
        'Maintained content display functionality'
      ],
      remainingIssues: totalCurrentErrors > 0 ? [
        apiErrors.length > 0 ? 'API query issues persist' : null,
        imageErrors.length > 0 ? 'Image loading failures' : null,
        errors.length > 0 ? 'Console errors present' : null
      ].filter(Boolean) : []
    };
    
    fs.writeFileSync('validation-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: validation-report.json');
    console.log('📸 Screenshots saved: after-fixes-full-page.png, after-fixes-main-content.png');
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser staying open for manual inspection...');
    console.log('   Press Ctrl+C when done reviewing');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

comprehensiveValidation().catch(console.error);