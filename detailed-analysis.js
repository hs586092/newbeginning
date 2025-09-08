const { chromium } = require('playwright');

async function detailedAnalysis() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to the website...');
    await page.goto('https://newbeginning-seven.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Check for authentication - look for login/register buttons
    console.log('Checking authentication state...');
    const loginButtons = await page.locator('text=로그인, text=Login, button:has-text("로그인"), a:has-text("로그인")').all();
    const registerButtons = await page.locator('text=회원가입, text=Register, button:has-text("회원가입"), a:has-text("회원가입")').all();
    
    console.log(`Found ${loginButtons.length} login buttons and ${registerButtons.length} register buttons`);
    
    // Look for navigation menu items
    console.log('Analyzing navigation...');
    const navItems = await page.locator('nav a, header a, .nav a, .menu a').all();
    console.log(`Found ${navItems.length} navigation items`);
    
    for (let i = 0; i < Math.min(navItems.length, 20); i++) {
      const item = navItems[i];
      const text = await item.textContent();
      const href = await item.getAttribute('href');
      console.log(`Nav item ${i + 1}: "${text}" -> ${href}`);
    }
    
    // Try to find different routes that might contain forms
    const routesToCheck = [
      '/write',
      '/create',
      '/post',
      '/글쓰기',
      '/작성',
      '/new'
    ];
    
    for (const route of routesToCheck) {
      try {
        console.log(`\nTrying route: ${route}`);
        const url = `https://newbeginning-seven.vercel.app${route}`;
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        // Check if we got a valid page (not 404)
        const title = await page.title();
        const is404 = title.includes('404') || await page.locator('text=404, text="페이지를 찾을 수 없습니다"').count() > 0;
        
        if (!is404) {
          console.log(`Valid page found at ${route}`);
          await page.screenshot({ path: `route-${route.replace('/', '')}.png`, fullPage: true });
          
          // Analyze forms on this page
          const forms = await page.locator('form').all();
          const inputs = await page.locator('input, textarea, select').all();
          
          console.log(`Found ${forms.length} forms and ${inputs.length} inputs on ${route}`);
          
          if (inputs.length > 0) {
            for (let j = 0; j < inputs.length; j++) {
              const input = inputs[j];
              const tagName = await input.evaluate(el => el.tagName.toLowerCase());
              const type = await input.getAttribute('type');
              const name = await input.getAttribute('name');
              const placeholder = await input.getAttribute('placeholder');
              
              console.log(`  ${tagName}[${type || 'text'}] name="${name}" placeholder="${placeholder}"`);
            }
          }
        }
      } catch (error) {
        console.log(`Route ${route} failed: ${error.message}`);
      }
    }
    
    // Go back to homepage and look for floating action buttons or write buttons
    console.log('\nReturning to homepage to look for write buttons...');
    await page.goto('https://newbeginning-seven.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Look for buttons that might be write buttons
    const allButtons = await page.locator('button, .button, [role="button"]').all();
    console.log(`Found ${allButtons.length} button-like elements`);
    
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      const onclick = await button.getAttribute('onclick');
      
      if (text && (text.includes('글쓰기') || text.includes('작성') || text.includes('Write') || text.includes('글') || text.includes('Post'))) {
        console.log(`Potential write button found: "${text}" class="${className}" onclick="${onclick}"`);
        
        // Try clicking it
        try {
          await button.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `after-click-${i}.png`, fullPage: true });
          
          // Check if a form appeared
          const newForms = await page.locator('form').count();
          const newInputs = await page.locator('input, textarea').count();
          console.log(`After clicking: ${newForms} forms, ${newInputs} inputs`);
          
          if (newInputs > 0) {
            console.log('Form appeared! Analyzing...');
            const inputs = await page.locator('input, textarea, select').all();
            
            for (const input of inputs) {
              const tagName = await input.evaluate(el => el.tagName.toLowerCase());
              const type = await input.getAttribute('type');
              const name = await input.getAttribute('name');
              const placeholder = await input.getAttribute('placeholder');
              const required = await input.getAttribute('required');
              const value = await input.getAttribute('value');
              
              console.log(`  Form field: ${tagName}[${type || 'text'}]`);
              console.log(`    name: ${name}`);
              console.log(`    placeholder: ${placeholder}`);
              console.log(`    required: ${required !== null}`);
              console.log(`    value: ${value}`);
            }
            
            break; // Found the form, no need to continue
          }
        } catch (error) {
          console.log(`Could not click button: ${error.message}`);
        }
      }
    }
    
    // Check the browser's developer tools console for any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
    
    // Check network requests for API calls
    const apiCalls = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('supabase') || url.includes('/api/')) {
        apiCalls.push({
          method: request.method(),
          url: url,
          postData: request.postData()
        });
      }
    });
    
    // Wait for any remaining network activity
    await page.waitForTimeout(3000);
    
    console.log('\nAPI calls detected:');
    apiCalls.forEach(call => {
      console.log(`${call.method} ${call.url}`);
      if (call.postData) {
        console.log(`  Data: ${call.postData}`);
      }
    });
    
  } catch (error) {
    console.error('Error during detailed analysis:', error);
  } finally {
    await browser.close();
  }
}

detailedAnalysis().catch(console.error);