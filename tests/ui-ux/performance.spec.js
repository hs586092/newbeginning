import { test, expect } from '@playwright/test'

test.describe('Performance Testing (Core Web Vitals)', () => {
  test('Core Web Vitals measurement', async ({ page }) => {
    console.log('⚡ Core Web Vitals 측정 시작...')
    
    await page.goto('https://newbeginning-seven.vercel.app')
    
    // Web Vitals 측정을 위한 스크립트 주입
    await page.addInitScript(() => {
      window.webVitals = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null
      }
      
      // LCP (Largest Contentful Paint) 측정
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        window.webVitals.lcp = lastEntry.startTime
      }).observe({ entryTypes: ['largest-contentful-paint'] })
      
      // FID (First Input Delay) 측정
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          window.webVitals.fid = entry.processingStart - entry.startTime
        })
      }).observe({ entryTypes: ['first-input'] })
      
      // CLS (Cumulative Layout Shift) 측정
      let clsValue = 0
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        window.webVitals.cls = clsValue
      }).observe({ entryTypes: ['layout-shift'] })
      
      // FCP (First Contentful Paint) 측정
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            window.webVitals.fcp = entry.startTime
          }
        })
      }).observe({ entryTypes: ['paint'] })
      
      // TTFB (Time to First Byte) 측정
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        window.webVitals.ttfb = navigation.responseStart - navigation.requestStart
      }
    })
    
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Web Vitals 수집 시간
    
    // 페이지와 상호작용하여 FID 측정 트리거
    const firstButton = page.locator('button').first()
    if (await firstButton.isVisible()) {
      await firstButton.click()
      await page.waitForTimeout(500)
    }
    
    // Web Vitals 결과 수집
    const vitals = await page.evaluate(() => window.webVitals)
    
    console.log('\n📊 Core Web Vitals 결과:')
    console.log('=' .repeat(40))
    
    // LCP (Largest Contentful Paint) - 2.5초 이하 권장
    if (vitals.lcp) {
      const lcpScore = vitals.lcp < 2500 ? '🟢' : vitals.lcp < 4000 ? '🟡' : '🔴'
      console.log(`${lcpScore} LCP: ${(vitals.lcp / 1000).toFixed(2)}s`)
      console.log(`   목표: 2.5s 이하 (현재: ${vitals.lcp < 2500 ? '달성' : '미달성'})`)
    }
    
    // FCP (First Contentful Paint) - 1.8초 이하 권장
    if (vitals.fcp) {
      const fcpScore = vitals.fcp < 1800 ? '🟢' : vitals.fcp < 3000 ? '🟡' : '🔴'
      console.log(`${fcpScore} FCP: ${(vitals.fcp / 1000).toFixed(2)}s`)
      console.log(`   목표: 1.8s 이하 (현재: ${vitals.fcp < 1800 ? '달성' : '미달성'})`)
    }
    
    // FID (First Input Delay) - 100ms 이하 권장
    if (vitals.fid !== null) {
      const fidScore = vitals.fid < 100 ? '🟢' : vitals.fid < 300 ? '🟡' : '🔴'
      console.log(`${fidScore} FID: ${vitals.fid.toFixed(1)}ms`)
      console.log(`   목표: 100ms 이하 (현재: ${vitals.fid < 100 ? '달성' : '미달성'})`)
    } else {
      console.log('⚪ FID: 측정되지 않음 (상호작용 필요)')
    }
    
    // CLS (Cumulative Layout Shift) - 0.1 이하 권장
    if (vitals.cls !== null) {
      const clsScore = vitals.cls < 0.1 ? '🟢' : vitals.cls < 0.25 ? '🟡' : '🔴'
      console.log(`${clsScore} CLS: ${vitals.cls.toFixed(3)}`)
      console.log(`   목표: 0.1 이하 (현재: ${vitals.cls < 0.1 ? '달성' : '미달성'})`)
    }
    
    // TTFB (Time to First Byte) - 600ms 이하 권장
    if (vitals.ttfb) {
      const ttfbScore = vitals.ttfb < 600 ? '🟢' : vitals.ttfb < 1000 ? '🟡' : '🔴'
      console.log(`${ttfbScore} TTFB: ${vitals.ttfb.toFixed(0)}ms`)
      console.log(`   목표: 600ms 이하 (현재: ${vitals.ttfb < 600 ? '달성' : '미달성'})`)
    }
    
    console.log('=' .repeat(40))
    
    // 전체 성능 점수 계산
    let totalScore = 0
    let measuredMetrics = 0
    
    if (vitals.lcp) {
      totalScore += vitals.lcp < 2500 ? 100 : vitals.lcp < 4000 ? 75 : 50
      measuredMetrics++
    }
    if (vitals.fcp) {
      totalScore += vitals.fcp < 1800 ? 100 : vitals.fcp < 3000 ? 75 : 50
      measuredMetrics++
    }
    if (vitals.fid !== null) {
      totalScore += vitals.fid < 100 ? 100 : vitals.fid < 300 ? 75 : 50
      measuredMetrics++
    }
    if (vitals.cls !== null) {
      totalScore += vitals.cls < 0.1 ? 100 : vitals.cls < 0.25 ? 75 : 50
      measuredMetrics++
    }
    
    const averageScore = measuredMetrics > 0 ? totalScore / measuredMetrics : 0
    console.log(`🎯 전체 성능 점수: ${averageScore.toFixed(1)}/100`)
    console.log(`📈 성능 등급: ${averageScore >= 90 ? '🟢 우수' : averageScore >= 75 ? '🟡 양호' : '🔴 개선 필요'}`)
    
    // Core Web Vitals 기준 통과 여부
    const passedVitals = [
      vitals.lcp && vitals.lcp < 2500,
      vitals.fcp && vitals.fcp < 1800, 
      vitals.fid === null || vitals.fid < 100,
      vitals.cls === null || vitals.cls < 0.1
    ].filter(Boolean).length
    
    console.log(`✅ 통과한 Core Web Vitals: ${passedVitals}/4`)
  })

  test('Resource loading performance', async ({ page }) => {
    console.log('📦 리소스 로딩 성능 분석...')
    
    // 네트워크 이벤트 수집
    const networkEvents = []
    page.on('response', response => {
      networkEvents.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type'] || '',
        size: response.headers()['content-length'] || 0
      })
    })
    
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    // 리소스 분류
    const resources = {
      html: networkEvents.filter(r => r.contentType.includes('text/html')),
      css: networkEvents.filter(r => r.contentType.includes('text/css') || r.url.includes('.css')),
      js: networkEvents.filter(r => r.contentType.includes('javascript') || r.url.includes('.js')),
      images: networkEvents.filter(r => r.contentType.includes('image/')),
      fonts: networkEvents.filter(r => r.contentType.includes('font/') || r.url.match(/\.(woff|woff2|ttf|eot)$/)),
      other: []
    }
    
    // 기타 리소스 분류
    resources.other = networkEvents.filter(r => 
      !resources.html.includes(r) && 
      !resources.css.includes(r) && 
      !resources.js.includes(r) && 
      !resources.images.includes(r) && 
      !resources.fonts.includes(r)
    )
    
    console.log('\n📊 리소스 로딩 분석:')
    console.log('=' .repeat(40))
    console.log(`📄 HTML: ${resources.html.length}개`)
    console.log(`🎨 CSS: ${resources.css.length}개`)
    console.log(`⚡ JavaScript: ${resources.js.length}개`)
    console.log(`🖼️ 이미지: ${resources.images.length}개`)
    console.log(`🔤 폰트: ${resources.fonts.length}개`)
    console.log(`📦 기타: ${resources.other.length}개`)
    console.log(`🌐 총 요청: ${networkEvents.length}개`)
    
    // 실패한 요청 확인
    const failedRequests = networkEvents.filter(r => r.status >= 400)
    if (failedRequests.length > 0) {
      console.log(`\n❌ 실패한 요청 (${failedRequests.length}개):`)
      failedRequests.forEach(req => {
        console.log(`   ${req.status} - ${req.url}`)
      })
    } else {
      console.log('✅ 모든 리소스 로딩 성공')
    }
  })

  test('Page loading performance across different pages', async ({ page }) => {
    console.log('🔄 페이지별 로딩 성능 비교...')
    
    const pages = [
      { name: 'Landing', url: 'https://newbeginning-seven.vercel.app' },
      { name: 'Login', url: 'https://newbeginning-seven.vercel.app/login' }
    ]
    
    const results = []
    
    for (const pageInfo of pages) {
      console.log(`\n📊 ${pageInfo.name} 페이지 성능 측정...`)
      
      const startTime = Date.now()
      await page.goto(pageInfo.url)
      await page.waitForLoadState('networkidle')
      const endTime = Date.now()
      
      const loadTime = endTime - startTime
      
      // Navigation Timing API 사용
      const timing = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        return {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          processing: navigation.domContentLoadedEventStart - navigation.responseEnd,
          onload: navigation.loadEventEnd - navigation.loadEventStart
        }
      })
      
      const result = {
        page: pageInfo.name,
        totalTime: loadTime,
        timing: timing
      }
      
      results.push(result)
      
      console.log(`   ⏱️ 총 로딩 시간: ${loadTime}ms`)
      console.log(`   🔍 DNS 조회: ${timing.dns.toFixed(0)}ms`)
      console.log(`   🤝 TCP 연결: ${timing.tcp.toFixed(0)}ms`)
      console.log(`   📤 요청: ${timing.request.toFixed(0)}ms`)
      console.log(`   📥 응답: ${timing.response.toFixed(0)}ms`)
      console.log(`   ⚙️ 처리: ${timing.processing.toFixed(0)}ms`)
      console.log(`   🎯 로드 완료: ${timing.onload.toFixed(0)}ms`)
      
      const grade = loadTime < 1000 ? '🟢 우수' : loadTime < 3000 ? '🟡 양호' : '🔴 개선 필요'
      console.log(`   📈 성능 등급: ${grade}`)
    }
    
    // 페이지별 성능 비교
    console.log('\n🆚 페이지별 성능 비교:')
    console.log('=' .repeat(40))
    results.forEach((result, index) => {
      const isFirst = index === 0
      const comparison = isFirst ? '' : ` (${results[0].totalTime < result.totalTime ? '느림' : '빠름'})`
      console.log(`${result.page}: ${result.totalTime}ms${comparison}`)
    })
    
    console.log('✅ 페이지별 성능 측정 완료')
  })
})