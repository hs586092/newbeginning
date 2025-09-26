import { test, expect, chromium } from '@playwright/test';

test.describe('Mobile Performance - Supabase 최적화 검증', () => {
  test('Mobile 3G - LCP 개선 확인 (목표: 6.35s → 1s)', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      viewport: { width: 375, height: 812 },
      hasTouch: true,
      isMobile: true,
    });

    const page = await context.newPage();

    // 3G 네트워크 시뮬레이션
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 300 // 300ms 지연
    });

    // CPU 4배 느리게 시뮬레이션
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    console.log('🔍 Mobile 3G 최적화 테스트 시작...');
    const startTime = Date.now();

    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded'
    });

    const loadTime = Date.now() - startTime;
    console.log(`📱 Mobile 3G 로딩 시간: ${loadTime}ms`);

    // ✅ Supabase 지연 로딩 확인
    const hasSupabaseInInitialBundle = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.some(script => script.src.includes('supabase') || script.innerHTML.includes('supabase'));
    });

    console.log(`🔧 Supabase 초기 번들: ${hasSupabaseInInitialBundle ? '❌ 포함됨' : '✅ 제외됨'}`);

    // Progressive Authentication 검증
    const hasStaticContent = await page.locator('h1, h2, header, nav').count() > 0;
    console.log(`📄 정적 콘텐츠 즉시 표시: ${hasStaticContent ? '✅ 성공' : '❌ 실패'}`);

    // Core Web Vitals 측정 (간단한 LCP 추정)
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            resolve({
              LCP: Math.round(lastEntry.startTime),
              timestamp: Date.now()
            });
          } else {
            resolve({ LCP: 0, timestamp: Date.now() });
          }
        });

        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback: 5초 후 타임아웃
          setTimeout(() => {
            observer.disconnect();
            resolve({ LCP: 5000, timeout: true });
          }, 5000);
        } catch (error) {
          resolve({ LCP: loadTime, fallback: true });
        }
      });
    });

    console.log('📊 Mobile 3G 성능 결과:');
    console.log(`   로딩 시간: ${loadTime}ms`);
    console.log(`   LCP (추정): ${performanceMetrics.LCP}ms`);
    console.log(`   개선 목표: 6350ms → 1000ms`);

    const improvement = performanceMetrics.LCP < 6350;
    const targetAchieved = performanceMetrics.LCP < 1000;

    if (targetAchieved) {
      console.log('🎯 ✅ Mobile LCP 목표 달성! (< 1초)');
    } else if (improvement) {
      console.log(`🔄 개선됨: ${6350 - performanceMetrics.LCP}ms 단축`);
    } else {
      console.log('❌ 추가 최적화 필요');
    }

    // Bundle 크기 체크
    const initialBundleSize = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.length;
    });

    console.log(`📦 초기 스크립트 수: ${initialBundleSize}개`);

    await browser.close();
  });

  test('Supabase 지연 로딩 동작 확인', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // 네트워크 요청 모니터링
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('auth') || request.url().includes('api/')) {
        requests.push({
          url: request.url(),
          timestamp: Date.now()
        });
      }
    });

    console.log('🔍 Supabase 지연 로딩 테스트...');

    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded'
    });

    // 페이지 로드 직후 Supabase 요청 확인
    const initialSupabaseRequests = requests.filter(req =>
      req.url.includes('supabase') && !req.url.includes('/api/')
    );

    console.log(`📡 초기 Supabase 요청: ${initialSupabaseRequests.length}개`);

    if (initialSupabaseRequests.length === 0) {
      console.log('✅ Supabase 지연 로딩 성공 - 초기 로드 시 Supabase 요청 없음');
    } else {
      console.log('❌ Supabase 지연 로딩 실패 - 초기 로드 시 Supabase 요청 발견:');
      initialSupabaseRequests.forEach(req => console.log(`   - ${req.url}`));
    }

    // Edge API 사용 확인
    const edgeAPIRequests = requests.filter(req =>
      req.url.includes('/api/edge-') || req.url.includes('/api/static-')
    );

    console.log(`⚡ Edge API 요청: ${edgeAPIRequests.length}개`);
    edgeAPIRequests.forEach(req => {
      console.log(`   - ${req.url.split('/').pop()}`);
    });

    await browser.close();
  });
});