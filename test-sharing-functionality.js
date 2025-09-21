#!/usr/bin/env node

/**
 * 공유 기능 테스트 스크립트
 */

import { chromium } from 'playwright';

const SITE_URL = 'http://localhost:3001';

async function testSharingFunctionality() {
  console.log('🔍 공유 기능 테스트 시작...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 1초 딜레이로 동작을 보기 쉽게
  });

  const page = await browser.newPage();

  try {
    // 1. 메인 페이지 접근
    console.log('1️⃣ 메인 페이지 접근 중...');
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });

    // 페이지 로딩 대기
    await page.waitForTimeout(3000);

    // 2. 공유 버튼 찾기
    console.log('2️⃣ 공유 버튼 검색 중...');

    // 공유 버튼들을 찾아보기
    const shareButtons = await page.locator('button[aria-label*="공유"], button[title*="공유"], [data-testid="share-button"]').count();

    if (shareButtons > 0) {
      console.log(`✅ 공유 버튼 ${shareButtons}개 발견!`);

      // 첫 번째 공유 버튼 클릭
      const firstShareButton = page.locator('button[aria-label*="공유"], button[title*="공유"], [data-testid="share-button"]').first();
      await firstShareButton.click();

      console.log('3️⃣ 공유 버튼 클릭함');

      // 드롭다운 메뉴가 나타나는지 확인
      await page.waitForTimeout(1000);
      const dropdownVisible = await page.locator('[role="menu"], .dropdown-menu, [data-testid="share-dropdown"]').isVisible().catch(() => false);

      if (dropdownVisible) {
        console.log('✅ 공유 드롭다운 메뉴 표시됨');

        // 공유 옵션들 확인
        const copyOption = await page.locator('text=링크 복사').count();
        const twitterOption = await page.locator('text=Twitter').count();
        const facebookOption = await page.locator('text=Facebook').count();
        const kakaoOption = await page.locator('text=카카오톡').count();

        console.log(`📋 링크 복사: ${copyOption > 0 ? '✅' : '❌'}`);
        console.log(`🐦 Twitter: ${twitterOption > 0 ? '✅' : '❌'}`);
        console.log(`📘 Facebook: ${facebookOption > 0 ? '✅' : '❌'}`);
        console.log(`💬 카카오톡: ${kakaoOption > 0 ? '✅' : '❌'}`);

        // 링크 복사 테스트
        if (copyOption > 0) {
          console.log('4️⃣ 링크 복사 기능 테스트 중...');
          await page.locator('text=링크 복사').click();
          await page.waitForTimeout(1000);

          // 토스트 메시지 확인
          const toastVisible = await page.locator('text=링크가 복사되었습니다').isVisible().catch(() => false);
          console.log(`📋 링크 복사 토스트: ${toastVisible ? '✅' : '❌'}`);
        }

      } else {
        console.log('❌ 공유 드롭다운 메뉴가 나타나지 않음');
      }

    } else {
      console.log('❌ 공유 버튼을 찾을 수 없음');

      // 페이지 내용 확인
      console.log('🔍 페이지 내용 분석 중...');
      const pageText = await page.textContent('body');
      console.log('페이지에서 "공유" 텍스트 검색:', pageText.includes('공유') ? '발견됨' : '없음');

      // Share2 아이콘 확인 (Lucide 아이콘)
      const shareIcons = await page.locator('[data-lucide="share-2"], .lucide-share-2').count();
      console.log(`🔗 Share2 아이콘: ${shareIcons}개`);
    }

    // 5. 스크린샷 촬영
    console.log('5️⃣ 스크린샷 촬영 중...');
    await page.screenshot({
      path: 'share-test-screenshot.png',
      fullPage: true
    });
    console.log('📸 스크린샷 저장됨: share-test-screenshot.png');

    console.log('\n✨ 공유 기능 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

// 북마크 기능도 함께 테스트
async function testBookmarkFunctionality() {
  console.log('\n📚 북마크 기능 테스트 시작...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  try {
    console.log('1️⃣ 메인 페이지 접근 중...');
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 북마크 버튼 찾기
    console.log('2️⃣ 북마크 버튼 검색 중...');
    const bookmarkButtons = await page.locator('button[aria-label*="북마크"], button[title*="북마크"], [data-testid="bookmark-button"]').count();

    if (bookmarkButtons > 0) {
      console.log(`✅ 북마크 버튼 ${bookmarkButtons}개 발견!`);
    } else {
      console.log('❌ 북마크 버튼을 찾을 수 없음');

      // Bookmark 아이콘 확인
      const bookmarkIcons = await page.locator('[data-lucide="bookmark"], .lucide-bookmark').count();
      console.log(`🔖 Bookmark 아이콘: ${bookmarkIcons}개`);
    }

    // 북마크 페이지 접근 테스트
    console.log('3️⃣ 북마크 페이지 접근 테스트...');
    await page.goto(`${SITE_URL}/bookmarks`);
    await page.waitForTimeout(3000);

    const bookmarkPageLoaded = await page.locator('text=북마크').isVisible().catch(() => false);
    console.log(`📋 북마크 페이지 로딩: ${bookmarkPageLoaded ? '✅' : '❌'}`);

    // 스크린샷 촬영
    await page.screenshot({
      path: 'bookmark-test-screenshot.png',
      fullPage: true
    });
    console.log('📸 북마크 페이지 스크린샷: bookmark-test-screenshot.png');

    console.log('\n✨ 북마크 기능 테스트 완료!');

  } catch (error) {
    console.error('❌ 북마크 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

// 메인 실행
async function main() {
  console.log('🚀 공유 및 북마크 기능 종합 테스트\n');
  console.log(`📍 테스트 사이트: ${SITE_URL}\n`);

  await testSharingFunctionality();
  await testBookmarkFunctionality();

  console.log('\n🎉 모든 테스트 완료!');
  console.log('\n📝 테스트 결과:');
  console.log('   - share-test-screenshot.png: 공유 기능 스크린샷');
  console.log('   - bookmark-test-screenshot.png: 북마크 기능 스크린샷');
}

main().catch(console.error);