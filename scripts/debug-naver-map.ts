/**
 * 네이버 지도 UI 디버깅
 */

import { chromium } from 'playwright'

async function debugNaverMap() {
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

  // 스크린샷
  await page.screenshot({ path: '/tmp/naver-map-debug.png', fullPage: true })
  console.log('📸 스크린샷 저장: /tmp/naver-map-debug.png\n')

  // 가능한 선택자들 확인
  const selectors = [
    'a.place_bluelink',
    '.search_item',
    '[class*="search"]',
    '[class*="place"]',
    'li[role="button"]',
    '.place_didmount',
    '#_pcmap_list_scroll_container li'
  ]

  console.log('🔍 선택자 확인:\n')
  for (const selector of selectors) {
    const count = await page.locator(selector).count()
    console.log(`  ${selector}: ${count}개`)
  }

  console.log('\n⏸️  브라우저를 열어둡니다. 확인 후 Ctrl+C로 종료하세요.')

  // 무한 대기 (수동 확인용)
  await new Promise(() => {})
}

debugNaverMap().catch(console.error)
