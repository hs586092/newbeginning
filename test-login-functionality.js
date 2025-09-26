/**
 * Test script to validate login functionality
 * Run with: node test-login-functionality.js
 */

import https from 'https';

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`📍 URL: ${url}`);

    const req = https.get(url, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, {
        'content-type': res.headers['content-type'],
        'x-matched-path': res.headers['x-matched-path'],
        'x-vercel-cache': res.headers['x-vercel-cache']
      });

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Check for authentication-related content
        const hasLoginForm = data.includes('로그인') || data.includes('login');
        const hasLoadingState = data.includes('로딩') || data.includes('loading');
        const hasErrorMessage = data.includes('error') || data.includes('오류');

        console.log(`✅ Page loaded: ${res.statusCode === 200}`);
        console.log(`📝 Has login form: ${hasLoginForm}`);
        console.log(`⏳ Has loading states: ${hasLoadingState}`);
        console.log(`❌ Has error messages: ${hasErrorMessage}`);

        resolve({
          status: res.statusCode,
          hasLoginForm,
          hasLoadingState,
          hasErrorMessage,
          contentLength: data.length
        });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Request failed: ${err.message}`);
      resolve({ error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log('⏰ Request timeout');
      resolve({ error: 'timeout' });
    });
  });
}

async function runTests() {
  console.log('🚀 Starting login functionality tests...');

  const baseUrl = 'https://www.fortheorlingas.com';

  const tests = [
    { url: `${baseUrl}`, description: 'Homepage accessibility' },
    { url: `${baseUrl}/auth/login`, description: 'Login page accessibility' },
    { url: `${baseUrl}/auth/signup`, description: 'Signup page accessibility' },
    { url: `${baseUrl}/auth/callback`, description: 'OAuth callback endpoint' }
  ];

  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    results.push({ ...test, result });

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Test Summary:');
  console.log('================');
  results.forEach(({ description, result }) => {
    const status = result.error ? '❌ FAILED' : '✅ PASSED';
    console.log(`${status} ${description}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else {
      console.log(`   Status: ${result.status}, Content: ${result.contentLength} bytes`);
    }
  });

  // Check for potential infinite loading issues
  const loginTest = results.find(r => r.description.includes('Login page'));
  if (loginTest && loginTest.result.hasLoadingState) {
    console.log('\n⚠️  WARNING: Login page may have loading state issues');
    console.log('   Check browser console for infinite loading loops');
  }

  console.log('\n✅ All tests completed');
  console.log('🔗 Test login manually at: https://www.fortheorlingas.com/auth/login');
}

runTests().catch(console.error);