#!/usr/bin/env node

/**
 * Test sustainable database integration solution
 * Validates the new post service and transformer architecture
 */

import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:3000';

async function testSustainableSolution() {
  console.log('🧪 Testing sustainable database solution...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  try {
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`📋 Console: ${text}`);
    });

    console.log('1️⃣ Accessing homepage with new architecture...');
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Check for system status indicators
    console.log('\n2️⃣ Checking system status indicators...');

    const connectionStatus = await page.locator('text=데이터베이스 연결됨').count();
    const systemStatus = await page.locator('text=시스템 상태').count();
    const databaseSource = await page.locator('text=데이터 소스').count();

    console.log(`🔗 Connection indicator: ${connectionStatus > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`📊 System status panel: ${systemStatus > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`📂 Data source info: ${databaseSource > 0 ? '✅ Found' : '❌ Missing'}`);

    // Check for actual posts
    console.log('\n3️⃣ Checking for real database posts...');
    const postCards = await page.locator('article, [data-testid="post"], .post-card, div:has(button:has-text("포옹"))').count();
    console.log(`📝 Post cards found: ${postCards}개`);

    // Check if posts contain real database data
    if (postCards > 0) {
      try {
        const firstPostText = await page.locator('article, [data-testid="post"], .post-card').first().textContent();
        console.log(`📄 First post content preview: ${firstPostText?.substring(0, 100)}...`);

        // Check for database vs mock indicators
        if (firstPostText?.includes('테스트 게시글')) {
          console.log('✅ Real database posts detected');
        } else if (firstPostText?.includes('13개월 아기')) {
          console.log('⚠️ Mock posts still being used');
        } else {
          console.log('❓ Unknown post data source');
        }
      } catch (error) {
        console.log('❌ Could not read post content');
      }
    }

    // Test post interactions
    console.log('\n4️⃣ Testing post interaction buttons...');
    if (postCards > 0) {
      try {
        // Find like/hug buttons
        const hugButtons = await page.locator('button:has-text("포옹"), button:has(svg):has([data-testid="heart"])').count();
        const commentButtons = await page.locator('button:has-text("댓글"), button:has(svg):has([data-testid="message-circle"])').count();

        console.log(`❤️ Hug buttons: ${hugButtons}개`);
        console.log(`💬 Comment buttons: ${commentButtons}개`);

        if (hugButtons > 0) {
          console.log('Clicking first hug button...');
          await page.locator('button:has-text("포옹"), button:has(svg):has([data-testid="heart"])').first().click();
          await page.waitForTimeout(1000);
          console.log('✅ Hug button clicked');
        }
      } catch (error) {
        console.log('⚠️ Could not test interactions:', error.message);
      }
    }

    // Capture screenshot
    await page.screenshot({
      path: 'sustainable-solution-test.png',
      fullPage: true
    });
    console.log('📸 Screenshot: sustainable-solution-test.png');

    // Analyze logs for architecture validation
    console.log('\n5️⃣ Analyzing architecture logs...');
    const postServiceLogs = logs.filter(log => log.includes('PostService') || log.includes('posts from'));
    const transformerLogs = logs.filter(log => log.includes('Transforming') || log.includes('transformed'));
    const connectionLogs = logs.filter(log => log.includes('Database connection') || log.includes('연결'));

    console.log('🔍 Architecture validation:');
    console.log(`   Post Service: ${postServiceLogs.length > 0 ? '✅ Active' : '❌ Missing'}`);
    console.log(`   Data Transformer: ${transformerLogs.length > 0 ? '✅ Active' : '❌ Missing'}`);
    console.log(`   Connection Management: ${connectionLogs.length > 0 ? '✅ Active' : '❌ Missing'}`);

    if (postServiceLogs.length > 0) {
      console.log('📝 Post Service logs:');
      postServiceLogs.forEach(log => console.log(`   📋 ${log}`));
    }

    console.log('\n✨ Sustainable solution test completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testSustainableSolution().catch(console.error);