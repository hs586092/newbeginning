const { test, expect } = require('@playwright/test');

test.describe('Detailed Landing Page UX Analysis', () => {
  
  test('Comprehensive UX & Content Analysis with Screenshots', async ({ page }) => {
    const url = 'https://newbeginning-seven.vercel.app/';
    
    console.log('\n🎯 COMPREHENSIVE LANDING PAGE UX ANALYSIS');
    console.log('URL:', url);
    
    // Desktop Analysis - Primary Focus
    await page.setViewportSize({ width: 1440, height: 900 });
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('✅ Page loaded successfully');
      
      // === HERO SECTION ANALYSIS ===
      console.log('\n🏆 HERO SECTION ANALYSIS');
      
      await page.screenshot({
        path: '/Users/hyeonsoo/newbeginning/landing-hero-desktop.png',
        clip: { x: 0, y: 0, width: 1440, height: 600 }
      });
      
      // Analyze main headline
      const mainHeadline = await page.locator('h1').first().textContent();
      console.log(`📝 Main Headline: "${mainHeadline}"`);
      
      // Check for value proposition
      const subHeadlines = await page.locator('h2').allTextContents();
      console.log('🎯 Value Propositions:', subHeadlines);
      
      // Identify main CTAs
      const primaryCTAs = await page.locator('button, a').first().textContent();
      console.log(`🎬 Primary CTA: "${primaryCTAs}"`);
      
      // === NAVIGATION & USER FLOW ===
      console.log('\n🧭 NAVIGATION ANALYSIS');
      
      // Check user type selection
      const userTypes = await page.locator('[class*="button"], button').allTextContents();
      const userTypeButtons = userTypes.filter(text => 
        text.includes('맘') || text.includes('예비') || text.includes('신생아') || text.includes('성장기') || text.includes('선배')
      );
      console.log('👥 User Type Selection:', userTypeButtons);
      
      // Test user type button interaction
      try {
        const userTypeButton = page.locator('button:has-text("예비맘")');
        if (await userTypeButton.count() > 0) {
          await userTypeButton.hover();
          console.log('✅ User type button is interactive');
        }
      } catch (error) {
        console.log('⚠️ User type interaction issue:', error.message);
      }
      
      // === CONTENT CATEGORIZATION ANALYSIS ===
      console.log('\n📚 CONTENT CATEGORIES');
      
      await page.screenshot({
        path: '/Users/hyeonsoo/newbeginning/landing-categories-desktop.png',
        clip: { x: 0, y: 600, width: 1440, height: 500 }
      });
      
      // Find category buttons/links
      const categoryTexts = ['임신', '출산', '신생아', '이유식', '발달정보', '커뮤니티', '응급'];
      const foundCategories = [];
      
      for (const category of categoryTexts) {
        const categoryElement = page.locator(`text=${category}`);
        if (await categoryElement.count() > 0) {
          foundCategories.push(category);
        }
      }
      console.log('📊 Available Categories:', foundCategories);
      console.log(`📈 Category Coverage: ${foundCategories.length}/${categoryTexts.length} categories`);
      
      // === SOCIAL PROOF & TRUST SIGNALS ===
      console.log('\n🏆 SOCIAL PROOF ANALYSIS');
      
      // Look for user profiles, testimonials, stats
      const userProfiles = await page.locator('[class*="profile"], .user, [class*="avatar"]').count();
      console.log(`👤 User Profiles Visible: ${userProfiles}`);
      
      // Look for activity indicators
      const activityIndicators = await page.locator('text=/\\d+/').allTextContents();
      const stats = activityIndicators.filter(text => /^\d+$/.test(text.trim()));
      console.log('📊 Activity Stats:', stats);
      
      // Look for testimonials or user-generated content
      const testimonials = await page.locator('[class*="testimonial"], [class*="review"], [class*="comment"]').count();
      console.log(`💬 Testimonials/Reviews: ${testimonials}`);
      
      // === CONTENT PREVIEW ANALYSIS ===
      console.log('\n📰 CONTENT PREVIEW');
      
      await page.screenshot({
        path: '/Users/hyeonsoo/newbeginning/landing-content-preview.png',
        clip: { x: 0, y: 1100, width: 1440, height: 600 }
      });
      
      // Analyze preview posts/content
      const contentPreviews = await page.locator('[class*="post"], [class*="card"], [class*="item"]').count();
      console.log(`📝 Content Previews: ${contentPreviews}`);
      
      // Check for engagement metrics
      const engagementTexts = await page.locator('text=/댓글|좋아요|응원/').allTextContents();
      console.log('❤️ Engagement Indicators:', engagementTexts.slice(0, 5));
      
      // === MOBILE OPTIMIZATION CHECK ===
      console.log('\n📱 MOBILE RESPONSIVENESS');
      
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: '/Users/hyeonsoo/newbeginning/landing-mobile-full.png',
        fullPage: true
      });
      
      // Check mobile navigation
      const mobileNavElements = await page.locator('[class*="mobile"], [aria-label*="menu"]').count();
      console.log(`📱 Mobile Navigation Elements: ${mobileNavElements}`);
      
      // Check if main CTAs are still visible
      const mobileCTAVisible = await page.locator('button:has-text("여정 시작하기")').isVisible();
      console.log(`🎯 Main CTA Visible on Mobile: ${mobileCTAVisible}`);
      
      // === CONVERSION FUNNEL ANALYSIS ===
      console.log('\n🔄 CONVERSION FUNNEL');
      
      // Check the user journey flow
      const conversionSteps = [
        { step: 'Landing', element: 'h1', description: 'User arrives' },
        { step: 'Value Prop', element: 'h2', description: 'Sees value proposition' },
        { step: 'User Selection', element: 'button:has-text("예비맘")', description: 'Selects user type' },
        { step: 'Content Preview', element: '[class*="post"]', description: 'Views content' },
        { step: 'CTA', element: 'button:has-text("여정 시작하기")', description: 'Takes action' }
      ];
      
      for (let i = 0; i < conversionSteps.length; i++) {
        const step = conversionSteps[i];
        const elementExists = await page.locator(step.element).count() > 0;
        console.log(`${i + 1}. ${step.step}: ${elementExists ? '✅' : '❌'} ${step.description}`);
      }
      
      // === COMPETITIVE ADVANTAGES ===
      console.log('\n🏅 COMPETITIVE ANALYSIS PERSPECTIVE');
      
      const uniqueFeatures = [
        { feature: 'User Type Segmentation', indicator: 'button:has-text("예비맘")' },
        { feature: 'Stage-based Content', indicator: 'text=임신부터 첫돌까지' },
        { feature: 'Expert Consultation', indicator: 'text=전문의' },
        { feature: 'Community Aspect', indicator: 'text=커뮤니티' },
        { feature: 'Personal Journey', indicator: 'text=여정' }
      ];
      
      console.log('🎯 Unique Value Propositions Found:');
      for (const feature of uniqueFeatures) {
        const hasFeature = await page.locator(feature.indicator).count() > 0;
        if (hasFeature) {
          console.log(`  ✅ ${feature.feature}`);
        }
      }
      
      // === TECHNICAL PERFORMANCE ===
      console.log('\n⚡ TECHNICAL PERFORMANCE');
      
      // Check loading performance
      const loadTime = await page.evaluate(() => {
        return performance.timing.loadEventEnd - performance.timing.navigationStart;
      });
      console.log(`🚀 Page Load Time: ${loadTime}ms`);
      
      // Check for errors
      const pageErrors = await page.evaluate(() => {
        return window.performance.getEntriesByType('navigation')[0].loadEventEnd;
      });
      
      console.log('\n✅ Comprehensive analysis completed!');
      
    } catch (error) {
      console.log('❌ Analysis error:', error.message);
      await page.screenshot({
        path: '/Users/hyeonsoo/newbeginning/landing-error-state.png'
      });
    }
  });
  
  test('User Journey Simulation', async ({ page }) => {
    const url = 'https://newbeginning-seven.vercel.app/';
    
    console.log('\n🎭 USER JOURNEY SIMULATION');
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Simulate first-time visitor journey
    console.log('\n👤 First-time Visitor Journey:');
    
    // Step 1: Landing
    console.log('1. 🏠 Visitor lands on homepage');
    await page.screenshot({
      path: '/Users/hyeonsoo/newbeginning/journey-step1-landing.png'
    });
    
    // Step 2: Browse user types
    console.log('2. 👥 Exploring user types...');
    const userTypeButtons = await page.locator('button').allTextContents();
    const relevantTypes = userTypeButtons.filter(text => 
      text.includes('예비맘') || text.includes('신생아맘') || text.includes('성장기맘')
    );
    console.log('   Available user types:', relevantTypes);
    
    // Step 3: Try to select user type
    try {
      const expectantMotherBtn = page.locator('button:has-text("예비맘")');
      if (await expectantMotherBtn.count() > 0) {
        console.log('3. 🤰 Selecting "예비맘" user type');
        await expectantMotherBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: '/Users/hyeonsoo/newbeginning/journey-step3-usertype.png'
        });
      }
    } catch (error) {
      console.log('   ⚠️ User type selection not working:', error.message);
    }
    
    // Step 4: Explore content categories
    console.log('4. 📚 Browsing content categories');
    try {
      const pregnancyContent = page.locator('text=임신');
      if (await pregnancyContent.count() > 0) {
        await pregnancyContent.first().click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('   ⚠️ Category browsing issue:', error.message);
    }
    
    // Step 5: Attempt main conversion
    console.log('5. 🎯 Attempting main conversion action');
    try {
      const mainCTA = page.locator('button:has-text("여정 시작하기"), a:has-text("여정 시작하기")');
      if (await mainCTA.count() > 0) {
        console.log('   ✅ Found main CTA: "여정 시작하기"');
        await mainCTA.first().highlight();
        await page.screenshot({
          path: '/Users/hyeonsoo/newbeginning/journey-step5-cta.png'
        });
      }
    } catch (error) {
      console.log('   ⚠️ Main CTA interaction issue:', error.message);
    }
    
    console.log('\n✅ User journey simulation completed!');
  });
});