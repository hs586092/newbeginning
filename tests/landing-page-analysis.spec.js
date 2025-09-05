const { test, expect, devices } = require('@playwright/test');

test.describe('Landing Page Comprehensive Analysis', () => {
  
  test('Complete Landing Page Analysis - Desktop & Mobile', async ({ page }) => {
    const url = 'https://newbeginning-seven.vercel.app/';
    
    // Desktop Analysis
    console.log('\n🖥️ DESKTOP ANALYSIS (1280x720)');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('✅ Landing page loaded successfully');
      
      // Take full page screenshot
      await page.screenshot({
        path: 'test-results/landing-desktop-full.png',
        fullPage: true
      });
      console.log('📸 Desktop full page screenshot taken');
      
      // Check page title and basic elements
      const title = await page.title();
      console.log(`📝 Page Title: ${title}`);
      
      // Check for common navigation elements
      const navElements = await page.locator('nav').count();
      console.log(`🧭 Navigation elements found: ${navElements}`);
      
      // Check for main content sections
      const headings = await page.locator('h1, h2, h3').allTextContents();
      console.log('📋 Main headings found:', headings);
      
      // Check for buttons and CTAs
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      console.log(`🎯 Interactive elements - Buttons: ${buttons}, Links: ${links}`);
      
      // Check for images and media
      const images = await page.locator('img').count();
      console.log(`🖼️ Images found: ${images}`);
      
      // Check console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Test key interactive elements
      console.log('\n🔍 TESTING INTERACTIVE ELEMENTS');
      
      // Try to find and test main CTAs
      try {
        const mainCTA = page.locator('button, a').first();
        if (await mainCTA.count() > 0) {
          const ctaText = await mainCTA.textContent();
          console.log(`🎯 Main CTA found: "${ctaText}"`);
          await mainCTA.highlight();
        }
      } catch (error) {
        console.log('⚠️ Could not identify main CTA');
      }
      
      // Check for loading states
      console.log('\n⏳ CHECKING LOADING STATES');
      await page.waitForLoadState('networkidle');
      const loadingElements = await page.locator('[class*="loading"], [class*="skeleton"], .loading, .skeleton').count();
      console.log(`⚡ Loading/skeleton elements: ${loadingElements}`);
      
    } catch (error) {
      console.log('❌ Desktop analysis error:', error.message);
      await page.screenshot({
        path: 'test-results/landing-desktop-error.png'
      });
    }
    
    // Mobile Analysis
    console.log('\n📱 MOBILE ANALYSIS (375x667)');
    await page.setViewportSize({ width: 375, height: 667 });
    
    try {
      await page.reload({ waitUntil: 'networkidle' });
      
      // Take mobile screenshot
      await page.screenshot({
        path: 'test-results/landing-mobile-full.png',
        fullPage: true
      });
      console.log('📸 Mobile full page screenshot taken');
      
      // Check mobile-specific elements
      const hamburgerMenu = await page.locator('[aria-label*="menu"], .hamburger, [class*="hamburger"]').count();
      console.log(`🍔 Mobile menu elements: ${hamburgerMenu}`);
      
      // Check responsive behavior
      const mobileHidden = await page.locator('[class*="hidden"], [class*="md:"], [class*="lg:"]').count();
      console.log(`📱 Responsive classes found: ${mobileHidden}`);
      
    } catch (error) {
      console.log('❌ Mobile analysis error:', error.message);
      await page.screenshot({
        path: 'test-results/landing-mobile-error.png'
      });
    }
    
    // Performance Analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS');
    try {
      const performanceTiming = await page.evaluate(() => {
        const timing = performance.timing;
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          fullyLoaded: timing.loadEventEnd - timing.navigationStart,
          domInteractive: timing.domInteractive - timing.navigationStart
        };
      });
      
      console.log('🚀 Performance Metrics:');
      console.log(`  - DOM Interactive: ${performanceTiming.domInteractive}ms`);
      console.log(`  - DOM Content Loaded: ${performanceTiming.domContentLoaded}ms`);
      console.log(`  - Fully Loaded: ${performanceTiming.fullyLoaded}ms`);
      
    } catch (error) {
      console.log('⚠️ Performance analysis not available');
    }
    
    console.log('\n✅ Landing page analysis completed!');
  });
  
  test('User Experience Flow Analysis', async ({ page }) => {
    const url = 'https://newbeginning-seven.vercel.app/';
    
    console.log('\n🎯 USER EXPERIENCE FLOW ANALYSIS');
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Test navigation flow
    console.log('\n🧭 NAVIGATION FLOW TESTING');
    
    try {
      // Find all clickable elements
      const clickableElements = await page.locator('a, button').all();
      console.log(`🔗 Found ${clickableElements.length} clickable elements`);
      
      // Take screenshot of initial state
      await page.screenshot({
        path: 'test-results/ux-initial-state.png'
      });
      
      // Test each clickable element (limit to first 10 to avoid timeout)
      const elementsToTest = clickableElements.slice(0, 10);
      
      for (let i = 0; i < elementsToTest.length; i++) {
        try {
          const element = elementsToTest[i];
          const text = await element.textContent() || `Element ${i}`;
          const href = await element.getAttribute('href');
          
          console.log(`🔍 Testing element ${i + 1}: "${text.trim()}"`);
          
          if (href && !href.startsWith('#')) {
            console.log(`  → Links to: ${href}`);
          }
          
          // Check if element is visible and enabled
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();
          
          console.log(`  → Visible: ${isVisible}, Enabled: ${isEnabled}`);
          
        } catch (error) {
          console.log(`  ⚠️ Error testing element ${i + 1}: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Navigation flow analysis error:', error.message);
    }
    
    // Content Analysis
    console.log('\n📝 CONTENT ANALYSIS');
    
    try {
      // Extract main content blocks
      const textContent = await page.textContent('body');
      const wordCount = textContent.split(/\s+/).length;
      console.log(`📊 Total word count: ${wordCount}`);
      
      // Look for key messaging elements
      const headlineElements = await page.locator('h1, h2, .headline, [class*="hero"], [class*="title"]').allTextContents();
      console.log('🎯 Key headlines:', headlineElements.filter(text => text.trim()));
      
      // Look for CTAs
      const ctaElements = await page.locator('button, [class*="cta"], [class*="button"], a[class*="btn"]').allTextContents();
      console.log('🎬 Call-to-actions found:', ctaElements.filter(text => text.trim()));
      
    } catch (error) {
      console.log('❌ Content analysis error:', error.message);
    }
    
    console.log('\n✅ UX flow analysis completed!');
  });
  
  test('Technical Issues Detection', async ({ page }) => {
    const url = 'https://newbeginning-seven.vercel.app/';
    
    console.log('\n🔧 TECHNICAL ISSUES DETECTION');
    
    const consoleErrors = [];
    const networkErrors = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Listen for network failures
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait a bit for any async errors to surface
    await page.waitForTimeout(2000);
    
    console.log('\n🚨 ERROR REPORT');
    console.log(`Console Errors: ${consoleErrors.length}`);
    consoleErrors.forEach(error => console.log(`  ❌ ${error}`));
    
    console.log(`Network Errors: ${networkErrors.length}`);
    networkErrors.forEach(error => console.log(`  🌐 ${error}`));
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.images);
      return images.filter(img => !img.complete || img.naturalWidth === 0).length;
    });
    console.log(`🖼️ Broken images: ${brokenImages}`);
    
    // Accessibility quick check
    console.log('\n♿ ACCESSIBILITY CHECK');
    try {
      const altTexts = await page.locator('img[alt]').count();
      const totalImages = await page.locator('img').count();
      console.log(`🖼️ Images with alt text: ${altTexts}/${totalImages}`);
      
      const skipLinks = await page.locator('a[href="#main"], a[href="#content"], [class*="skip"]').count();
      console.log(`🔗 Skip navigation links: ${skipLinks}`);
      
      const headingStructure = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      console.log(`📝 Heading structure: ${headingStructure.length} headings found`);
      
    } catch (error) {
      console.log('⚠️ Accessibility check error:', error.message);
    }
    
    console.log('\n✅ Technical analysis completed!');
  });
});