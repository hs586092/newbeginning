/**
 * 실제 로그인 후 모바일 UI 테스트
 * 사용자 신고 문제 재현 시도
 */

import { chromium } from 'playwright';

async function checkRealLoginUIIssues() {
  console.log('🔍 실제 로그인 후 모바일 UI 검사...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 동작 속도 늦춤 (관찰용)
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  try {
    // 1. 홈페이지 방문
    await page.goto('https://www.fortheorlingas.com', { waitUntil: 'networkidle' });
    console.log('✅ 홈페이지 로드됨');

    // 2. 로그인 전 스크린샷
    await page.screenshot({ path: 'real-mobile-before-login.png', fullPage: false });
    console.log('📸 로그인 전 스크린샷 저장');

    // 3. 로그인 페이지로 이동
    console.log('🔄 로그인 페이지로 이동...');

    // 로그인 링크/버튼 찾기
    const loginElements = await page.$$('a[href="/login"], button:has-text("로그인"), a:has-text("로그인")');

    if (loginElements.length > 0) {
      await loginElements[0].click();
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      console.log('✅ 로그인 페이지 도착');
    } else {
      // 직접 이동
      await page.goto('https://www.fortheorlingas.com/login');
    }

    await page.waitForTimeout(2000);

    // 4. 구글 로그인 버튼 찾기 및 클릭
    console.log('🔍 구글 로그인 버튼 찾기...');

    const googleLoginSelector = 'button:has-text("Google"), a:has-text("Google"), [class*="google"], [href*="google"]';

    try {
      await page.waitForSelector(googleLoginSelector, { timeout: 10000 });
      const googleLogin = await page.$(googleLoginSelector);

      if (googleLogin) {
        console.log('✅ 구글 로그인 버튼 발견');

        // 새 탭에서 로그인이 열릴 수 있으므로 대기
        const [popup] = await Promise.all([
          page.waitForEvent('popup').catch(() => null),
          googleLogin.click()
        ]);

        if (popup) {
          console.log('🔄 팝업에서 로그인 진행중...');
          console.log('⏳ 수동 로그인 완료까지 대기 (60초)...');

          // 수동 로그인 완료 대기 (60초)
          await page.waitForTimeout(60000);

          // 팝업 닫힘 대기
          await popup.waitForEvent('close').catch(() => console.log('팝업이 이미 닫혔거나 감지되지 않음'));
        }

        // 5. 로그인 완료 후 홈으로 이동
        console.log('🔄 홈페이지로 돌아가기...');
        await page.goto('https://www.fortheorlingas.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // 로그인 상태 반영 대기

      }
    } catch (error) {
      console.log('❌ 구글 로그인 버튼 찾기 실패, 수동 로그인 필요');
      console.log('⏳ 수동 로그인 후 홈으로 이동해주세요 (120초 대기)...');
      await page.waitForTimeout(120000);
    }

    // 6. 로그인 후 상태 확인
    console.log('🔍 로그인 후 상태 확인...');

    // 로그인 여부 확인
    const isLoggedIn = await page.evaluate(() => {
      // 로그인 상태 확인 방법들
      const hasAuthToken = localStorage.getItem('supabase.auth.token') !== null;
      const hasUserMenu = document.querySelector('[aria-label*="사용자"], [class*="profile"], [class*="user"]') !== null;
      const noLoginButton = document.querySelector('a[href="/login"], button:has-text("로그인")') === null;

      return {
        hasAuthToken,
        hasUserMenu,
        noLoginButton,
        currentUrl: window.location.href
      };
    });

    console.log('인증 상태:', isLoggedIn);

    // 7. 로그인 후 스크린샷
    await page.screenshot({ path: 'real-mobile-after-login.png', fullPage: false });
    console.log('📸 로그인 후 스크린샷 저장');

    // 8. "첫돌까지" 요소들 상세 분석
    console.log('🔍 "첫돌까지" 레이아웃 분석...');

    const layoutAnalysis = await page.evaluate(() => {
      const results = [];

      // 모든 텍스트 노드에서 "첫돌까지" 찾기
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            return node.textContent.includes('첫돌까지') ?
              NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
          }
        }
      );

      let node;
      while (node = walker.nextNode()) {
        const element = node.parentElement;
        if (element) {
          const rect = element.getBoundingClientRect();
          const computed = window.getComputedStyle(element);

          // 부모 요소들도 체크
          const parents = [];
          let parent = element.parentElement;
          for (let i = 0; i < 5 && parent; i++) {
            const parentRect = parent.getBoundingClientRect();
            const parentComputed = window.getComputedStyle(parent);
            parents.push({
              tag: parent.tagName.toLowerCase(),
              className: parent.className,
              rect: {
                width: Math.round(parentRect.width),
                height: Math.round(parentRect.height),
                x: Math.round(parentRect.x),
                y: Math.round(parentRect.y)
              },
              styles: {
                display: parentComputed.display,
                flexDirection: parentComputed.flexDirection,
                writingMode: parentComputed.writingMode,
                textOrientation: parentComputed.textOrientation,
                whiteSpace: parentComputed.whiteSpace,
                overflow: parentComputed.overflow,
                transform: parentComputed.transform
              }
            });
            parent = parent.parentElement;
          }

          results.push({
            text: node.textContent,
            element: {
              tag: element.tagName.toLowerCase(),
              className: element.className,
              id: element.id,
              rect: {
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                x: Math.round(rect.x),
                y: Math.round(rect.y)
              },
              styles: {
                display: computed.display,
                flexDirection: computed.flexDirection,
                alignItems: computed.alignItems,
                writingMode: computed.writingMode,
                textOrientation: computed.textOrientation,
                whiteSpace: computed.whiteSpace,
                wordBreak: computed.wordBreak,
                overflow: computed.overflow,
                transform: computed.transform,
                fontSize: computed.fontSize,
                fontFamily: computed.fontFamily.split(',')[0],
                lineHeight: computed.lineHeight
              }
            },
            parents: parents,
            isVertical: rect.height > rect.width && rect.width > 0,
            isProblem: rect.height > rect.width && rect.height > 100
          });
        }
      }

      return results;
    });

    console.log('\n📊 "첫돌까지" 요소 분석 결과:');
    layoutAnalysis.forEach((item, idx) => {
      console.log(`\n요소 ${idx + 1}: "${item.text.trim()}"`);
      console.log(`  태그: ${item.element.tag}${item.element.className ? '.' + item.element.className.split(' ').join('.') : ''}`);
      console.log(`  크기: ${item.element.rect.width}x${item.element.rect.height} at (${item.element.rect.x}, ${item.element.rect.y})`);
      console.log(`  세로 배치: ${item.isVertical ? '⚠️  YES' : '✅ NO'}`);
      console.log(`  문제 의심: ${item.isProblem ? '🚨 YES' : '✅ NO'}`);

      if (item.isProblem) {
        console.log(`  스타일:`);
        console.log(`    display: ${item.element.styles.display}`);
        console.log(`    flexDirection: ${item.element.styles.flexDirection}`);
        console.log(`    writingMode: ${item.element.styles.writingMode}`);
        console.log(`    transform: ${item.element.styles.transform}`);
        console.log(`    fontSize: ${item.element.styles.fontSize}`);
        console.log(`    whiteSpace: ${item.element.styles.whiteSpace}`);

        console.log(`  부모 체인:`);
        item.parents.slice(0, 3).forEach((parent, pidx) => {
          console.log(`    ${pidx + 1}. ${parent.tag} (${parent.rect.width}x${parent.rect.height})`);
          console.log(`       display: ${parent.styles.display}, flex: ${parent.styles.flexDirection}`);
        });
      }
    });

    // 9. 전체 화면 스크린샷
    await page.screenshot({ path: 'real-mobile-full-after-login.png', fullPage: true });
    console.log('📸 전체 페이지 스크린샷 저장');

    console.log('\n⏳ 시각적 확인을 위해 10초 대기...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }

  await context.close();
  await browser.close();

  console.log('\n✅ 실제 로그인 테스트 완료!');
  console.log('📸 저장된 스크린샷:');
  console.log('  - real-mobile-before-login.png');
  console.log('  - real-mobile-after-login.png');
  console.log('  - real-mobile-full-after-login.png');
}

checkRealLoginUIIssues().catch(console.error);