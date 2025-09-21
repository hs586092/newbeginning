#!/usr/bin/env node

/**
 * 공개 사이트에서 공유 기능 테스트
 */

import { chromium } from 'playwright';

const SITE_URL = 'https://fortheorlingas.com';

async function testPublicSharing() {
  console.log('🔍 공개 사이트 공유 기능 테스트 시작...\n');
  console.log(`📍 테스트 사이트: ${SITE_URL}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  try {
    // 1. 메인 페이지 접근
    console.log('1️⃣ 메인 페이지 접근 중...');
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`📍 현재 URL: ${currentUrl}`);

    // 2. 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);

    // 3. 게시글이 있는지 확인
    const posts = await page.locator('[class*="card"], [class*="post"], article').count();
    console.log(`📝 게시글 수: ${posts}개`);

    if (posts > 0) {
      console.log('✅ 게시글 발견! 공유 버튼 검색 중...');

      // 공유 관련 요소들 찾기
      const shareButtons = await page.locator('[class*="share"], [aria-label*="공유"], [title*="공유"]').count();
      const bookmarkButtons = await page.locator('[class*="bookmark"], [aria-label*="북마크"], [title*="북마크"]').count();

      console.log(`🔗 공유 버튼: ${shareButtons}개`);
      console.log(`📚 북마크 버튼: ${bookmarkButtons}개`);

      // Share2 아이콘 (Lucide React 아이콘)
      const shareIcons = await page.locator('svg[class*="lucide-share"], [data-testid*="share"], button:has-text("공유")').count();
      const bookmarkIcons = await page.locator('svg[class*="lucide-bookmark"], [data-testid*="bookmark"], button:has-text("북마크")').count();

      console.log(`🔗 Share 아이콘: ${shareIcons}개`);
      console.log(`📚 Bookmark 아이콘: ${bookmarkIcons}개`);

      // 인터랙션 버튼들 찾기 (PostInteractionsV3)
      const interactionButtons = await page.locator('[class*="interaction"], button[class*="rounded-full"]').count();
      console.log(`🎯 상호작용 버튼: ${interactionButtons}개`);

      // 첫 번째 게시글 클릭해보기
      console.log('\n4️⃣ 첫 번째 게시글 클릭 시도...');
      const firstPost = page.locator('[class*="card"], [class*="post"], article').first();

      if (await firstPost.isVisible()) {
        await firstPost.click();
        await page.waitForTimeout(2000);

        // 개별 게시글 페이지에서 공유 버튼 확인
        const detailShareButtons = await page.locator('[class*="share"], [aria-label*="공유"], [title*="공유"]').count();
        const detailBookmarkButtons = await page.locator('[class*="bookmark"], [aria-label*="북마크"], [title*="북마크"]').count();

        console.log(`📄 개별 페이지 공유 버튼: ${detailShareButtons}개`);
        console.log(`📄 개별 페이지 북마크 버튼: ${detailBookmarkButtons}개`);
      }
    } else {
      console.log('❌ 게시글을 찾을 수 없음');
    }

    // 5. HTML 구조 분석
    console.log('\n5️⃣ HTML 구조 분석 중...');
    const bodyClasses = await page.getAttribute('body', 'class') || '';
    console.log(`📋 Body 클래스: ${bodyClasses}`);

    // 특정 컴포넌트 확인
    const unifiedFeed = await page.locator('[class*="unified-feed"], [class*="UnifiedFeed"]').count();
    const postInteractions = await page.locator('[class*="post-interaction"], [class*="PostInteraction"]').count();

    console.log(`📱 UnifiedFeed 컴포넌트: ${unifiedFeed}개`);
    console.log(`🎯 PostInteractions 컴포넌트: ${postInteractions}개`);

    // 6. 스크린샷 촬영
    console.log('\n6️⃣ 스크린샷 촬영 중...');
    await page.screenshot({
      path: 'public-site-screenshot.png',
      fullPage: true
    });
    console.log('📸 스크린샷 저장됨: public-site-screenshot.png');

    // 7. 북마크 페이지 직접 접근
    console.log('\n7️⃣ 북마크 페이지 직접 접근...');
    try {
      await page.goto(`${currentUrl}/bookmarks`);
      await page.waitForTimeout(3000);

      const bookmarkPageTitle = await page.title();
      console.log(`📚 북마크 페이지 제목: ${bookmarkPageTitle}`);

      const hasBookmarkContent = await page.locator('text=북마크').isVisible().catch(() => false);
      console.log(`📋 북마크 컨텐츠: ${hasBookmarkContent ? '✅ 발견' : '❌ 없음'}`);

      await page.screenshot({
        path: 'public-bookmarks-screenshot.png',
        fullPage: true
      });
      console.log('📸 북마크 페이지 스크린샷: public-bookmarks-screenshot.png');

    } catch (error) {
      console.log(`❌ 북마크 페이지 접근 실패: ${error.message}`);
    }

    console.log('\n✨ 공개 사이트 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

// 로컬 개발 서버도 테스트
async function testLocalDev() {
  console.log('\n🏠 로컬 개발 서버 테스트...\n');

  const LOCAL_URL = 'http://localhost:3001';
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();

  try {
    console.log('1️⃣ 로컬 서버 접근 중...');
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(`📄 로컬 페이지 제목: ${title}`);

    // 공유/북마크 버튼 찾기
    const shareButtons = await page.locator('button:has-text("공유"), [aria-label*="공유"], [title*="공유"]').count();
    const bookmarkButtons = await page.locator('button:has-text("북마크"), [aria-label*="북마크"], [title*="북마크"]').count();

    console.log(`🔗 로컬 공유 버튼: ${shareButtons}개`);
    console.log(`📚 로컬 북마크 버튼: ${bookmarkButtons}개`);

    // Share2, Bookmark 아이콘 찾기
    const shareIcons = await page.locator('svg[class*="lucide-share"]').count();
    const bookmarkIcons = await page.locator('svg[class*="lucide-bookmark"]').count();

    console.log(`🔗 Share 아이콘: ${shareIcons}개`);
    console.log(`📚 Bookmark 아이콘: ${bookmarkIcons}개`);

    await page.screenshot({
      path: 'local-dev-screenshot.png',
      fullPage: true
    });
    console.log('📸 로컬 개발 서버 스크린샷: local-dev-screenshot.png');

    console.log('\n✨ 로컬 개발 서버 테스트 완료!');

  } catch (error) {
    console.error('❌ 로컬 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

// 메인 실행
async function main() {
  await testPublicSharing();
  await testLocalDev();

  console.log('\n🎉 모든 테스트 완료!');
  console.log('\n📝 생성된 스크린샷:');
  console.log('   - public-site-screenshot.png: 공개 사이트');
  console.log('   - public-bookmarks-screenshot.png: 공개 사이트 북마크 페이지');
  console.log('   - local-dev-screenshot.png: 로컬 개발 서버');
}

main().catch(console.error);