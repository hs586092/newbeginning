#!/usr/bin/env node

/**
 * 로그인 버튼 수정 테스트 스크립트
 */

import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:3001';

async function testLoginButtonFix() {
  console.log('🔍 로그인 버튼 수정 테스트 시작...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  try {
    console.log('1️⃣ 메인 페이지 접근 중...');
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);

    // 헤더의 로그인 버튼 확인
    console.log('2️⃣ 헤더 로그인 버튼 확인 중...');
    const headerLoginButton = await page.locator('header button:has-text("로그인"), header a:has-text("로그인")').count();
    console.log(`🔗 헤더 로그인 버튼: ${headerLoginButton}개`);

    // 사이드바 버튼 확인
    console.log('3️⃣ 사이드바 버튼 확인 중...');
    const sidebarButton = await page.locator('button:has-text("로그인하고 시작하기"), a:has-text("로그인하고 시작하기")').count();
    console.log(`📋 사이드바 로그인 버튼: ${sidebarButton}개`);

    // 로그인 버튼 클릭 테스트
    if (headerLoginButton > 0) {
      console.log('4️⃣ 헤더 로그인 버튼 클릭 테스트...');
      await page.locator('header button:has-text("로그인"), header a:has-text("로그인")').first().click();
      await page.waitForTimeout(2000);

      // 로그인 페이지로 이동했는지 확인
      const currentUrl = page.url();
      console.log(`📍 현재 URL: ${currentUrl}`);

      if (currentUrl.includes('/login')) {
        console.log('✅ 로그인 페이지로 정상 이동');

        // 로그인 페이지 요소 확인
        const loginTitle = await page.locator('h1, h2').first().textContent();
        console.log(`📝 로그인 페이지 제목: ${loginTitle}`);

        // 뒤로가기
        await page.goBack();
        await page.waitForTimeout(2000);
      } else {
        console.log('❌ 로그인 페이지로 이동하지 않음');
      }
    }

    // 사이드바 버튼 클릭 테스트
    if (sidebarButton > 0) {
      console.log('5️⃣ 사이드바 로그인 버튼 클릭 테스트...');
      await page.locator('button:has-text("로그인하고 시작하기"), a:has-text("로그인하고 시작하기")').first().click();
      await page.waitForTimeout(2000);

      // 로그인 페이지로 이동했는지 확인
      const currentUrl = page.url();
      console.log(`📍 현재 URL: ${currentUrl}`);

      if (currentUrl.includes('/login')) {
        console.log('✅ 사이드바 버튼으로 로그인 페이지 정상 이동');
      } else {
        console.log('❌ 사이드바 버튼이 로그인 페이지로 이동하지 않음');
      }
    }

    // 최종 스크린샷
    console.log('6️⃣ 수정 후 스크린샷 촬영...');
    await page.goto(LOCAL_URL);
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'login-button-fix-screenshot.png',
      fullPage: true
    });
    console.log('📸 수정 후 스크린샷: login-button-fix-screenshot.png');

    console.log('\n✨ 로그인 버튼 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginButtonFix().catch(console.error);