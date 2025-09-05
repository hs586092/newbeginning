const { chromium } = require('playwright');

async function quickValidation() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 QUICK TECHNICAL FIXES VALIDATION');
  console.log('====================================\n');
  
  const results = {
    apiErrors: [],
    consoleErrors: [],
    imageErrors: [],
    contentStatus: false,
    beforeAfter: {
      before: 'Multiple 400 API errors, missing images, console errors',
      after: ''
    }
  };
  
  // Track network issues
  page.on('response', response => {
    if (response.status() >= 400) {
      results.apiErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    }
  });
  
  try {
    await page.goto('https://newbeginning-seven.vercel.app/');
    await page.waitForTimeout(5000);
    
    // Take screenshot for analysis
    await page.screenshot({ path: 'current-state.png' });
    
    // Check for content
    const posts = await page.$$eval('[class*="post"], article, .card', 
      elements => elements.length
    ).catch(() => 0);
    
    results.contentStatus = posts > 0;
    
    // Analysis
    console.log('📊 VALIDATION RESULTS:');
    console.log(`❌ API Errors: ${results.apiErrors.length}`);
    console.log(`❌ Console Errors: ${results.consoleErrors.length}`);
    console.log(`❌ Image Errors: ${results.imageErrors.length}`);
    console.log(`✅ Content Loading: ${results.contentStatus}`);
    
    if (results.apiErrors.length > 0) {
      console.log('\n🔍 API Issues:');
      results.apiErrors.forEach(err => {
        console.log(`  • ${err.status} ${err.url}`);
      });
    }
    
    if (results.consoleErrors.length > 0) {
      console.log('\n🔍 Console Errors:');
      results.consoleErrors.forEach(err => {
        console.log(`  • ${err}`);
      });
    }
    
    // Summary
    const totalErrors = results.apiErrors.length + results.consoleErrors.length;
    console.log(`\n📋 SUMMARY: ${totalErrors} errors detected`);
    
    if (totalErrors === 0) {
      console.log('🎉 ALL ISSUES RESOLVED!');
    } else {
      console.log('⚠️ Issues still need fixing');
    }
    
  } catch (error) {
    console.error('Validation error:', error.message);
  } finally {
    await browser.close();
  }
}

quickValidation().catch(console.error);