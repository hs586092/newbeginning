/**
 * 네이버 지도 리뷰 추출 디버깅
 */

import { chromium } from 'playwright'

async function debugReviewExtraction() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  const hospitalName = '무지개의원'
  const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospitalName)}`

  console.log(`🔍 테스트: ${hospitalName}`)
  console.log(`📍 URL: ${searchUrl}\n`)

  await page.goto(searchUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })

  await page.waitForTimeout(5000)

  // 페이지 전체 텍스트
  const bodyText = await page.evaluate(() => document.body.innerText)
  console.log('📄 페이지 텍스트 (처음 1000자):')
  console.log('='.repeat(60))
  console.log(bodyText.substring(0, 1000))
  console.log('='.repeat(60))

  // 현재 URL
  console.log(`\n📍 현재 URL: ${page.url()}`)

  // iframe 확인
  const frames = page.frames()
  console.log(`\n🔍 총 ${frames.length}개 프레임:`)
  frames.forEach((frame, i) => {
    console.log(`  [${i}] ${frame.url()}`)
  })

  // 스크린샷
  await page.screenshot({ path: '/tmp/review-extraction-debug.png', fullPage: true })
  console.log('\n📸 스크린샷: /tmp/review-extraction-debug.png')

  console.log('\n⏸️  브라우저를 열어둡니다. 수동으로 확인 후 Ctrl+C로 종료하세요.')
  await new Promise(() => {})
}

debugReviewExtraction().catch(console.error)
