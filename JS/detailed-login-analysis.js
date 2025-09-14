const { chromium } = require('playwright');

async function detailedLoginAnalysis() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 300 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Enhanced network monitoring
    const networkLog = [];
    page.on('request', request => {
        networkLog.push({
            type: 'request',
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            timestamp: new Date().toISOString()
        });
    });
    
    page.on('response', async response => {
        try {
            const body = await response.text().catch(() => 'Could not read body');
            networkLog.push({
                type: 'response',
                url: response.url(),
                status: response.status(),
                headers: response.headers(),
                body: body.substring(0, 1000), // First 1000 chars
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.log('Error reading response:', e.message);
        }
    });
    
    // Enhanced console monitoring
    page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR]:`, error.message);
    });
    
    try {
        console.log('🔍 Detailed Login Analysis Starting...\n');
        
        // Navigate to login
        await page.goto('https://newbeginning-seven.vercel.app/login', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('✅ Navigated to login page');
        await page.waitForTimeout(2000);
        
        // Analyze form structure
        console.log('\n📋 Form Analysis:');
        const form = await page.locator('form').first();
        const formExists = await form.count() > 0;
        console.log(`Form element exists: ${formExists}`);
        
        if (formExists) {
            const formAction = await form.getAttribute('action');
            const formMethod = await form.getAttribute('method');
            console.log(`Form action: ${formAction}`);
            console.log(`Form method: ${formMethod}`);
        }
        
        // Test with realistic credentials
        const emailInput = await page.locator('input[type="email"]').first();
        const passwordInput = await page.locator('input[type="password"]').first();
        const submitButton = await page.locator('button[type="submit"], button:has-text("로그인")').first();
        
        console.log('\n🧪 Testing with realistic credentials...');
        await emailInput.fill('testuser@gmail.com');
        await passwordInput.fill('TestPassword123!');
        
        await page.screenshot({ path: 'detailed-filled-form.png', fullPage: true });
        
        // Clear network log before submission
        networkLog.length = 0;
        
        // Submit form and monitor
        console.log('Submitting form...');
        await submitButton.click();
        
        // Wait for potential network activity
        await page.waitForTimeout(5000);
        
        console.log('\n📡 Network Activity During Login:');
        const loginRequests = networkLog.filter(log => 
            log.url.includes('/api/') || 
            log.url.includes('/auth/') ||
            log.url.includes('supabase') ||
            log.type === 'request' && log.method === 'POST'
        );
        
        loginRequests.forEach(log => {
            if (log.type === 'request') {
                console.log(`📤 REQUEST: ${log.method} ${log.url}`);
                if (log.postData) {
                    console.log(`   Data: ${log.postData.substring(0, 200)}...`);
                }
            } else {
                console.log(`📥 RESPONSE: ${log.status} ${log.url}`);
                if (log.body && log.body.trim()) {
                    console.log(`   Body: ${log.body.substring(0, 300)}...`);
                }
            }
        });
        
        await page.screenshot({ path: 'detailed-after-submit.png', fullPage: true });
        
        // Check for validation messages
        console.log('\n⚠️ Checking for validation messages...');
        const errorMessages = await page.locator('.error, [role="alert"], .text-red-500, .text-red-600').allTextContents();
        if (errorMessages.length > 0) {
            console.log('Error messages found:', errorMessages);
        } else {
            console.log('No error messages visible');
        }
        
        // Check current page state
        console.log(`\n📍 Current URL: ${page.url()}`);
        console.log(`📍 Page title: ${await page.title()}`);
        
        // Check if still on login page vs redirected
        const currentPath = new URL(page.url()).pathname;
        if (currentPath === '/login') {
            console.log('❌ Still on login page - login likely failed');
        } else {
            console.log('✅ Redirected - login may have succeeded');
        }
        
        // Test signup flow
        console.log('\n🆕 Testing signup flow...');
        const signupLink = await page.locator('a:has-text("회원가입"), a:has-text("계정이 없으신가요")').first();
        if (await signupLink.count() > 0) {
            await signupLink.click();
            await page.waitForTimeout(2000);
            console.log(`Signup page URL: ${page.url()}`);
            await page.screenshot({ path: 'signup-page.png', fullPage: true });
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        await page.screenshot({ path: 'analysis-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

detailedLoginAnalysis().then(() => {
    console.log('\n✅ Detailed analysis completed!');
}).catch(console.error);