import { chromium } from 'playwright'

async function debugPageContent() {
  console.log('🔍 페이지 내용 상세 분석...')

  const browser = await chromium.launch({
    headless: false,
    devtools: true
  })

  const page = await browser.newPage()

  try {
    console.log('1. 홈페이지 접속...')
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')

    console.log('2. 페이지 제목 확인...')
    const title = await page.title()
    console.log('📄 페이지 제목:', title)

    console.log('3. 모든 버튼 요소 찾기...')
    const buttons = await page.locator('button, div[role="button"], [role="button"]').all()
    console.log(`🔘 총 버튼 요소: ${buttons.length}개`)

    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      try {
        const text = await buttons[i].textContent()
        const ariaLabel = await buttons[i].getAttribute('aria-label')
        const className = await buttons[i].getAttribute('class')
        console.log(`  버튼 ${i+1}: "${text}" (aria-label: "${ariaLabel}")`)
        console.log(`    클래스: ${className}`)
      } catch (e) {
        console.log(`  버튼 ${i+1}: 정보 가져오기 실패`)
      }
    }

    console.log('4. Heart 아이콘이 포함된 요소 찾기...')
    const heartElements = await page.locator('svg, [class*="heart"], [aria-label*="좋아요"]').all()
    console.log(`❤️ Heart/좋아요 관련 요소: ${heartElements.length}개`)

    console.log('5. MessageCircle/댓글 관련 요소 찾기...')
    const commentElements = await page.locator('svg, [class*="message"], [aria-label*="댓글"], [placeholder*="댓글"]').all()
    console.log(`💬 댓글 관련 요소: ${commentElements.length}개`)

    console.log('6. 페이지 HTML 구조 일부 출력...')
    const bodyHTML = await page.locator('body').innerHTML()
    const htmlSnippet = bodyHTML.substring(0, 2000) + (bodyHTML.length > 2000 ? '...' : '')
    console.log('📝 페이지 HTML (첫 2000자):')
    console.log(htmlSnippet)

    console.log('\\n⏳ 수동 확인을 위해 10초간 브라우저 유지...')
    await page.waitForTimeout(10000)

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
  } finally {
    await browser.close()
  }
}

debugPageContent().catch(console.error)