/**
 * 네이버 지도 직접 URL 테스트
 */

import { chromium } from 'playwright'

async function testDirectUrl() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  // 무지개의원 검색하여 실제 URL 패턴 확인
  const searchUrl = 'https://map.naver.com/v5/search/무지개의원'

  console.log('🔍 Step 1: 검색 페이지 접속')
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)

  // 검색 결과에서 링크 추출
  console.log('\n🔍 Step 2: 검색 결과 링크 확인')
  const links = await page.locator('li a').all()

  for (let i = 0; i < Math.min(links.length, 3); i++) {
    const href = await links[i].getAttribute('href')
    const text = await links[i].textContent()
    console.log(`  [${i}] ${text?.trim()}: ${href}`)
  }

  // 첫 번째 결과의 href 가져오기
  if (links.length > 0) {
    const firstHref = await links[0].getAttribute('href')
    console.log(`\n✅ 첫 번째 링크: ${firstHref}`)

    if (firstHref && firstHref.startsWith('/')) {
      const fullUrl = `https://map.naver.com${firstHref}`
      console.log(`\n🔍 Step 3: 직접 URL 접속 시도`)
      console.log(`📍 URL: ${fullUrl}`)

      await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(5000)

      // 현재 URL 확인
      const currentUrl = page.url()
      console.log(`📍 현재 URL: ${currentUrl}`)

      // 리뷰 관련 요소 확인
      console.log('\n🔍 Step 4: 리뷰 요소 확인')

      const reviewSelectors = [
        'a:has-text("리뷰")',
        'button:has-text("리뷰")',
        '[class*="review"]',
        '[class*="Review"]',
        'iframe'
      ]

      for (const selector of reviewSelectors) {
        const count = await page.locator(selector).count()
        console.log(`  ${selector}: ${count}개`)
      }

      // 스크린샷
      await page.screenshot({ path: '/tmp/direct-url-test.png', fullPage: true })
      console.log('\n📸 스크린샷: /tmp/direct-url-test.png')
    }
  }

  console.log('\n⏸️  브라우저를 열어둡니다. Ctrl+C로 종료하세요.')
  await new Promise(() => {})
}

testDirectUrl().catch(console.error)
