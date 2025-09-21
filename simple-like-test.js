import { chromium } from 'playwright';

async function simpleLikeTest() {
  console.log('🔍 간단한 좋아요 테스트 시작...')

  const browser = await chromium.launch({
    headless: false,
    devtools: false
  })
  const page = await browser.newPage()

  // Console 로그 캡처
  const errors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
      console.log(`❌ 브라우저 에러: ${msg.text()}`)
    } else if (msg.text().includes('LikeProvider') || msg.text().includes('UUID')) {
      console.log(`🌐 브라우저: ${msg.text()}`)
    }
  })

  try {
    console.log('📍 1. 홈페이지 접속...')
    await page.goto('http://localhost:3001')

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('📍 2. 좋아요 버튼 찾기...')

    // 좋아요 버튼들 찾기 (다양한 방법)
    const likeButtons1 = await page.$$('[title*="좋아요"]')
    const likeButtons2 = await page.$$('[aria-label*="좋아요"]')
    const likeButtons3 = await page.$$('[role="button"]:has(svg[data-lucide="heart"])')
    const heartIcons = await page.$$('svg[data-lucide="heart"]')

    console.log(`Heart 아이콘 개수: ${heartIcons.length}`)
    console.log(`제목으로 찾은 좋아요 버튼: ${likeButtons1.length}`)
    console.log(`aria-label로 찾은 좋아요 버튼: ${likeButtons2.length}`)
    console.log(`Heart 아이콘으로 찾은 좋아요 버튼: ${likeButtons3.length}`)

    if (likeButtons1.length > 0) {
      console.log('📍 3. 첫 번째 좋아요 버튼 클릭...')

      const firstButton = likeButtons1[0]

      // 클릭 전 상태 확인
      console.log('클릭 전 버튼 상태 확인...')

      await firstButton.click()
      console.log('✅ 좋아요 버튼 클릭 완료')

      // 잠시 대기
      await page.waitForTimeout(2000)

      // 클릭 후 상태 확인
      console.log('클릭 후 상태 확인...')

      // 5초 후 자동 취소되는지 확인
      await page.waitForTimeout(5000)
      console.log('5초 후 최종 상태 확인...')
    }

    // 에러 요약
    console.log(`\n📊 총 ${errors.length}개의 에러 발생:`)
    errors.slice(0, 5).forEach((error, i) => {
      console.log(`${i+1}. ${error}`)
    })

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message)
  }

  console.log('\n⏳ 브라우저를 30초 동안 열어두어 수동 테스트가 가능합니다...')
  await page.waitForTimeout(30000)

  await browser.close()
}

simpleLikeTest().catch(console.error)