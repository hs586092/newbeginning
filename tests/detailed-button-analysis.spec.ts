import { test, expect } from '@playwright/test';

test.describe('Detailed Button Analysis', () => {
  const baseURL = 'https://www.fortheorlingas.com';

  test('Comprehensive Button Inventory', async ({ page }) => {
    await page.goto(baseURL);
    console.log('🔍 Starting comprehensive button analysis...');

    // 모든 버튼 요소 찾기
    const buttons = page.locator('button, input[type="button"], input[type="submit"], [role="button"]');
    const buttonCount = await buttons.count();

    console.log(`📊 Found ${buttonCount} interactive button elements`);

    // 각 버튼 분석
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);

      try {
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        if (isVisible) {
          console.log(`✅ Button ${i + 1}: "${text?.trim() || ariaLabel || 'No text'}" - ${isEnabled ? 'Enabled' : 'Disabled'}`);
        }
      } catch (error) {
        console.log(`⚠️ Button ${i + 1}: Could not analyze - ${error}`);
      }
    }

    // 모든 링크 요소 찾기
    const links = page.locator('a');
    const linkCount = await links.count();

    console.log(`📊 Found ${linkCount} link elements`);

    // 실제 클릭 가능한 링크 분석 (상위 20개만)
    for (let i = 0; i < Math.min(linkCount, 20); i++) {
      const link = links.nth(i);

      try {
        const isVisible = await link.isVisible();
        const href = await link.getAttribute('href');
        const text = await link.textContent();

        if (isVisible && href) {
          console.log(`🔗 Link ${i + 1}: "${text?.trim() || href}" → ${href}`);
        }
      } catch (error) {
        console.log(`⚠️ Link ${i + 1}: Could not analyze - ${error}`);
      }
    }
  });

  test('Authentication State Analysis', async ({ page }) => {
    await page.goto(baseURL);
    console.log('🔍 Analyzing authentication-dependent elements...');

    // 로그인 관련 요소 확인
    const loginElements = [
      { selector: 'button:has-text("로그인")', name: '로그인 버튼' },
      { selector: 'a[href*="/login"]', name: '로그인 링크' },
      { selector: 'button:has-text("회원가입")', name: '회원가입 버튼' },
      { selector: 'a[href*="/signup"]', name: '회원가입 링크' },
      { selector: '[data-testid="user-menu"]', name: '사용자 메뉴' },
      { selector: 'button:has-text("로그아웃")', name: '로그아웃 버튼' }
    ];

    for (const element of loginElements) {
      try {
        const locator = page.locator(element.selector);
        const isVisible = await locator.isVisible();

        if (isVisible) {
          console.log(`✅ ${element.name} is visible`);
          const isClickable = await locator.isEnabled();
          console.log(`   └─ Clickable: ${isClickable}`);
        } else {
          console.log(`❌ ${element.name} is not visible`);
        }
      } catch (error) {
        console.log(`⚠️ ${element.name}: Error - ${error}`);
      }
    }
  });

  test('Header Component Analysis', async ({ page }) => {
    await page.goto(baseURL);
    console.log('🔍 Analyzing header components...');

    // 헤더 내 모든 interactive 요소 확인
    const headerInteractives = await page.locator('header button, header a, header [role="button"]').all();

    console.log(`📊 Found ${headerInteractives.length} interactive elements in header`);

    for (let i = 0; i < headerInteractives.length; i++) {
      const element = headerInteractives[i];

      try {
        const isVisible = await element.isVisible();
        if (isVisible) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          const text = await element.textContent();
          const href = await element.getAttribute('href');

          if (tagName === 'a' && href) {
            console.log(`🔗 Header link: "${text?.trim()}" → ${href}`);
          } else {
            console.log(`🔘 Header button: "${text?.trim()}"`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Header element ${i}: Error - ${error}`);
      }
    }
  });

  test('Sidebar Components Analysis', async ({ page }) => {
    await page.goto(baseURL);
    console.log('🔍 Analyzing sidebar components...');

    // 사이드바 컨테이너 찾기
    const sidebarSelectors = [
      'aside',
      '[class*="sidebar"]',
      '[class*="side-bar"]',
      '.lg\\:col-span-1', // Tailwind의 sidebar 클래스
      '[role="complementary"]'
    ];

    for (const selector of sidebarSelectors) {
      const sidebars = page.locator(selector);
      const count = await sidebars.count();

      if (count > 0) {
        console.log(`📊 Found ${count} sidebar(s) with selector: ${selector}`);

        for (let i = 0; i < count; i++) {
          const sidebar = sidebars.nth(i);
          const isVisible = await sidebar.isVisible();

          if (isVisible) {
            console.log(`  └─ Sidebar ${i + 1} is visible`);

            // 사이드바 내 버튼들 찾기
            const sidebarButtons = sidebar.locator('button, a, [role="button"]');
            const buttonCount = await sidebarButtons.count();

            for (let j = 0; j < buttonCount; j++) {
              const button = sidebarButtons.nth(j);
              const text = await button.textContent();
              const isClickable = await button.isEnabled();

              if (text?.trim()) {
                console.log(`    🔘 "${text.trim()}" - ${isClickable ? 'Clickable' : 'Not clickable'}`);
              }
            }
          }
        }
      }
    }
  });

  test('Feed and Content Area Analysis', async ({ page }) => {
    await page.goto(baseURL);
    console.log('🔍 Analyzing feed and content areas...');

    // 메인 콘텐츠 영역의 버튼들
    const mainContent = page.locator('main, [role="main"], .lg\\:col-span-3');
    const mainExists = await mainContent.first().isVisible();

    if (mainExists) {
      console.log('✅ Main content area found');

      const contentButtons = mainContent.locator('button, [role="button"]');
      const contentButtonCount = await contentButtons.count();

      console.log(`📊 Found ${contentButtonCount} buttons in main content`);

      // 주요 액션 버튼들 확인
      const actionButtons = [
        { selector: 'button:has-text("새로고침")', name: '새로고침 버튼' },
        { selector: 'button:has-text("더 보기")', name: '더 보기 버튼' },
        { selector: 'button:has-text("좋아요")', name: '좋아요 버튼' },
        { selector: 'button:has-text("댓글")', name: '댓글 버튼' },
        { selector: 'button:has-text("공유")', name: '공유 버튼' }
      ];

      for (const actionButton of actionButtons) {
        const button = page.locator(actionButton.selector);
        const isVisible = await button.isVisible();

        if (isVisible) {
          const count = await button.count();
          console.log(`✅ ${actionButton.name} found (${count} instances)`);
        } else {
          console.log(`❌ ${actionButton.name} not found`);
        }
      }
    }
  });

  test('Interactive Error Testing', async ({ page }) => {
    await page.goto(baseURL);
    console.log('🔍 Testing button click behaviors...');

    // 안전하게 클릭할 수 있는 버튼들 찾기 및 테스트
    const safeButtons = [
      'button:has-text("로그인")',
      'button[aria-label*="메뉴"]',
      'button[aria-label*="알림"]',
      'button[aria-label*="설정"]'
    ];

    for (const buttonSelector of safeButtons) {
      try {
        const button = page.locator(buttonSelector);
        const isVisible = await button.isVisible();

        if (isVisible) {
          const isEnabled = await button.isEnabled();
          const text = await button.textContent();

          console.log(`🔘 Testing button: "${text?.trim()}" - ${isEnabled ? 'Enabled' : 'Disabled'}`);

          if (isEnabled) {
            // 클릭 전 URL 기록
            const urlBefore = page.url();

            await button.click({ timeout: 5000 });
            await page.waitForLoadState('domcontentloaded');

            const urlAfter = page.url();

            if (urlBefore !== urlAfter) {
              console.log(`  └─ ✅ Successfully navigated from ${urlBefore} to ${urlAfter}`);
            } else {
              console.log(`  └─ ℹ️ Button clicked but no navigation occurred`);
            }

            // 원래 페이지로 돌아가기
            if (urlBefore !== urlAfter) {
              await page.goto(baseURL);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Error testing button ${buttonSelector}: ${error}`);
      }
    }
  });

  test('Mobile Responsiveness Check', async ({ page }) => {
    console.log('🔍 Testing mobile responsiveness...');

    // 데스크톱 뷰에서 시작
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(baseURL);

    const desktopButtons = await page.locator('button:visible').count();
    console.log(`📊 Desktop view: ${desktopButtons} visible buttons`);

    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    const tabletButtons = await page.locator('button:visible').count();
    console.log(`📊 Tablet view: ${tabletButtons} visible buttons`);

    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileButtons = await page.locator('button:visible').count();
    console.log(`📊 Mobile view: ${mobileButtons} visible buttons`);

    // 모바일 메뉴 토글 확인
    const hamburgerMenu = page.locator('button').filter({
      has: page.locator('svg')
    }).or(
      page.locator('button[aria-label*="메뉴"]')
    );

    const hasHamburgerMenu = await hamburgerMenu.count() > 0;
    console.log(`🍔 Hamburger menu present: ${hasHamburgerMenu}`);

    if (hasHamburgerMenu) {
      try {
        await hamburgerMenu.first().click();
        await page.waitForTimeout(500);

        const mobileMenuVisible = await page.locator('[role="dialog"]').or(
          page.locator('.mobile-menu')
        ).isVisible();

        console.log(`📱 Mobile menu functionality: ${mobileMenuVisible ? 'Working' : 'Not working'}`);
      } catch (error) {
        console.log(`⚠️ Mobile menu test failed: ${error}`);
      }
    }
  });
});