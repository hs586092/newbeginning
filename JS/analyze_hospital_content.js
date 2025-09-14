const { chromium } = require('playwright');

async function analyzeHospitalContent() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('🌐 Navigating to https://newbeginning-seven.vercel.app/');
    await page.goto('https://newbeginning-seven.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Take full page screenshot first
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: '/Users/hyeonsoo/newbeginning/full_page_analysis.png', 
      fullPage: true 
    });

    // Search for hospital partnership text
    console.log('🔍 Searching for hospital partnership content...');
    
    const hospitalTexts = [
      '이미 많은 신뢰할 수 있는 병원들이 함께하고 있습니다',
      '마리아 대학병원',
      '세브란스',
      '삼성서울병원', 
      '차병원',
      '강남여성병원',
      '민으로산부인과',
      '파트너 병원',
      '협력 병원',
      '제휴 병원'
    ];

    const hospitalNames = [
      '마리아 대학병원', '세브란스', '삼성서울병원', '차병원',
      '강남여성병원', '민으로산부인과', '아산병원', '신촌세브란스',
      '강남세브란스', '삼성의료원', 'CHA병원'
    ];

    let foundContent = [];
    let screenshotCount = 1;

    // Check for text content
    for (const searchText of hospitalTexts) {
      try {
        const elements = await page.getByText(searchText, { exact: false }).all();
        if (elements.length > 0) {
          console.log(`✅ Found: "${searchText}" (${elements.length} instances)`);
          
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            
            // Scroll to element and highlight
            await element.scrollIntoViewIfNeeded();
            await element.highlight();
            
            // Get element info
            const boundingBox = await element.boundingBox();
            const textContent = await element.textContent();
            
            foundContent.push({
              type: 'text',
              searchText: searchText,
              foundText: textContent,
              boundingBox: boundingBox,
              screenshot: `hospital_content_${screenshotCount}.png`
            });

            // Take screenshot of this section
            await page.screenshot({ 
              path: `/Users/hyeonsoo/newbeginning/hospital_content_${screenshotCount}.png`,
              clip: boundingBox ? {
                x: Math.max(0, boundingBox.x - 50),
                y: Math.max(0, boundingBox.y - 50),
                width: Math.min(1920, boundingBox.width + 100),
                height: Math.min(1080, boundingBox.height + 100)
              } : undefined
            });
            
            screenshotCount++;
          }
        }
      } catch (error) {
        console.log(`❌ Text "${searchText}" not found or error: ${error.message}`);
      }
    }

    // Check for images that might contain hospital logos
    console.log('🖼️ Searching for hospital-related images...');
    const images = await page.locator('img').all();
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const title = await img.getAttribute('title');
      
      // Check if image might be hospital related
      const hospitalKeywords = ['hospital', '병원', 'medical', '의료', 'logo', '로고'];
      const imageText = `${src || ''} ${alt || ''} ${title || ''}`.toLowerCase();
      
      const isHospitalRelated = hospitalKeywords.some(keyword => 
        imageText.includes(keyword) || hospitalNames.some(hospital => 
          imageText.includes(hospital.toLowerCase())
        )
      );
      
      if (isHospitalRelated) {
        console.log(`🏥 Found potential hospital image: ${src}, alt: ${alt}`);
        
        await img.scrollIntoViewIfNeeded();
        const boundingBox = await img.boundingBox();
        
        if (boundingBox) {
          foundContent.push({
            type: 'image',
            src: src,
            alt: alt,
            title: title,
            boundingBox: boundingBox,
            screenshot: `hospital_image_${screenshotCount}.png`
          });

          await page.screenshot({ 
            path: `/Users/hyeonsoo/newbeginning/hospital_image_${screenshotCount}.png`,
            clip: {
              x: Math.max(0, boundingBox.x - 20),
              y: Math.max(0, boundingBox.y - 20),
              width: Math.min(1920, boundingBox.width + 40),
              height: Math.min(1080, boundingBox.height + 40)
            }
          });
          
          screenshotCount++;
        }
      }
    }

    // Check page content and structure
    console.log('📋 Analyzing page structure...');
    const pageTitle = await page.title();
    const url = page.url();
    
    // Get all text content to analyze
    const bodyText = await page.locator('body').textContent();
    
    // Look for partnership-related sections
    const sections = await page.locator('section, div[class*="section"], div[class*="container"]').all();
    
    for (let i = 0; i < Math.min(sections.length, 10); i++) {
      const section = sections[i];
      const sectionText = await section.textContent();
      const className = await section.getAttribute('class');
      
      // Check if section contains hospital content
      const hasHospitalContent = hospitalTexts.some(text => 
        sectionText?.includes(text)
      ) || hospitalNames.some(name => 
        sectionText?.includes(name)
      );
      
      if (hasHospitalContent) {
        console.log(`🎯 Found hospital content in section with class: ${className}`);
        
        await section.scrollIntoViewIfNeeded();
        const boundingBox = await section.boundingBox();
        
        if (boundingBox) {
          foundContent.push({
            type: 'section',
            className: className,
            textPreview: sectionText?.substring(0, 200) + '...',
            boundingBox: boundingBox,
            screenshot: `hospital_section_${screenshotCount}.png`
          });

          await page.screenshot({ 
            path: `/Users/hyeonsoo/newbeginning/hospital_section_${screenshotCount}.png`,
            clip: boundingBox
          });
          
          screenshotCount++;
        }
      }
    }

    // Generate analysis report
    console.log('\n📊 ANALYSIS RESULTS:');
    console.log(`Total hospital-related content found: ${foundContent.length} items`);
    console.log(`Page title: ${pageTitle}`);
    console.log(`URL: ${url}`);
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      url: url,
      pageTitle: pageTitle,
      totalItemsFound: foundContent.length,
      foundContent: foundContent,
      searchTerms: hospitalTexts,
      hospitalNames: hospitalNames,
      recommendations: {
        sectionsToRemove: [],
        textToReplace: [],
        imagesToRemove: []
      }
    };

    // Categorize findings for recommendations
    foundContent.forEach(item => {
      if (item.type === 'text') {
        if (item.searchText === '이미 많은 신뢰할 수 있는 병원들이 함께하고 있습니다') {
          report.recommendations.sectionsToRemove.push({
            type: 'trust_claim',
            content: item.foundText,
            action: 'Remove entire section - false partnership claim'
          });
        } else if (hospitalNames.includes(item.searchText)) {
          report.recommendations.textToReplace.push({
            type: 'hospital_name',
            content: item.foundText,
            action: 'Replace with generic placeholder or remove'
          });
        }
      } else if (item.type === 'image') {
        report.recommendations.imagesToRemove.push({
          type: 'hospital_logo',
          src: item.src,
          action: 'Remove or replace with generic medical icons'
        });
      }
    });

    await page.evaluate(() => {
      const reportData = arguments[0];
      console.log('\n🔍 DETAILED FINDINGS:');
      reportData.foundContent.forEach((item, index) => {
        console.log(`${index + 1}. ${item.type.toUpperCase()}: ${
          item.type === 'text' ? item.foundText?.substring(0, 100) + '...' :
          item.type === 'image' ? item.src :
          item.className
        }`);
      });
    }, report);

    // Write report to file
    require('fs').writeFileSync(
      '/Users/hyeonsoo/newbeginning/hospital_content_analysis.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n✅ Analysis complete! Check the generated screenshots and report.');
    console.log('📁 Files generated:');
    console.log('- full_page_analysis.png (full page screenshot)');
    console.log('- hospital_content_*.png (specific content screenshots)');
    console.log('- hospital_content_analysis.json (detailed report)');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

analyzeHospitalContent();