/**
 * 네이버 지도 페이지 구조 확인
 */

import { chromium } from 'playwright'

async function debugNaverStructure() {
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

  // 리뷰 관련 선택자 확인
  console.log('🔍 리뷰 관련 선택자 확인:\n')

  const reviewSelectors = [
    // 탭 관련
    'a:has-text("리뷰")',
    'button:has-text("리뷰")',
    '[role="tab"]',
    '.tab',

    // 리뷰 컨텐츠 관련
    '.place_section_review',
    '[class*="review"]',
    '[class*="Review"]',

    // 일반적인 구조
    'nav a',
    'section',
    'article'
  ]

  for (const selector of reviewSelectors) {
    const count = await page.locator(selector).count()
    console.log(`  ${selector}: ${count}개`)

    if (count > 0 && count < 10) {
      try {
        for (let i = 0; i < Math.min(count, 3); i++) {
          const text = await page.locator(selector).nth(i).textContent()
          const cleanText = text?.trim().substring(0, 50)
          console.log(`    [${i}] "${cleanText}"`)
        }
      } catch (e) {
        // 무시
      }
    }
  }

  // 페이지 HTML 구조 샘플
  console.log('\n🔍 페이지 HTML 구조 샘플:\n')
  try {
    const bodyHTML = await page.locator('body').innerHTML()

    // 리뷰 관련 부분만 추출
    const reviewMatch = bodyHTML.match(/class="[^"]*review[^"]*"[^>]*>([^<]{0,100})/gi)
    if (reviewMatch) {
      console.log('  리뷰 관련 HTML 발견:')
      reviewMatch.slice(0, 5).forEach(match => {
        console.log(`    ${match}`)
      })
    } else {
      console.log('  리뷰 관련 HTML 없음')
    }
  } catch (e) {
    console.log('  HTML 가져오기 실패')
  }

  // 스크린샷
  await page.screenshot({
    path: '/tmp/naver-structure-debug.png',
    fullPage: true
  })
  console.log('\n📸 스크린샷: /tmp/naver-structure-debug.png')

  console.log('\n⏸️  브라우저를 열어둡니다. 수동으로 리뷰 탭을 찾아보세요.')
  console.log('💡 DevTools에서 리뷰 요소를 검사하여 정확한 선택자를 확인하세요.\n')

  // 무한 대기
  await new Promise(() => {})
}

debugNaverStructure().catch(console.error)
