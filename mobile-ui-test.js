/**
 * 모바일 UI 텍스트 렌더링 및 레이아웃 이슈 체크
 * MVP 품질 체크리스트: Day 7 크로스브라우저 테스트
 */

import { chromium, firefox, webkit } from 'playwright';

async function checkMobileUIIssues() {
  const url = 'https://www.fortheorlingas.com';
  const browsers = [
    { name: 'Chrome', browser: chromium },
    { name: 'Firefox', browser: firefox },
    { name: 'Safari', browser: webkit }
  ];

  const mobileViewports = [
    { name: 'iPhone 13', width: 390, height: 844 },
    { name: 'Galaxy S21', width: 360, height: 800 },
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];

  console.log('🔍 모바일 UI 텍스트 렌더링 검사 시작...\n');

  for (const { name: browserName, browser } of browsers) {
    console.log(`📱 ${browserName} 브라우저 테스트`);

    try {
      const browserInstance = await browser.launch({ headless: false });

      for (const viewport of mobileViewports) {
        console.log(`  📐 ${viewport.name} (${viewport.width}x${viewport.height})`);

        const context = await browserInstance.newContext({
          viewport,
          userAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15`
        });

        const page = await context.newPage();

        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000); // 로딩 완료 대기

          // 1. 모바일 네비게이션 표시 확인
          const mobileNav = await page.$('[data-testid="mobile-bottom-nav"]');
          if (mobileNav) {
            console.log('    ✅ 모바일 네비게이션 표시됨');

            // 네비게이션 탭 텍스트 체크
            const tabs = await page.$$('[data-testid="mobile-bottom-nav"] a');
            for (let i = 0; i < tabs.length; i++) {
              const tabText = await tabs[i].textContent();
              const tabBounds = await tabs[i].boundingBox();

              if (tabBounds) {
                console.log(`      탭 ${i + 1}: "${tabText.trim()}" (${tabBounds.width}x${tabBounds.height})`);

                // 텍스트 잘림 체크
                if (tabBounds.width < 50) {
                  console.log(`      ⚠️  탭 너비가 너무 좁음: ${tabBounds.width}px`);
                }
              }
            }

            // 뱃지 렌더링 체크
            const badges = await page.$$('[data-testid="mobile-bottom-nav"] span[style*="background"]');
            console.log(`      뱃지 개수: ${badges.length}`);

            // 잠금 아이콘 체크
            const lockIcons = await page.$$eval('[data-testid="mobile-bottom-nav"] span', spans =>
              spans.filter(span => span.textContent.includes('🔒')).length
            );
            console.log(`      잠금 아이콘 개수: ${lockIcons}`);

          } else {
            console.log('    ❌ 모바일 네비게이션이 표시되지 않음');
          }

          // 2. 메인 콘텐츠 텍스트 오버플로우 체크
          const contentElements = await page.$$eval('main *', elements => {
            return elements
              .filter(el => el.textContent && el.textContent.length > 10)
              .slice(0, 20) // 상위 20개만 체크
              .map(el => ({
                tag: el.tagName.toLowerCase(),
                text: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? '...' : ''),
                width: el.offsetWidth,
                height: el.offsetHeight,
                scrollWidth: el.scrollWidth,
                isOverflowing: el.scrollWidth > el.offsetWidth
              }));
          });

          console.log('    📝 메인 콘텐츠 텍스트 체크:');
          contentElements.forEach((el, idx) => {
            if (el.isOverflowing) {
              console.log(`      ⚠️  오버플로우: ${el.tag} "${el.text}" (${el.width}px < ${el.scrollWidth}px)`);
            } else if (idx < 5) { // 처음 5개는 정상적인 것도 표시
              console.log(`      ✅ 정상: ${el.tag} "${el.text}" (${el.width}px)`);
            }
          });

          // 3. 한글 폰트 렌더링 체크
          const koreanText = await page.$$eval('*', elements => {
            const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
            return elements
              .filter(el => koreanRegex.test(el.textContent))
              .slice(0, 10)
              .map(el => {
                const computedStyle = window.getComputedStyle(el);
                return {
                  text: el.textContent.match(koreanRegex).join('').substring(0, 20),
                  fontSize: computedStyle.fontSize,
                  fontFamily: computedStyle.fontFamily,
                  fontWeight: computedStyle.fontWeight,
                  lineHeight: computedStyle.lineHeight
                };
              });
          });

          console.log('    🇰🇷 한글 텍스트 폰트 체크:');
          koreanText.forEach((text, idx) => {
            if (idx < 3) { // 처음 3개만 표시
              console.log(`      "${text.text}" - ${text.fontSize} ${text.fontFamily.split(',')[0]}`);
            }
          });

          // 4. 스크린샷 캡처
          const screenshotPath = `mobile-ui-${browserName.toLowerCase()}-${viewport.name.replace(/\s/g, '')}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`    📸 스크린샷 저장: ${screenshotPath}`);

          // 5. 버튼 클릭 가능성 체크 (44px 최소 터치 영역)
          const clickableElements = await page.$$eval('button, a, [role="button"]', elements => {
            return elements.map(el => {
              const rect = el.getBoundingClientRect();
              return {
                tag: el.tagName.toLowerCase(),
                text: el.textContent.substring(0, 20),
                width: rect.width,
                height: rect.height,
                isTouchFriendly: rect.width >= 44 && rect.height >= 44
              };
            });
          });

          console.log('    👆 터치 친화적 요소 체크:');
          const smallElements = clickableElements.filter(el => !el.isTouchFriendly);
          if (smallElements.length > 0) {
            smallElements.slice(0, 3).forEach(el => {
              console.log(`      ⚠️  터치 영역 부족: ${el.tag} "${el.text}" (${el.width}x${el.height}px)`);
            });
          } else {
            console.log('      ✅ 모든 클릭 요소가 터치 친화적');
          }

        } catch (error) {
          console.log(`    ❌ 오류: ${error.message}`);
        }

        await context.close();
        console.log('');
      }

      await browserInstance.close();
      console.log('');

    } catch (error) {
      console.log(`  ❌ ${browserName} 브라우저 실행 실패: ${error.message}\n`);
    }
  }

  console.log('🔍 모바일 UI 검사 완료!');
}

// 실행
checkMobileUIIssues().catch(console.error);