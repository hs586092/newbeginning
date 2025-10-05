/**
 * Playwright로 자세한 콘솔 로그 확인
 */

import { chromium } from 'playwright'

async function testWebsiteDetailed() {
  console.log('🧪 상세 웹사이트 테스트 시작...\n')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // 모든 콘솔 로그 캡처
    page.on('console', msg => {
      console.log(`[Console ${msg.type()}]: ${msg.text()}`)
    })

    // 네트워크 에러 캡처
    page.on('pageerror', error => {
      console.error(`[Page Error]: ${error.message}`)
    })

    page.on('requestfailed', request => {
      console.error(`[Request Failed]: ${request.url()}`)
    })

    // 페이지 로드
    console.log('📍 페이지 로드 중...\n')
    await page.goto('https://fortheorlingas.com/hospital', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // 15초 대기하면서 로그 확인
    console.log('\n⏳ 15초 동안 로그 모니터링...\n')
    await page.waitForTimeout(15000)

    // 최종 상태 확인
    console.log('\n📊 최종 상태 확인:')

    const loadingElements = await page.locator('[class*="animate-pulse"]').count()
    console.log(`  로딩 스켈레톤: ${loadingElements}개`)

    const hospitalCards = await page.locator('[class*="bg-white"][class*="rounded"]').count()
    console.log(`  화이트 카드: ${hospitalCards}개`)

    const content = await page.content()
    console.log(`  페이지 크기: ${content.length} bytes`)

    // 특정 텍스트 검색
    if (content.includes('우리아이 소아과')) {
      console.log('  ❌ Mock 데이터 발견!')
    }
    if (content.includes('무지개의원')) {
      console.log('  ✅ 실제 데이터 발견!')
    }
    if (content.includes('검색 결과가 없습니다')) {
      console.log('  ⚠️ "검색 결과가 없습니다" 메시지 발견')
    }

  } catch (error: any) {
    console.error('\n❌ 에러:', error.message)
  } finally {
    await browser.close()
  }
}

testWebsiteDetailed()
