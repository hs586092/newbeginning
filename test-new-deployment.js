#!/usr/bin/env node

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://newbeginning-cdf92lz6o-hs586092s-projects.vercel.app';

async function testNewDeployment() {
  console.log('🔍 새 배포 테스트...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();

  try {
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`📋 ${text}`);
    });

    console.log('1️⃣ 사이트 접근 중...');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 포스트 수 확인
    const postCards = await page.locator('article, [data-testid="post"], .post-card, div:has(button:has-text("포옹"))').count();
    console.log(`\n📝 포스트 수: ${postCards}개`);

    // 인기 게시글 섹션 확인
    const trendingSection = await page.locator('text=인기 게시글').count();
    console.log(`📈 인기 게시글 섹션: ${trendingSection}개`);

    // UnifiedFeed 관련 요소 확인
    const feedElements = await page.locator('[class*="feed"], [data-component*="feed"]').count();
    console.log(`🧩 피드 관련 요소: ${feedElements}개`);

    await page.screenshot({
      path: 'new-deployment-test.png',
      fullPage: true
    });

    console.log('\n2️⃣ 로그 분석:');
    const relevantLogs = logs.filter(log =>
      log.includes('RealisticHomepage') ||
      log.includes('Database') ||
      log.includes('posts loaded') ||
      log.includes('mounted') ||
      log.includes('rendered')
    );

    if (relevantLogs.length > 0) {
      relevantLogs.forEach(log => console.log(`   🔍 ${log}`));
    } else {
      console.log('   ⚠️ 관련 로그 없음');
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testNewDeployment();