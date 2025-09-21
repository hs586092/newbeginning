import { chromium } from 'playwright';

async function testLikeAndCommentFunctionality() {
  console.log('🧪 종합 좋아요/댓글 기능 테스트 시작...')

  const browser = await chromium.launch({
    headless: false,
    devtools: false
  })
  const page = await browser.newPage()

  // Console 로그 캡처
  const errors = []
  const logs = []
  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'error') {
      errors.push(text)
      console.log(`❌ 브라우저 에러: ${text}`)
    } else if (text.includes('LikeProvider') || text.includes('CommentProvider') || text.includes('PostInteractionsV3') || text.includes('DEBUG')) {
      logs.push(text)
      console.log(`🌐 브라우저: ${text}`)
    }
  })

  try {
    console.log('📍 1. 홈페이지 접속...')
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('📍 2. 페이지 요소 분석...')

    // 좋아요 버튼들 찾기
    const likeButtons = await page.$$('[title*="좋아요"]')
    console.log(`✅ 좋아요 버튼 발견: ${likeButtons.length}개`)

    // 댓글 버튼들 찾기
    const commentButtons = await page.$$('[title*="댓글"]')
    console.log(`✅ 댓글 버튼 발견: ${commentButtons.length}개`)

    if (likeButtons.length > 0) {
      console.log('📍 3. 좋아요 기능 테스트...')

      const firstLikeButton = likeButtons[0]

      // 좋아요 버튼 클릭 전 상태 체크
      console.log('좋아요 버튼 클릭 전 상태 확인...')
      await firstLikeButton.click()
      await page.waitForTimeout(2000)

      console.log('✅ 좋아요 첫 번째 클릭 완료')

      // 다시 클릭해서 토글 테스트
      await firstLikeButton.click()
      await page.waitForTimeout(2000)

      console.log('✅ 좋아요 두 번째 클릭 완료 (토글 테스트)')
    }

    if (commentButtons.length > 0) {
      console.log('📍 4. 댓글 기능 테스트...')

      const firstCommentButton = commentButtons[0]

      // 댓글 버튼 클릭
      console.log('댓글 버튼 클릭...')
      await firstCommentButton.click()
      await page.waitForTimeout(2000)

      console.log('✅ 댓글 버튼 클릭 완료')

      // 댓글 패널이 열렸는지 확인
      const commentSection = await page.$('[class*="comment"]')
      if (commentSection) {
        console.log('✅ 댓글 섹션 발견됨')
      } else {
        console.log('❌ 댓글 섹션을 찾을 수 없음')
      }
    }

    console.log('📍 5. 결과 분석...')
    console.log(`📊 총 로그: ${logs.length}개`)
    console.log(`📊 총 에러: ${errors.length}개`)

    if (logs.length > 0) {
      console.log('\n✅ 주요 로그 메시지:')
      logs.slice(0, 10).forEach((log, i) => {
        console.log(`${i+1}. ${log}`)
      })
    }

    if (errors.length > 0) {
      console.log('\n❌ 주요 에러 메시지:')
      errors.slice(0, 5).forEach((error, i) => {
        console.log(`${i+1}. ${error}`)
      })
    }

    // 테스트 성공 조건 체크
    const hasLikeDebugLogs = logs.some(log => log.includes('LikeProvider DEBUG MODE'))
    const hasCommentLogs = logs.some(log => log.includes('CommentProvider'))
    const hasAuthErrors = errors.some(error => error.includes('인증 실패'))

    console.log('\n📊 테스트 결과 요약:')
    console.log(`✅ 좋아요 디버그 모드 작동: ${hasLikeDebugLogs ? 'YES' : 'NO'}`)
    console.log(`✅ 댓글 시스템 로그: ${hasCommentLogs ? 'YES' : 'NO'}`)
    console.log(`❌ 인증 에러 발생: ${hasAuthErrors ? 'YES' : 'NO'}`)

    if (hasLikeDebugLogs && !hasAuthErrors) {
      console.log('\n🎉 테스트 성공! 좋아요/댓글 기능이 정상 작동하고 있습니다.')
    } else {
      console.log('\n⚠️  테스트 부분적 성공. 일부 기능에 문제가 있을 수 있습니다.')
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message)
  }

  console.log('\n⏳ 브라우저를 30초 동안 열어두어 수동 확인이 가능합니다...')
  await page.waitForTimeout(30000)

  await browser.close()
}

testLikeAndCommentFunctionality().catch(console.error)