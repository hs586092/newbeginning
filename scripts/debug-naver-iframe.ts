/**
 * 네이버 지도 iframe 구조 상세 디버깅
 */

import { chromium } from 'playwright'

async function debugNaverIframe() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  const hospitalName = '무지개의원'
  const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospitalName)}`

  console.log(`🔍 테스트: ${hospitalName}`)
  console.log(`📍 URL: ${searchUrl}\n`)

  await page.goto(searchUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  })

  await page.waitForTimeout(5000)

  // 첫 번째 검색 결과 클릭
  try {
    const firstResult = page.locator('li a').first()
    await firstResult.click()
    console.log('✅ 검색 결과 클릭 성공\n')
    await page.waitForTimeout(5000)
  } catch (e) {
    console.log('❌ 검색 결과 클릭 실패')
    await browser.close()
    return
  }

  // 페이지의 모든 iframe 확인
  console.log('🔍 페이지의 모든 iframe 찾기:\n')
  const frames = page.frames()
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]
    const url = frame.url()
    const name = frame.name()
    console.log(`  Frame ${i}:`)
    console.log(`    - Name: ${name || '(none)'}`)
    console.log(`    - URL: ${url}`)
    console.log()
  }

  // iframe#entryIframe 확인
  console.log('🔍 iframe#entryIframe 찾기:\n')
  const iframeElement = await page.$('iframe#entryIframe')
  if (iframeElement) {
    console.log('  ✅ iframe#entryIframe 발견!')

    const frame = page.frameLocator('iframe#entryIframe')

    // iframe 내부 구조 확인
    console.log('\n🔍 iframe 내부 구조 확인:\n')

    // 가능한 탭 선택자들
    const tabSelectors = [
      'a:has-text("리뷰")',
      'button:has-text("리뷰")',
      '[role="tab"]:has-text("리뷰")',
      '.tab:has-text("리뷰")',
      'a[href*="review"]',
      'div[class*="review"] a',
      'nav a'
    ]

    for (const selector of tabSelectors) {
      try {
        const count = await frame.locator(selector).count()
        console.log(`  ${selector}: ${count}개`)

        if (count > 0) {
          const text = await frame.locator(selector).first().textContent()
          console.log(`    → 첫 번째 요소 텍스트: "${text}"`)
        }
      } catch (e) {
        console.log(`  ${selector}: 에러`)
      }
    }

    // 스크린샷
    await page.screenshot({ path: '/tmp/naver-iframe-debug.png', fullPage: true })
    console.log('\n📸 스크린샷 저장: /tmp/naver-iframe-debug.png')

    // iframe 내부 HTML 구조 출력
    console.log('\n🔍 iframe 내부 HTML 구조 샘플:\n')
    try {
      const html = await frame.locator('body').innerHTML()
      console.log(html.substring(0, 2000) + '...\n')
    } catch (e) {
      console.log('  ❌ HTML 가져오기 실패')
    }

  } else {
    console.log('  ❌ iframe#entryIframe 찾을 수 없음')

    // 대체 iframe 찾기
    console.log('\n🔍 대체 iframe 찾기:\n')
    const allIframes = await page.$$('iframe')
    console.log(`  총 ${allIframes.length}개의 iframe 발견`)

    for (let i = 0; i < allIframes.length; i++) {
      const id = await allIframes[i].getAttribute('id')
      const src = await allIframes[i].getAttribute('src')
      console.log(`  iframe ${i}: id="${id}", src="${src}"`)
    }
  }

  console.log('\n⏸️  브라우저를 열어둡니다. 확인 후 Ctrl+C로 종료하세요.')

  // 무한 대기 (수동 확인용)
  await new Promise(() => {})
}

debugNaverIframe().catch(console.error)
