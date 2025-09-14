const { chromium } = require('playwright');

async function analyzeWithAuth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to the website...');
    await page.goto('https://newbeginning-seven.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'production-homepage.png', fullPage: true });
    console.log('Homepage screenshot saved');
    
    console.log('Attempting to access write page directly...');
    await page.goto('https://newbeginning-seven.vercel.app/write');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'production-write-page.png', fullPage: true });
    
    // Check what's on the write page
    const title = await page.title();
    console.log(`Write page title: ${title}`);
    
    // Look for forms on the write page
    const forms = await page.locator('form').all();
    const inputs = await page.locator('input, textarea, select').all();
    console.log(`Found ${forms.length} forms and ${inputs.length} inputs on write page`);
    
    // If there's a login form, try to understand its structure
    if (inputs.length > 0) {
      console.log('Analyzing input fields:');
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        const id = await input.getAttribute('id');
        
        console.log(`  ${i + 1}. ${tagName}[${type || 'text'}] - name: "${name}", id: "${id}", placeholder: "${placeholder}"`);
      }
    }
    
    // Try to access the form through different routes
    const routesToTry = [
      '/create',
      '/post',
      '/new-post',
      '/글쓰기',
      '/community/write'
    ];
    
    for (const route of routesToTry) {
      try {
        console.log(`\nTrying route: ${route}`);
        await page.goto(`https://newbeginning-seven.vercel.app${route}`);
        await page.waitForLoadState('networkidle');
        
        const routeTitle = await page.title();
        const routeInputs = await page.locator('input, textarea, select').count();
        const routeForms = await page.locator('form').count();
        
        console.log(`Route ${route}: title="${routeTitle}", forms=${routeForms}, inputs=${routeInputs}`);
        
        if (routeInputs > 2) { // More than just login form
          await page.screenshot({ path: `production-${route.replace('/', '')}.png`, fullPage: true });
          console.log(`Found potential post form at ${route}!`);
          
          // Analyze the form structure
          const allInputs = await page.locator('input, textarea, select').all();
          console.log('Form structure analysis:');
          
          for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            const tagName = await input.evaluate(el => el.tagName.toLowerCase());
            const type = await input.getAttribute('type');
            const name = await input.getAttribute('name');
            const placeholder = await input.getAttribute('placeholder');
            const id = await input.getAttribute('id');
            const required = await input.getAttribute('required');
            const maxLength = await input.getAttribute('maxlength');
            
            console.log(`    Field ${i + 1}: ${tagName}[${type || 'text'}]`);
            console.log(`      name: "${name}"`);
            console.log(`      id: "${id}"`);
            console.log(`      placeholder: "${placeholder}"`);
            console.log(`      required: ${required !== null}`);
            console.log(`      maxlength: ${maxLength}`);
            console.log('      ---');
          }
          
          // Look for option elements in select tags
          const selects = await page.locator('select').all();
          for (let i = 0; i < selects.length; i++) {
            const select = selects[i];
            const name = await select.getAttribute('name');
            const id = await select.getAttribute('id');
            const options = await select.locator('option').all();
            
            console.log(`    Select field: name="${name}", id="${id}"`);
            console.log('    Options:');
            
            for (let j = 0; j < Math.min(options.length, 10); j++) {
              const option = options[j];
              const value = await option.getAttribute('value');
              const text = await option.textContent();
              console.log(`      - value="${value}" text="${text}"`);
            }
            console.log('      ---');
          }
          
          break; // Found the form, no need to continue
        }
      } catch (error) {
        console.log(`Route ${route} failed: ${error.message}`);
      }
    }
    
    // Check for any JavaScript errors or console logs
    console.log('\nMonitoring console messages...');
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Check for API calls
    const apiCalls = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('supabase') || url.includes('/api/')) {
        apiCalls.push({
          method: request.method(),
          url: url,
          headers: request.headers()
        });
      }
    });
    
    // Wait for any additional network activity
    await page.waitForTimeout(3000);
    
    if (apiCalls.length > 0) {
      console.log('\nAPI calls detected:');
      apiCalls.forEach((call, index) => {
        console.log(`${index + 1}. ${call.method} ${call.url}`);
      });
    }
    
  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

analyzeWithAuth().catch(console.error);