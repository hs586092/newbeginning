const { chromium } = require('playwright');

async function validateTechnicalFixes() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Track network requests and console messages
  const networkErrors = [];
  const consoleErrors = [];
  const apiCalls = [];
  
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    // Track Supabase API calls
    if (url.includes('supabase') || url.includes('posts')) {
      apiCalls.push({ url, status, statusText: response.statusText() });
    }
    
    // Track network errors
    if (status >= 400) {
      networkErrors.push({ url, status, statusText: response.statusText() });
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  console.log('🚀 Navigating to https://newbeginning-seven.vercel.app/...');
  
  try {
    // Navigate to the site
    await page.goto('https://newbeginning-seven.vercel.app/', { waitUntil: 'networkidle' });
    
    console.log('📊 Taking initial screenshot...');
    await page.screenshot({ path: 'initial-page.png', fullPage: true });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking API calls and errors...');
    console.log(`API Calls (${apiCalls.length}):`, apiCalls);
    console.log(`Network Errors (${networkErrors.length}):`, networkErrors);
    console.log(`Console Errors (${consoleErrors.length}):`, consoleErrors);
    
    // Check for posts container
    const postsContainer = await page.$('[data-testid="posts-container"], .posts-wrapper, main');
    if (postsContainer) {
      console.log('✅ Posts container found');
      
      // Check for individual posts
      const posts = await page.$$('.post, [data-testid="post"], article');
      console.log(`📝 Found ${posts.length} posts`);
      
      if (posts.length > 0) {
        // Check first post details
        const firstPost = posts[0];
        const title = await firstPost.$eval('h2, h3, .title', el => el.textContent).catch(() => 'No title found');
        const author = await firstPost.$eval('.author, [data-testid="author"]', el => el.textContent).catch(() => 'No author found');
        const category = await firstPost.$eval('.category, [data-testid="category"]', el => el.textContent).catch(() => 'No category found');
        
        console.log('📄 First post details:');
        console.log(`  Title: ${title}`);
        console.log(`  Author: ${author}`);
        console.log(`  Category: ${category}`);
      }
    }
    
    // Check for images
    const images = await page.$$('img');
    console.log(`🖼️ Found ${images.length} images`);
    
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      console.log(`  Image ${i + 1}: ${src} (alt: ${alt})`);
    }
    
    // Check network tab for specific errors
    console.log('\n🔍 Detailed Network Analysis:');
    console.log('API Calls:', JSON.stringify(apiCalls, null, 2));
    console.log('Network Errors:', JSON.stringify(networkErrors, null, 2));
    console.log('Console Errors:', JSON.stringify(consoleErrors, null, 2));
    
    // Take final screenshot
    console.log('📊 Taking final screenshot...');
    await page.screenshot({ path: 'final-page.png', fullPage: true });
    
    // Open developer tools to check network tab
    console.log('🔧 Opening developer tools for manual inspection...');
    await page.evaluate(() => {
      // This will help us see the network tab
      console.log('Developer tools should be visible for network inspection');
    });
    
    // Keep browser open for manual inspection
    console.log('✋ Browser will stay open for manual inspection. Press Ctrl+C when done.');
    await page.waitForTimeout(30000); // Keep open for 30 seconds
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
  } finally {
    await browser.close();
  }
}

validateTechnicalFixes().catch(console.error);