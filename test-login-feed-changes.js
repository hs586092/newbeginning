#!/usr/bin/env node

/**
 * 로그인 전후 피드 변화 확인 스크립트
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://newbeginning-ktge6k5pq-hs586092s-projects.vercel.app';

async function testLoginFeedChanges() {
  console.log('🔍 로그인 전후 피드 변화 확인 시작...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  try {
    // 1. 로그인 전 피드 상태 확인
    console.log('1️⃣ 로그인 전 피드 상태 확인...');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 로그인 전 스크린샷
    await page.screenshot({
      path: 'feed-before-login.png',
      fullPage: true
    });

    // 로그인 전 피드 내용 확인
    const postsBeforeLogin = await page.locator('article, .post-card, [data-testid*="post"]').count();
    console.log(`📝 로그인 전 포스트 수: ${postsBeforeLogin}개`);

    // 피드 내용 텍스트 수집
    const feedContentBefore = await page.locator('body').innerText();
    console.log('📄 로그인 전 피드 주요 내용:');

    // 첫 번째 포스트 내용 확인
    const firstPostBefore = await page.locator('article, .post-card').first().innerText().catch(() => '포스트 없음');
    console.log('   첫 번째 포스트:', firstPostBefore.substring(0, 100));

    // 2. 로그인 페이지로 이동
    console.log('\n2️⃣ 로그인 페이지로 이동...');
    const loginButton = page.locator('a:has-text("로그인"), button:has-text("로그인")');
    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      await page.waitForTimeout(3000);

      // 로그인 페이지에서 뒤로가기 (실제 로그인하지 않고 변화 확인)
      console.log('3️⃣ 메인 페이지로 돌아가기...');
      await page.goBack();
      await page.waitForTimeout(3000);
    }

    // 3. 로그인 후 피드 상태 확인 (시뮬레이션)
    console.log('4️⃣ 피드 변화 확인...');

    // 로그인 후 스크린샷
    await page.screenshot({
      path: 'feed-after-navigation.png',
      fullPage: true
    });

    const postsAfterNavigation = await page.locator('article, .post-card, [data-testid*="post"]').count();
    console.log(`📝 네비게이션 후 포스트 수: ${postsAfterNavigation}개`);

    // 첫 번째 포스트 내용 다시 확인
    const firstPostAfter = await page.locator('article, .post-card').first().innerText().catch(() => '포스트 없음');
    console.log('   첫 번째 포스트:', firstPostAfter.substring(0, 100));

    // 4. 페이지 소스 및 컴포넌트 구조 확인
    console.log('\n5️⃣ 페이지 구조 분석...');

    // UnifiedFeed 컴포넌트 확인
    const unifiedFeedExists = await page.locator('[class*="unified-feed"], [data-component="unified-feed"]').count();
    console.log(`🧩 UnifiedFeed 컴포넌트: ${unifiedFeedExists}개`);

    // 인기 게시글 섹션 확인
    const trendingSection = await page.locator('*:has-text("인기 게시글")').count();
    console.log(`📈 인기 게시글 섹션: ${trendingSection}개`);

    // 로딩 상태 확인
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"]').count();
    console.log(`⏳ 로딩 요소: ${loadingElements}개`);

    // 5. 콘솔 에러 확인
    console.log('\n6️⃣ 브라우저 콘솔 확인...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 콘솔 에러: ${msg.text()}`);
      }
    });

    // 네트워크 요청 확인
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`🌐 네트워크 에러 ${response.status()}: ${response.url()}`);
      }
    });

    // 페이지 새로고침해서 다시 확인
    console.log('\n7️⃣ 페이지 새로고침 후 재확인...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'feed-after-reload.png',
      fullPage: true
    });

    const postsAfterReload = await page.locator('article, .post-card, [data-testid*="post"]').count();
    console.log(`📝 새로고침 후 포스트 수: ${postsAfterReload}개`);

    console.log('\n✨ 피드 변화 분석 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginFeedChanges().catch(console.error);