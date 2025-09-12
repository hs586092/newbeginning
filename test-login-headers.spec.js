import { test, expect } from '@playwright/test';

test('로그인 페이지 헤더 중복 확인', async ({ page }) => {
  console.log('🔍 로그인 페이지 헤더 중복 테스트 시작...');
  
  // 로그인 페이지로 이동
  await page.goto('http://localhost:3000/login');
  
  // 페이지가 완전히 로드될 때까지 대기
  await page.waitForLoadState('networkidle');
  
  console.log('📍 현재 URL:', await page.url());
  console.log('📍 현재 경로:', await page.evaluate(() => window.location.pathname));
  
  // 모든 헤더 요소 찾기
  const headers = await page.locator('header').all();
  console.log(`🔍 발견된 헤더 개수: ${headers.length}`);
  
  // 각 헤더의 정보 출력
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const isVisible = await header.isVisible();
    const textContent = await header.textContent();
    const className = await header.getAttribute('class');
    
    console.log(`📋 헤더 ${i + 1}:`);
    console.log(`   - 표시 여부: ${isVisible}`);
    console.log(`   - 텍스트: ${textContent?.substring(0, 100)}...`);
    console.log(`   - 클래스: ${className}`);
  }
  
  // 네비게이션 관련 요소들 찾기
  const navElements = await page.locator('nav').all();
  console.log(`🧭 발견된 nav 개수: ${navElements.length}`);
  
  // "첫돌까지" 텍스트가 포함된 요소들 찾기
  const duplicateTexts = await page.locator('*:has-text("첫돌까지")').all();
  console.log(`🎯 "첫돌까지" 텍스트 포함 요소 개수: ${duplicateTexts.length}`);
  
  for (let i = 0; i < duplicateTexts.length; i++) {
    const element = duplicateTexts[i];
    const isVisible = await element.isVisible();
    const tagName = await element.evaluate(el => el.tagName);
    const className = await element.getAttribute('class');
    
    console.log(`🎯 "첫돌까지" 요소 ${i + 1}:`);
    console.log(`   - 태그: ${tagName}`);
    console.log(`   - 표시 여부: ${isVisible}`);  
    console.log(`   - 클래스: ${className}`);
  }
  
  // OAuth 버튼들 확인
  const googleButton = page.locator('button:has-text("Google로 로그인")');
  const kakaoButton = page.locator('button:has-text("카카오로 로그인")');
  
  console.log(`🔐 Google 로그인 버튼 개수: ${await googleButton.count()}`);
  console.log(`🔐 Kakao 로그인 버튼 개수: ${await kakaoButton.count()}`);
  
  // 로그인 버튼 클릭 테스트
  if (await googleButton.count() > 0) {
    console.log('🧪 Google 로그인 버튼 클릭 테스트...');
    try {
      await googleButton.first().click();
      await page.waitForTimeout(1000); // 1초 대기
      console.log('✅ Google 로그인 버튼 클릭 성공');
      console.log('📍 클릭 후 URL:', await page.url());
    } catch (error) {
      console.log('❌ Google 로그인 버튼 클릭 실패:', error.message);
    }
  }
  
  // 페이지를 다시 로그인 페이지로 이동
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  if (await kakaoButton.count() > 0) {
    console.log('🧪 Kakao 로그인 버튼 클릭 테스트...');
    try {
      await kakaoButton.first().click();
      await page.waitForTimeout(1000); // 1초 대기
      console.log('✅ Kakao 로그인 버튼 클릭 성공');
      console.log('📍 클릭 후 URL:', await page.url());
    } catch (error) {
      console.log('❌ Kakao 로그인 버튼 클릭 실패:', error.message);
    }
  }
  
  // 결론
  console.log('\n=== 테스트 결과 ===');
  console.log(`헤더 개수: ${headers.length}개 (예상: 0개 - 로그인 페이지에서는 헤더가 숨겨져야 함)`);
  console.log(`"첫돌까지" 요소 개수: ${duplicateTexts.length}개`);
  console.log(`Google 버튼 개수: ${await googleButton.count()}개`);
  console.log(`Kakao 버튼 개수: ${await kakaoButton.count()}개`);
});

test('홈페이지 헤더 확인 (비교용)', async ({ page }) => {
  console.log('🏠 홈페이지 헤더 확인...');
  
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  const headers = await page.locator('header').all();
  const duplicateTexts = await page.locator('*:has-text("첫돌까지")').all();
  
  console.log(`🏠 홈페이지 헤더 개수: ${headers.length}개 (예상: 1개)`);
  console.log(`🏠 홈페이지 "첫돌까지" 요소 개수: ${duplicateTexts.length}개`);
});