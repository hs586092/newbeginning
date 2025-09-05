const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLoginFunctionality() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 // Slow down for better observation
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
    });
    
    // Monitor network requests
    const networkRequests = [];
    page.on('request', request => {
        networkRequests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            timestamp: new Date().toISOString()
        });
    });
    
    page.on('response', response => {
        console.log(`[NETWORK] ${response.status()} ${response.url()}`);
    });
    
    try {
        console.log('🎯 Starting login functionality test...\n');
        
        // 1. Navigate to login page
        console.log('1. Navigating to login page...');
        await page.goto('https://newbeginning-seven.vercel.app/login', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ path: 'login-page-initial.png', fullPage: true });
        console.log('✅ Screenshot saved: login-page-initial.png\n');
        
        // Wait for page to fully load
        await page.waitForTimeout(2000);
        
        // 2. Check page elements
        console.log('2. Analyzing page elements...');
        
        const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passwordInput = await page.locator('input[type="password"], input[name="password"]');
        const loginButton = await page.locator('button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in"), [type="submit"]');
        const googleButton = await page.locator('button:has-text("Google"), button:has-text("Continue with Google"), [data-provider="google"]');
        
        console.log(`Email input found: ${await emailInput.count() > 0}`);
        console.log(`Password input found: ${await passwordInput.count() > 0}`);
        console.log(`Login button found: ${await loginButton.count() > 0}`);
        console.log(`Google button found: ${await googleButton.count() > 0}\n`);
        
        // 3. Test form validation
        console.log('3. Testing form validation...');
        
        if (await loginButton.count() > 0) {
            // Try submitting empty form
            await loginButton.first().click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'empty-form-validation.png', fullPage: true });
            console.log('✅ Screenshot saved: empty-form-validation.png');
        }
        
        // 4. Test with invalid email
        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
            console.log('Testing invalid email format...');
            await emailInput.first().fill('invalid-email');
            await passwordInput.first().fill('password123');
            
            if (await loginButton.count() > 0) {
                await loginButton.first().click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: 'invalid-email-test.png', fullPage: true });
                console.log('✅ Screenshot saved: invalid-email-test.png');
            }
        }
        
        // 5. Test with valid-looking credentials
        console.log('\n5. Testing with test credentials...');
        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
            await emailInput.first().fill('test@example.com');
            await passwordInput.first().fill('testpassword123');
            
            await page.screenshot({ path: 'filled-form.png', fullPage: true });
            console.log('✅ Screenshot saved: filled-form.png');
            
            if (await loginButton.count() > 0) {
                // Monitor network traffic during submission
                const responsePromise = page.waitForResponse(response => 
                    response.url().includes('/auth/') || 
                    response.url().includes('/api/') ||
                    response.url().includes('supabase'), { timeout: 10000 }
                ).catch(() => null);
                
                await loginButton.first().click();
                console.log('Form submitted, waiting for response...');
                
                const response = await responsePromise;
                if (response) {
                    console.log(`Auth response: ${response.status()} ${response.url()}`);
                    const responseBody = await response.text().catch(() => 'Could not read response body');
                    console.log('Response body:', responseBody.substring(0, 500));
                }
                
                await page.waitForTimeout(3000);
                await page.screenshot({ path: 'after-login-attempt.png', fullPage: true });
                console.log('✅ Screenshot saved: after-login-attempt.png');
            }
        }
        
        // 6. Test Google OAuth
        console.log('\n6. Testing Google OAuth...');
        if (await googleButton.count() > 0) {
            try {
                const [popup] = await Promise.all([
                    context.waitForEvent('page', { timeout: 5000 }),
                    googleButton.first().click()
                ]);
                
                if (popup) {
                    console.log('Google OAuth popup opened');
                    await popup.screenshot({ path: 'google-oauth-popup.png', fullPage: true });
                    console.log('✅ Screenshot saved: google-oauth-popup.png');
                    await popup.close();
                } else {
                    console.log('No popup opened - checking for redirect...');
                    await page.waitForTimeout(2000);
                    console.log('Current URL after Google button click:', page.url());
                }
            } catch (error) {
                console.log('Google OAuth test failed:', error.message);
                await page.screenshot({ path: 'google-oauth-error.png', fullPage: true });
                console.log('✅ Screenshot saved: google-oauth-error.png');
            }
        }
        
        // 7. Test mobile responsiveness
        console.log('\n7. Testing mobile responsiveness...');
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'mobile-view.png', fullPage: true });
        console.log('✅ Screenshot saved: mobile-view.png');
        
        // 8. Check for any JavaScript errors
        console.log('\n8. Final page state analysis...');
        const title = await page.title();
        const url = page.url();
        console.log(`Final page title: ${title}`);
        console.log(`Final URL: ${url}`);
        
        // Log all network requests
        console.log('\n📊 Network Requests Summary:');
        const authRequests = networkRequests.filter(req => 
            req.url.includes('/auth/') || 
            req.url.includes('/api/') || 
            req.url.includes('supabase') ||
            req.url.includes('google')
        );
        
        authRequests.forEach(req => {
            console.log(`${req.method} ${req.url}`);
        });
        
        console.log(`\nTotal requests: ${networkRequests.length}`);
        console.log(`Auth-related requests: ${authRequests.length}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'error-state.png', fullPage: true });
        console.log('✅ Error screenshot saved: error-state.png');
    } finally {
        await browser.close();
    }
}

// Run the test
testLoginFunctionality().then(() => {
    console.log('\n🎉 Login functionality test completed!');
    console.log('Check the generated screenshots for visual analysis.');
}).catch(console.error);