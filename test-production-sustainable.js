#!/usr/bin/env node

/**
 * Test production deployment with sustainable database solution
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://newbeginning-g8uqhmkt2-hs586092s-projects.vercel.app';

async function testProductionSustainable() {
  console.log('🚀 Testing production sustainable solution...\n');

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

    console.log('1️⃣ Accessing production deployment...');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);

    // Check system status indicators
    console.log('\n2️⃣ Checking sustainable architecture in production...');

    const connectionIndicator = await page.locator('text=데이터베이스 연결됨').count();
    const systemStatusPanel = await page.locator('text=시스템 상태').count();
    const dataSourceInfo = await page.locator('text=데이터 소스').count();

    console.log(`🔗 Database connection indicator: ${connectionIndicator > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`📊 System status panel: ${systemStatusPanel > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`📂 Data source information: ${dataSourceInfo > 0 ? '✅ Found' : '❌ Missing'}`);

    // Check for real posts
    const postCards = await page.locator('article, [data-testid="post"], .post-card, div:has(button:has-text("포옹"))').count();
    console.log(`📝 Database posts: ${postCards}개`);

    // Verify real database content
    if (postCards > 0) {
      const firstPost = await page.locator('article, [data-testid="post"], .post-card').first();
      const postText = await firstPost.textContent();
      console.log(`📄 First post content: ${postText?.substring(0, 100)}...`);

      if (postText?.includes('테스트 게시글')) {
        console.log('✅ Real database data confirmed in production');
      } else {
        console.log('⚠️ Unexpected post content format');
      }
    }

    // Test post interactions
    console.log('\n3️⃣ Testing post interactions in production...');
    if (postCards > 0) {
      const hugButtons = await page.locator('button:has-text("포옹"), [aria-label*="포옹"], button:has(svg):has([data-testid="heart"])').count();
      const commentButtons = await page.locator('button:has-text("댓글"), [aria-label*="댓글"], button:has(svg):has([data-testid="message-circle"])').count();

      console.log(`❤️ Hug/Like buttons: ${hugButtons}개`);
      console.log(`💬 Comment buttons: ${commentButtons}개`);

      if (hugButtons > 0) {
        try {
          console.log('Testing hug button interaction...');
          await page.locator('button:has-text("포옹"), [aria-label*="포옹"], button:has(svg):has([data-testid="heart"])').first().click();
          await page.waitForTimeout(1000);
          console.log('✅ Hug button interaction successful');
        } catch (error) {
          console.log('⚠️ Hug button interaction issue:', error.message);
        }
      }
    }

    // Screenshot
    await page.screenshot({
      path: 'production-sustainable-test.png',
      fullPage: true
    });
    console.log('📸 Screenshot: production-sustainable-test.png');

    // Analyze architecture logs
    console.log('\n4️⃣ Production architecture validation...');
    const serviceLogCount = logs.filter(log =>
      log.includes('PostService') ||
      log.includes('Database connection successful') ||
      log.includes('posts from database') ||
      log.includes('Transforming') ||
      log.includes('데이터베이스')
    ).length;

    const errorLogCount = logs.filter(log =>
      log.toLowerCase().includes('error') &&
      !log.includes('DevTools') &&
      !log.includes('preloaded')
    ).length;

    console.log(`🏗️ Architecture services active: ${serviceLogCount > 0 ? '✅ Yes' : '❌ No'} (${serviceLogCount} logs)`);
    console.log(`🚨 Critical errors: ${errorLogCount > 0 ? `❌ ${errorLogCount} found` : '✅ None'}`);

    // Check for specific success indicators
    const dbConnectionLogs = logs.filter(log => log.includes('Database connection successful'));
    const transformLogs = logs.filter(log => log.includes('Successfully transformed'));
    const postLoadLogs = logs.filter(log => log.includes('posts from database'));

    console.log('\n📊 Sustainable architecture status:');
    console.log(`   🔌 Database connections: ${dbConnectionLogs.length}`);
    console.log(`   🔄 Data transformations: ${transformLogs.length}`);
    console.log(`   📝 Post loading: ${postLoadLogs.length}`);

    console.log('\n✨ Production sustainable solution test completed!');

  } catch (error) {
    console.error('❌ Production test error:', error.message);
  } finally {
    await browser.close();
  }
}

testProductionSustainable().catch(console.error);