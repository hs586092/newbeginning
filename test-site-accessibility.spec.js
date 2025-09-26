import { test, expect } from '@playwright/test';

test.describe('Site Accessibility Investigation', () => {
  test.beforeEach(async ({ page }) => {
    // Capture all console messages
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Capture network failures
    page.on('requestfailed', request => {
      console.log(`[NETWORK FAIL] ${request.url()}: ${request.failure()?.errorText}`);
    });

    // Capture responses with error status codes
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`[HTTP ERROR] ${response.status()} ${response.url()}`);
      }
    });
  });

  test('should investigate landing page accessibility', async ({ page }) => {
    console.log('🔍 Investigating fortheorlingas.com accessibility...');

    try {
      // Attempt to navigate to the main site
      await page.goto('https://fortheorlingas.com', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Check what actually loaded
      const title = await page.title();
      const url = page.url();
      console.log(`📄 Loaded page - Title: "${title}", URL: ${url}`);

      // Check for redirects or access restrictions
      if (url !== 'https://fortheorlingas.com' && url !== 'https://fortheorlingas.com/') {
        console.log(`🔄 REDIRECT DETECTED: ${url}`);
      }

      // Look for access restriction messages
      const bodyText = await page.locator('body').textContent();
      const accessDeniedKeywords = [
        'access denied', 'forbidden', '403', 'unauthorized', '401',
        '접근 거부', '접근 금지', '권한 없음', 'blocked', 'restricted'
      ];

      const hasAccessIssue = accessDeniedKeywords.some(keyword =>
        bodyText?.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasAccessIssue) {
        console.log('🚫 ACCESS RESTRICTION DETECTED');
        console.log(`Body contains: ${bodyText?.substring(0, 500)}...`);
      }

      // Check for authentication requirements
      const hasLoginForm = await page.locator('form').count() > 0;
      const hasAuthPrompt = bodyText?.includes('로그인') || bodyText?.includes('login');

      console.log(`🔐 Has login form: ${hasLoginForm}`);
      console.log(`🔐 Has auth prompt: ${hasAuthPrompt}`);

      // Take screenshot for analysis
      await page.screenshot({
        path: 'site-accessibility-analysis.png',
        fullPage: true
      });

    } catch (error) {
      console.log(`❌ Navigation failed: ${error.message}`);

      // Try alternative approaches
      console.log('🔄 Trying alternative access methods...');

      // Try with different user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      try {
        await page.goto('https://fortheorlingas.com', { timeout: 15000 });
        console.log('✅ Alternative access method worked');
      } catch (altError) {
        console.log(`❌ Alternative method also failed: ${altError.message}`);
      }
    }
  });

  test('should check www subdomain and different paths', async ({ page }) => {
    console.log('🌐 Testing different URL variations...');

    const urlsToTest = [
      'https://fortheorlingas.com',
      'https://www.fortheorlingas.com',
      'https://fortheorlingas.com/login',
      'https://fortheorlingas.com/auth/login',
      'https://www.fortheorlingas.com/auth/login'
    ];

    for (const url of urlsToTest) {
      console.log(`\n🔍 Testing: ${url}`);

      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        const status = response?.status();
        const finalUrl = page.url();
        const title = await page.title();

        console.log(`📊 Status: ${status}, Final URL: ${finalUrl}`);
        console.log(`📄 Title: ${title}`);

        if (status === 200 && !finalUrl.includes('error')) {
          console.log(`✅ ${url} - ACCESSIBLE`);
        } else {
          console.log(`⚠️ ${url} - Status ${status} or redirected`);
        }

      } catch (error) {
        console.log(`❌ ${url} - FAILED: ${error.message}`);
      }
    }
  });

  test('should analyze network requests and security headers', async ({ page }) => {
    console.log('🔍 Analyzing network traffic and security...');

    const requests = [];
    const responses = [];

    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers()
      });
    });

    try {
      await page.goto('https://fortheorlingas.com', { timeout: 15000 });

      // Analyze security headers
      const mainResponse = responses.find(r => r.url.includes('fortheorlingas.com'));
      if (mainResponse) {
        console.log('🛡️ Security Headers:');
        console.log('- Content-Security-Policy:', mainResponse.headers['content-security-policy'] || 'Not set');
        console.log('- X-Frame-Options:', mainResponse.headers['x-frame-options'] || 'Not set');
        console.log('- X-Content-Type-Options:', mainResponse.headers['x-content-type-options'] || 'Not set');
        console.log('- Referrer-Policy:', mainResponse.headers['referrer-policy'] || 'Not set');
      }

      // Check for access control headers
      const corsHeaders = responses.filter(r =>
        r.headers['access-control-allow-origin'] ||
        r.headers['access-control-allow-methods']
      );

      if (corsHeaders.length > 0) {
        console.log('🔒 CORS restrictions detected on some resources');
      }

      // Look for authentication redirects
      const authRedirects = responses.filter(r =>
        r.status >= 300 && r.status < 400 &&
        (r.headers.location?.includes('auth') || r.headers.location?.includes('login'))
      );

      if (authRedirects.length > 0) {
        console.log('🔐 Authentication redirects detected');
        authRedirects.forEach(redirect => {
          console.log(`  - ${redirect.status} redirect to: ${redirect.headers.location}`);
        });
      }

    } catch (error) {
      console.log(`❌ Network analysis failed: ${error.message}`);
    }

    console.log(`📊 Total requests: ${requests.length}`);
    console.log(`📊 Total responses: ${responses.length}`);
  });
});