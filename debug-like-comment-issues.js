import { chromium } from 'playwright';

async function debugLikeCommentIssues() {
  console.log('🔍 좋아요/댓글 문제 디버깅 시작...')

  const browser = await chromium.launch({
    headless: false,
    devtools: true
  })
  const page = await browser.newPage()

  // Console 로그 캡처
  page.on('console', msg => {
    if (msg.text().includes('LikeProvider') || msg.text().includes('CommentProvider') || msg.text().includes('UUID')) {
      console.log(`🌐 브라우저: ${msg.text()}`)
    }
  })

  try {
    console.log('📍 1. 홈페이지 접속...')
    await page.goto('http://localhost:3001')

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('📍 2. 페이지 요소 확인...')

    // 페이지 전체 HTML 확인
    const htmlContent = await page.content()
    console.log(`페이지 HTML 길이: ${htmlContent.length}`)

    // 특정 텍스트들이 있는지 확인
    const hasTitle = await page.$('h1')
    console.log(`타이틀 요소 존재: ${!!hasTitle}`)

    const hasPostCards = await page.$$('div[class*="card"], .card')
    console.log(`카드 요소 개수: ${hasPostCards.length}`)

    // 좋아요 버튼들 찾기 (더 포괄적으로)
    const likeButtons = await page.$$('[title*="좋아요"], [aria-label*="좋아요"], button:has-text("좋아요")')
    console.log(`✅ 발견된 좋아요 버튼 개수: ${likeButtons.length}`)

    if (likeButtons.length > 0) {
      console.log('📍 3. 첫 번째 좋아요 버튼 클릭 테스트...')

      const firstButton = likeButtons[0]
      const postId = await page.getAttribute('[data-post-id]', 'data-post-id')
      console.log(`📍 포스트 ID: ${postId}`)

      // 클릭 전 상태 확인
      const beforeState = await page.textContent('[data-post-id] [role="button"][title*="좋아요"] span')
      console.log(`📍 클릭 전 상태: ${beforeState}`)

      // 좋아요 버튼 클릭
      await firstButton.click()

      // 잠시 대기
      await page.waitForTimeout(2000)

      // 클릭 후 상태 확인
      const afterState = await page.textContent('[data-post-id] [role="button"][title*="좋아요"] span')
      console.log(`📍 클릭 후 상태: ${afterState}`)

      // 좋아요가 자동으로 취소되는지 확인
      await page.waitForTimeout(3000)
      const finalState = await page.textContent('[data-post-id] [role="button"][title*="좋아요"] span')
      console.log(`📍 3초 후 최종 상태: ${finalState}`)

      if (beforeState === finalState) {
        console.log('❌ 문제 확인: 좋아요가 자동으로 취소됨')
      } else {
        console.log('✅ 좋아요 상태 정상 유지')
      }
    }

    console.log('📍 4. 댓글 버튼 테스트...')

    // 댓글 버튼 찾기 (더 포괄적으로)
    const commentButtons = await page.$$('[title*="댓글"], [aria-label*="댓글"], button:has-text("댓글")')
    console.log(`✅ 발견된 댓글 버튼 개수: ${commentButtons.length}`)

    if (commentButtons.length > 0) {
      console.log('📍 5. 첫 번째 댓글 버튼 클릭 테스트...')

      const firstCommentButton = commentButtons[0]
      await firstCommentButton.click()

      // 댓글 로딩 대기
      await page.waitForTimeout(3000)

      // UUID 오류 확인
      const consoleErrors = []
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('UUID')) {
          consoleErrors.push(msg.text())
        }
      })

      if (consoleErrors.length > 0) {
        console.log('❌ UUID 에러 발견:', consoleErrors)
      } else {
        console.log('✅ UUID 에러 없음')
      }
    }

    console.log('📍 6. 네트워크 요청 확인...')

    // 네트워크 요청 모니터링
    page.on('response', response => {
      if (response.url().includes('toggle_post_like') || response.url().includes('get_post_comments')) {
        console.log(`🌐 네트워크: ${response.status()} ${response.url()}`)
      }
    })

    // 추가 테스트를 위한 대기
    await page.waitForTimeout(5000)

  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  }

  console.log('⏳ 브라우저를 열어두어 수동 테스트 가능. 10초 후 자동 종료...')
  await page.waitForTimeout(10000)

  await browser.close()
}

debugLikeCommentIssues().catch(console.error)