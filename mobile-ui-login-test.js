/**
 * 로그인 상태 모바일 UI 테스트
 * 로그인 후 레이아웃 깨짐 현상 체크
 */

import { chromium } from 'playwright';

async function checkLoginUIIssues() {
  const url = 'https://www.fortheorlingas.com';

  console.log('🔍 로그인 상태 모바일 UI 검사 시작...\n');

  const browser = await chromium.launch({ headless: false });

  // iPhone 13 뷰포트로 테스트
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('📱 비로그인 상태 체크...');

    // 1. 비로그인 상태 스크린샷
    await page.screenshot({ path: 'mobile-ui-before-login.png', fullPage: true });

    // 상단 영역 레이아웃 체크
    const headerElements = await page.$$eval('header *, nav *, [class*="header"] *', elements => {
      return elements.slice(0, 10).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.substring(0, 30) || '',
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          className: el.className,
          isOverflowing: rect.x < 0 || rect.y < 0 || rect.right > window.innerWidth
        };
      });
    });

    console.log('📄 비로그인 상태 상단 요소들:');
    headerElements.forEach((el, idx) => {
      if (el.text.includes('첫돌까지') || el.isOverflowing || el.width < 10) {
        console.log(`  ⚠️  ${el.tag}: "${el.text}" (${el.x}, ${el.y}) ${el.width}x${el.height} ${el.isOverflowing ? 'OVERFLOW!' : ''}`);
      } else if (idx < 3) {
        console.log(`  ✅ ${el.tag}: "${el.text}" (${el.x}, ${el.y}) ${el.width}x${el.height}`);
      }
    });

    console.log('\n🔑 로그인 시도...');

    // 2. 로그인 페이지로 이동
    await page.goto('https://www.fortheorlingas.com/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 구글 로그인 버튼 찾기 시도
    const loginButtons = await page.$$('button, a');
    console.log(`로그인 버튼 후보 ${loginButtons.length}개 찾음`);

    let googleLoginFound = false;
    for (let i = 0; i < loginButtons.length; i++) {
      const buttonText = await loginButtons[i].textContent();
      const buttonHref = await loginButtons[i].getAttribute('href');

      if (buttonText?.includes('구글') || buttonText?.includes('Google') || buttonHref?.includes('google')) {
        console.log(`✅ 구글 로그인 버튼 발견: "${buttonText}"`);
        googleLoginFound = true;

        // 구글 로그인 시뮬레이션을 위해 직접 인증된 상태로 이동
        // 실제 로그인 대신 로그인 상태를 시뮬레이션
        break;
      }
    }

    // 3. 로그인 상태 시뮬레이션 - 쿠키나 로컬 스토리지 설정
    console.log('🔄 로그인 상태 시뮬레이션...');

    // 가상의 사용자 세션 설정
    await page.addInitScript(() => {
      // localStorage에 인증 토큰 설정
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'fake-access-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            name: '테스트 사용자'
          }
        }
      }));
    });

    // 홈으로 다시 이동
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // 인증 상태 반영 대기

    console.log('📱 로그인 상태 체크...');

    // 4. 로그인 상태 스크린샷
    await page.screenshot({ path: 'mobile-ui-after-login.png', fullPage: true });

    // 로그인 후 상단 영역 레이아웃 체크
    const loginHeaderElements = await page.$$eval('header *, nav *, [class*="header"] *, [class*="sidebar"] *', elements => {
      return elements.slice(0, 20).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.substring(0, 30) || '',
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          className: el.className,
          isOverflowing: rect.x < 0 || rect.y < 0 || rect.right > window.innerWidth,
          isVertical: rect.height > rect.width && rect.height > 100
        };
      });
    });

    console.log('📄 로그인 상태 상단 요소들:');
    loginHeaderElements.forEach((el, idx) => {
      if (el.text.includes('첫돌까지')) {
        console.log(`  🚨 첫돌까지: "${el.text}" (${el.x}, ${el.y}) ${el.width}x${el.height} ${el.isVertical ? 'VERTICAL!' : ''} ${el.isOverflowing ? 'OVERFLOW!' : ''}`);
      } else if (el.isOverflowing || el.isVertical || el.width < 10) {
        console.log(`  ⚠️  ${el.tag}: "${el.text}" (${el.x}, ${el.y}) ${el.width}x${el.height} ${el.isVertical ? 'VERTICAL!' : ''} ${el.isOverflowing ? 'OVERFLOW!' : ''}`);
      } else if (idx < 5) {
        console.log(`  ✅ ${el.tag}: "${el.text}" (${el.x}, ${el.y}) ${el.width}x${el.height}`);
      }
    });

    // 5. 특정 문제 영역 상세 분석
    console.log('\n🔍 "첫돌까지" 요소 상세 분석:');

    const firstDolElements = await page.$$eval('*', elements => {
      return elements
        .filter(el => el.textContent?.includes('첫돌까지'))
        .map(el => {
          const rect = el.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            text: el.textContent,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            styles: {
              display: computedStyle.display,
              flexDirection: computedStyle.flexDirection,
              alignItems: computedStyle.alignItems,
              justifyContent: computedStyle.justifyContent,
              writingMode: computedStyle.writingMode,
              textOrientation: computedStyle.textOrientation,
              whiteSpace: computedStyle.whiteSpace,
              overflow: computedStyle.overflow,
              wordBreak: computedStyle.wordBreak
            },
            className: el.className,
            parent: {
              tag: el.parentElement?.tagName.toLowerCase(),
              className: el.parentElement?.className
            }
          };
        });
    });

    firstDolElements.forEach((el, idx) => {
      console.log(`\n  요소 ${idx + 1}:`);
      console.log(`    태그: ${el.tag}.${el.className}`);
      console.log(`    부모: ${el.parent.tag}.${el.parent.className}`);
      console.log(`    위치: (${el.rect.x}, ${el.rect.y}) ${el.rect.width}x${el.rect.height}`);
      console.log(`    스타일:`);
      console.log(`      display: ${el.styles.display}`);
      console.log(`      flexDirection: ${el.styles.flexDirection}`);
      console.log(`      writingMode: ${el.styles.writingMode}`);
      console.log(`      textOrientation: ${el.styles.textOrientation}`);
      console.log(`      whiteSpace: ${el.styles.whiteSpace}`);
      console.log(`      wordBreak: ${el.styles.wordBreak}`);
    });

    // 6. CSS 분석
    console.log('\n🎨 CSS 문제 분석:');

    const suspiciousCSS = await page.evaluate(() => {
      const issues = [];
      const sheets = Array.from(document.styleSheets);

      // 세로 배치를 유발할 수 있는 CSS 찾기
      const suspiciousRules = [
        'writing-mode: vertical',
        'text-orientation: upright',
        'flex-direction: column',
        'display: block',
        'white-space: pre-line'
      ];

      // DOM에서 첫돌까지 요소의 실제 적용된 스타일 확인
      const elements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent?.includes('첫돌까지'));

      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        if (rect.height > rect.width && rect.height > 50) {
          issues.push({
            element: `${el.tagName.toLowerCase()}.${el.className}`,
            problem: 'Height > Width (세로 배치 의심)',
            rect: `${rect.width}x${rect.height}`,
            styles: {
              display: computed.display,
              flexDirection: computed.flexDirection,
              writingMode: computed.writingMode,
              whiteSpace: computed.whiteSpace
            }
          });
        }
      });

      return issues;
    });

    suspiciousCSS.forEach(issue => {
      console.log(`  🚨 ${issue.element}: ${issue.problem}`);
      console.log(`    크기: ${issue.rect}`);
      console.log(`    스타일: ${JSON.stringify(issue.styles, null, 6)}`);
    });

  } catch (error) {
    console.log(`❌ 테스트 오류: ${error.message}`);
  }

  await context.close();
  await browser.close();

  console.log('\n✅ 로그인 상태 UI 검사 완료!');
  console.log('📸 스크린샷 저장됨:');
  console.log('  - mobile-ui-before-login.png (로그인 전)');
  console.log('  - mobile-ui-after-login.png (로그인 후)');
}

checkLoginUIIssues().catch(console.error);