const { chromium } = require('playwright');

async function analyzeForm() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to the website...');
    await page.goto('https://newbeginning-seven.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'homepage.png', fullPage: true });
    console.log('Homepage screenshot saved as homepage.png');
    
    // Look for the post creation form link (글쓰기)
    console.log('Looking for post creation form...');
    
    // Check for various possible selectors for the write/post creation button
    const writeSelectors = [
      'text=글쓰기',
      'text=Write',
      'text=작성',
      'text=포스트 작성',
      '[href*="write"]',
      '[href*="create"]',
      '[href*="post"]',
      'button:has-text("글쓰기")',
      'a:has-text("글쓰기")',
      '.write-button',
      '#write-btn'
    ];
    
    let writeButton = null;
    for (const selector of writeSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          writeButton = element;
          console.log(`Found write button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (writeButton) {
      console.log('Clicking on write button...');
      await writeButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'write-form.png', fullPage: true });
      console.log('Write form screenshot saved as write-form.png');
    } else {
      console.log('Write button not found, checking current page for form elements...');
    }
    
    // Analyze form fields on current page
    console.log('Analyzing form fields...');
    
    // Get all form elements
    const forms = await page.locator('form').all();
    console.log(`Found ${forms.length} forms on the page`);
    
    for (let i = 0; i < forms.length; i++) {
      console.log(`\n--- Form ${i + 1} ---`);
      const form = forms[i];
      
      // Get form attributes
      const formAction = await form.getAttribute('action');
      const formMethod = await form.getAttribute('method');
      console.log(`Form action: ${formAction}, method: ${formMethod}`);
      
      // Get all input fields
      const inputs = await form.locator('input, textarea, select').all();
      console.log(`Found ${inputs.length} input fields`);
      
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j];
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const id = await input.getAttribute('id');
        const placeholder = await input.getAttribute('placeholder');
        const required = await input.getAttribute('required');
        const className = await input.getAttribute('class');
        
        console.log(`  Input ${j + 1}: ${tagName}${type ? `[type="${type}"]` : ''}`);
        console.log(`    name: ${name}`);
        console.log(`    id: ${id}`);
        console.log(`    placeholder: ${placeholder}`);
        console.log(`    required: ${required}`);
        console.log(`    class: ${className}`);
      }
    }
    
    // Check for any other input fields outside forms
    const allInputs = await page.locator('input, textarea, select').all();
    console.log(`\nTotal input fields on page: ${allInputs.length}`);
    
    // Check console errors
    console.log('\nChecking console messages...');
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Wait a bit for any console messages to appear
    await page.waitForTimeout(3000);
    
    // Check network requests
    console.log('\nMonitoring network requests...');
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('api')) {
        console.log(`API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('api')) {
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });
    
    // Try to trigger any form submission to see what data is sent
    const submitButtons = await page.locator('button[type="submit"], input[type="submit"]').all();
    console.log(`\nFound ${submitButtons.length} submit buttons`);
    
    // Get page content for further analysis
    const pageContent = await page.content();
    
    // Look for React/Next.js related form components
    const hasReact = pageContent.includes('react') || pageContent.includes('_next');
    console.log(`React/Next.js detected: ${hasReact}`);
    
    // Check for any database-related errors or logs
    await page.evaluate(() => {
      console.log('Current localStorage:', localStorage);
      console.log('Current sessionStorage:', sessionStorage);
    });
    
  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

analyzeForm().catch(console.error);