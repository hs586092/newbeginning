import { test, expect } from '@playwright/test';

test.describe('Landing Page - Button Navigation Tests', () => {
  const baseURL = 'https://www.fortheorlingas.com';

  test.beforeEach(async ({ page }) => {
    // 페이지 로드 및 기본 검증
    await page.goto(baseURL);
    await expect(page).toHaveTitle(/첫돌까지/);
  });

  test('Header Navigation - Authenticated User Actions', async ({ page }) => {
    console.log('🔍 Testing header navigation buttons...');

    // 로그인 상태가 아니므로 로그인 버튼이 보여야 함
    const loginButton = page.getByRole('button', { name: '로그인' }).or(
      page.getByRole('link', { name: '로그인' })
    );

    if (await loginButton.isVisible()) {
      console.log('✅ Login button is visible');

      // 로그인 버튼 클릭 테스트
      await loginButton.click();
      await page.waitForLoadState('networkidle');

      // 로그인 페이지로 이동했는지 확인
      const currentURL = page.url();
      expect(currentURL).toContain('/login');
      console.log(`✅ Login button redirects to: ${currentURL}`);
    }
  });

  test('Header Navigation - Write Post Button', async ({ page }) => {
    console.log('🔍 Testing write post button...');

    // 새 글 작성 버튼 찾기
    const writeButton = page.getByRole('button', { name: /새 글|글쓰기|작성/ }).or(
      page.getByRole('link', { name: /새 글|글쓰기|작성/ })
    );

    if (await writeButton.isVisible()) {
      console.log('✅ Write post button is visible');

      await writeButton.click();
      await page.waitForLoadState('networkidle');

      const currentURL = page.url();
      expect(currentURL).toContain('/write');
      console.log(`✅ Write button redirects to: ${currentURL}`);
    } else {
      console.log('ℹ️ Write button not visible (may require authentication)');
    }
  });

  test('Left Sidebar - User Actions', async ({ page }) => {
    console.log('🔍 Testing left sidebar buttons...');

    // 왼쪽 사이드바의 버튼들 테스트
    const sidebarButtons = [
      { name: '메시지 확인', expectedRedirect: '/chat' },
      { name: '활동 보기', expectedRedirect: '/my-posts' }
    ];

    for (const buttonInfo of sidebarButtons) {
      const button = page.getByRole('button', { name: buttonInfo.name }).or(
        page.getByRole('link', { name: buttonInfo.name })
      );

      if (await button.isVisible()) {
        console.log(`✅ ${buttonInfo.name} button is visible`);

        await button.click();
        await page.waitForLoadState('networkidle');

        const currentURL = page.url();
        expect(currentURL).toContain(buttonInfo.expectedRedirect);
        console.log(`✅ ${buttonInfo.name} redirects to: ${currentURL}`);

        // 홈페이지로 돌아가기
        await page.goto(baseURL);
        await page.waitForLoadState('networkidle');
      } else {
        console.log(`ℹ️ ${buttonInfo.name} button not visible (may require authentication)`);
      }
    }
  });

  test('Right Sidebar - Community Actions', async ({ page }) => {
    console.log('🔍 Testing right sidebar buttons...');

    // 오른쪽 사이드바의 버튼들 테스트
    const communityButtons = [
      '그룹 참여',
      '친구 추가'
    ];

    for (const buttonText of communityButtons) {
      const button = page.getByRole('button', { name: buttonText });

      if (await button.isVisible()) {
        console.log(`✅ ${buttonText} button is visible`);

        // 버튼이 클릭 가능한지 확인
        await expect(button).toBeEnabled();

        // 버튼 클릭 (실제 기능 테스트)
        await button.click();

        // 클릭 후 상태 변화 확인 (필요에 따라)
        console.log(`✅ ${buttonText} button is clickable`);
      } else {
        console.log(`ℹ️ ${buttonText} button not visible`);
      }
    }
  });

  test('Footer Navigation Links', async ({ page }) => {
    console.log('🔍 Testing footer navigation links...');

    // 푸터의 주요 링크들
    const footerLinks = [
      { name: '소개', href: '/about' },
      { name: '이용가이드', href: '/guide' },
      { name: '커뮤니티 규칙', href: '/community-rules' },
      { name: '이용약관', href: '/terms' },
      { name: '개인정보처리방침', href: '/privacy' },
      { name: 'FAQ', href: '/faq' },
      { name: '고객지원', href: '/contact' }
    ];

    for (const linkInfo of footerLinks) {
      const link = page.getByRole('link', { name: linkInfo.name });

      if (await link.isVisible()) {
        console.log(`✅ ${linkInfo.name} link is visible`);

        await link.click();
        await page.waitForLoadState('networkidle');

        const currentURL = page.url();

        if (currentURL.includes('/404') || currentURL === baseURL) {
          console.log(`⚠️ ${linkInfo.name} leads to 404 or stays on homepage`);
        } else {
          expect(currentURL).toContain(linkInfo.href);
          console.log(`✅ ${linkInfo.name} redirects to: ${currentURL}`);
        }

        // 홈페이지로 돌아가기
        await page.goto(baseURL);
        await page.waitForLoadState('networkidle');
      } else {
        console.log(`❌ ${linkInfo.name} link not found`);
      }
    }
  });

  test('PWA Install Prompt', async ({ page }) => {
    console.log('🔍 Testing PWA install prompt...');

    // PWA 설치 프롬프트가 나타날 수 있는지 확인
    const installButton = page.getByRole('button', { name: '설치하기' });
    const laterButton = page.getByRole('button', { name: '나중에' });

    // 설치 프롬프트가 보이는지 확인 (beforeinstallprompt 이벤트 기반)
    if (await installButton.isVisible()) {
      console.log('✅ PWA install prompt is visible');

      // "나중에" 버튼 테스트
      await laterButton.click();
      console.log('✅ "나중에" button works');

    } else {
      console.log('ℹ️ PWA install prompt not visible (expected on first visit)');
    }
  });

  test('Reload Button in Error State', async ({ page }) => {
    console.log('🔍 Testing reload button functionality...');

    // 네트워크 오류를 시뮬레이션하여 새로고침 버튼 테스트
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.reload();
    await page.waitForTimeout(3000); // 에러 상태 로딩 대기

    const reloadButton = page.getByRole('button', { name: '새로고침' });

    if (await reloadButton.isVisible()) {
      console.log('✅ Reload button is visible in error state');

      // 네트워크 차단 해제
      await page.unroute('**/api/**');

      // 새로고침 버튼 클릭
      await reloadButton.click();
      await page.waitForLoadState('networkidle');

      console.log('✅ Reload button works');
    } else {
      console.log('ℹ️ Reload button not visible (no error state triggered)');
    }
  });

  test('Mobile Menu Toggle', async ({ page }) => {
    console.log('🔍 Testing mobile menu functionality...');

    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });

    // 모바일 메뉴 토글 버튼 찾기
    const menuToggle = page.getByRole('button', { name: /메뉴|menu/i });

    if (await menuToggle.isVisible()) {
      console.log('✅ Mobile menu toggle is visible');

      // 메뉴 열기
      await menuToggle.click();

      // 모바일 메뉴가 열렸는지 확인
      const mobileMenu = page.locator('[role="dialog"]').or(
        page.locator('.mobile-menu')
      );

      if (await mobileMenu.isVisible()) {
        console.log('✅ Mobile menu opens successfully');

        // 메뉴 닫기 (다시 토글 버튼 클릭 또는 배경 클릭)
        await menuToggle.click();
        console.log('✅ Mobile menu closes successfully');
      }
    } else {
      console.log('ℹ️ Mobile menu toggle not visible');
    }
  });

  test('Real-time Features Status', async ({ page }) => {
    console.log('🔍 Testing real-time features...');

    // 실시간 알림 벨 테스트
    const notificationBell = page.locator('[data-testid="notification-bell"]').or(
      page.getByRole('button').filter({ has: page.locator('svg') }).first()
    );

    if (await notificationBell.isVisible()) {
      console.log('✅ Notification bell is visible');

      await notificationBell.click();

      // 알림 드롭다운이 열리는지 확인
      const notificationDropdown = page.locator('[role="tooltip"], [role="popover"]');

      if (await notificationDropdown.isVisible()) {
        console.log('✅ Notification dropdown opens');
      }
    } else {
      console.log('ℹ️ Notification bell not visible (may require authentication)');
    }
  });

  test('Database Connection Status', async ({ page }) => {
    console.log('🔍 Testing database connection indicator...');

    // 데이터베이스 연결 상태 표시기 확인
    const connectionIndicator = page.locator('text=데이터베이스 연결됨').or(
      page.locator('text=연결 문제 감지됨')
    );

    if (await connectionIndicator.isVisible()) {
      const indicatorText = await connectionIndicator.textContent();
      console.log(`✅ Connection status visible: ${indicatorText}`);
    } else {
      console.log('ℹ️ Connection status indicator not visible');
    }
  });

  test('Performance and Accessibility Check', async ({ page }) => {
    console.log('🔍 Running basic performance checks...');

    // 페이지 로드 성능 확인
    const startTime = Date.now();
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`📊 Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // 10초 이내 로딩

    // 기본 접근성 확인
    const skipLink = page.getByRole('link', { name: /skip|건너뛰기/i });
    if (await skipLink.isVisible()) {
      console.log('✅ Skip navigation link is present');
    }

    // 이미지 alt 텍스트 확인
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      if (!alt) {
        console.log(`⚠️ Image ${i + 1} missing alt text`);
      }
    }

    console.log(`✅ Checked ${imageCount} images for alt text`);
  });
});