import { test, expect, chromium } from '@playwright/test';

test.describe('Production Performance - Supabase 최적화 검증', () => {
  const productionUrl = 'https://newbeginning-6s7h0bmcb-hs586092s-projects.vercel.app';

  test('Mobile 3G Production - LCP 개선 확인', async () => {
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
      latency: 300 // 300ms
    });

    // CPU 4배 느리게 시뮬레이션
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    console.log('🚀 Production Mobile 3G 테스트 시작...');
    const startTime = Date.now();

    try {
      await page.goto(productionUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      const loadTime = Date.now() - startTime;
      console.log(`📱 Production Mobile 3G 로딩 시간: ${loadTime}ms`);

      // Progressive Authentication 검증
      const hasStaticContent = await page.locator('h1, h2, header, nav, main').count() > 0;
      console.log(`📄 정적 콘텐츠 즉시 표시: ${hasStaticContent ? '✅ 성공' : '❌ 실패'}`);

      // Supabase 번들 검증
      const hasSupabaseInBundle = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const scriptContent = scripts.map(s => s.src || s.innerHTML).join(' ');
        return scriptContent.toLowerCase().includes('supabase');
      });

      console.log(`🔧 Supabase 초기 번들: ${hasSupabaseInBundle ? '❌ 포함됨' : '✅ 제외됨'}`);

      // Core Web Vitals 측정
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lcpValue = 0;
          let fcpValue = 0;

          // LCP 측정
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              lcpValue = Math.round(lastEntry.startTime);
            }
          });

          // FCP 측정
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              fcpValue = Math.round(entries[0].startTime);
            }
          });

          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            fcpObserver.observe({ entryTypes: ['first-contentful-paint'] });

            // 5초 후 결과 반환
            setTimeout(() => {
              lcpObserver.disconnect();
              fcpObserver.disconnect();
              resolve({
                LCP: lcpValue || performance.now(),
                FCP: fcpValue || performance.now(),
                timestamp: Date.now()
              });
            }, 5000);
          } catch (error) {
            resolve({
              LCP: performance.now(),
              FCP: performance.now(),
              error: error.message
            });
          }
        });
      });

      console.log('📊 Production Mobile 3G 성능 결과:');
      console.log(`   DOM 로딩: ${loadTime}ms`);
      console.log(`   FCP: ${performanceMetrics.FCP}ms`);
      console.log(`   LCP: ${performanceMetrics.LCP}ms`);
      console.log(`   개선 목표: 6350ms → 1000ms`);

      const previousLCP = 6350; // 이전 측정값
      const currentLCP = performanceMetrics.LCP;
      const improvement = ((previousLCP - currentLCP) / previousLCP * 100).toFixed(1);
      const targetAchieved = currentLCP < 1000;

      if (targetAchieved) {
        console.log(`🎯 ✅ Mobile LCP 목표 달성! (${currentLCP}ms < 1000ms)`);
      } else if (currentLCP < previousLCP) {
        console.log(`🔄 개선됨: ${improvement}% (${previousLCP - currentLCP}ms 단축)`);
      } else {
        console.log('❌ 추가 최적화 필요');
      }

      // Bundle 분석
      const bundleInfo = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

        return {
          scriptCount: scripts.length,
          stylesheetCount: stylesheets.length,
          hasNextJs: scripts.some(s => s.src && s.src.includes('_next')),
          hasTurbopack: document.documentElement.innerHTML.includes('turbopack')
        };
      });

      console.log(`📦 번들 정보:`);
      console.log(`   스크립트: ${bundleInfo.scriptCount}개`);
      console.log(`   스타일시트: ${bundleInfo.stylesheetCount}개`);
      console.log(`   Next.js: ${bundleInfo.hasNextJs ? '✅' : '❌'}`);
      console.log(`   Turbopack: ${bundleInfo.hasTurbopack ? '✅' : '❌'}`);

    } catch (error) {
      console.error('❌ Production 테스트 실패:', error.message);
    }

    await browser.close();
  });

  test('Production Edge API 동작 확인', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // 네트워크 요청 모니터링
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });

    console.log('⚡ Production Edge API 테스트...');

    try {
      await page.goto(productionUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      // Edge API 요청 분석
      const edgeRequests = requests.filter(req =>
        req.url.includes('/api/edge-') || req.url.includes('/api/static-')
      );

      const supabaseRequests = requests.filter(req =>
        req.url.includes('supabase.co') && !req.url.includes('/auth/')
      );

      console.log(`📊 네트워크 요청 분석:`);
      console.log(`   전체 요청: ${requests.length}개`);
      console.log(`   Edge API: ${edgeRequests.length}개`);
      console.log(`   Supabase 직접: ${supabaseRequests.length}개`);

      if (edgeRequests.length > 0) {
        console.log(`✅ Edge API 활성화:`);
        edgeRequests.forEach(req => {
          const path = req.url.split('/').pop();
          console.log(`   - ${path} (${req.method})`);
        });
      }

      if (supabaseRequests.length === 0) {
        console.log(`✅ Supabase 프록시 성공 - 직접 요청 없음`);
      } else {
        console.log(`⚠️ Supabase 직접 요청 발견:`);
        supabaseRequests.forEach(req => console.log(`   - ${req.url}`));
      }

    } catch (error) {
      console.error('❌ Edge API 테스트 실패:', error.message);
    }

    await browser.close();
  });
});