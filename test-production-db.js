#!/usr/bin/env node

/**
 * 프로덕션 환경 데이터베이스 연결 테스트
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://newbeginning-g0o8xl3fb-hs586092s-projects.vercel.app';

async function testProductionDB() {
  console.log('🔍 프로덕션 데이터베이스 연결 테스트...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  try {
    // 콘솔 로그 캡처
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`📋 Console: ${text}`);
    });

    // 네트워크 요청 캡처
    page.on('request', request => {
      if (request.url().includes('supabase')) {
        console.log(`🌐 Supabase Request: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('supabase')) {
        console.log(`📡 Supabase Response: ${response.status()} ${response.url()}`);
      }
    });

    console.log('1️⃣ 프로덕션 사이트 접근 중...');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // 데이터 로딩 대기

    // 포스트 수 확인
    const postCards = await page.locator('article, [data-testid="post"], .post-card').count();
    console.log(`📝 표시된 포스트 수: ${postCards}개`);

    // 첫 번째 포스트 내용 확인
    try {
      const firstPostContent = await page.locator('article, [data-testid="post"], .post-card').first().textContent();
      console.log(`📄 첫 번째 포스트 내용: ${firstPostContent?.substring(0, 100)}...`);

      // Mock 데이터인지 실제 데이터인지 구분
      if (firstPostContent?.includes('13개월 아기 밤잠')) {
        console.log('🎭 Mock 데이터가 표시되고 있습니다');
      } else if (firstPostContent?.includes('테스트 게시글')) {
        console.log('✅ 실제 데이터베이스 데이터가 표시되고 있습니다');
      } else {
        console.log('❓ 알 수 없는 데이터 형태입니다');
      }
    } catch (error) {
      console.log('❌ 포스트 내용을 가져올 수 없습니다:', error.message);
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'production-db-test.png',
      fullPage: true
    });
    console.log('📸 스크린샷: production-db-test.png');

    // 콘솔 로그 분석
    console.log('\n2️⃣ 콘솔 로그 분석:');
    const dbLogs = logs.filter(log => log.includes('Database') || log.includes('posts loaded') || log.includes('Supabase'));
    if (dbLogs.length > 0) {
      dbLogs.forEach(log => console.log(`   📋 ${log}`));
    } else {
      console.log('   ⚠️ 데이터베이스 관련 로그가 없습니다');
    }

    // 에러 로그 확인
    const errorLogs = logs.filter(log => log.includes('error') || log.includes('Error') || log.includes('failed'));
    if (errorLogs.length > 0) {
      console.log('\n❌ 에러 로그:');
      errorLogs.forEach(log => console.log(`   🔴 ${log}`));
    }

    console.log('\n✨ 프로덕션 데이터베이스 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

testProductionDB().catch(console.error);