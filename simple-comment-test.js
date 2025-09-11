#!/usr/bin/env node
/**
 * 간단한 댓글 시스템 확인 테스트
 */

import { chromium } from 'playwright'

async function simpleCommentTest() {
  console.log('🎯 간단한 댓글 시스템 확인...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 1초씩 천천히 진행
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    console.log('📄 사이트 접속: https://www.fortheorlingas.com')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    
    console.log('⏳ 5초 대기... (사이트 로딩)')
    await page.waitForTimeout(5000)
    
    // MessageCircle 아이콘과 숫자가 함께 있는 버튼 찾기
    console.log('💬 댓글 버튼 검색...')
    
    // 첫 번째 게시글의 댓글 버튼 찾기
    const firstArticle = page.locator('article').first()
    const commentButton = firstArticle.locator('button').filter({ hasText: /^\d+$/ }).first()
    
    if (await commentButton.count() > 0) {
      console.log('✅ 댓글 버튼 발견!')
      
      // 버튼 정보 출력
      const buttonText = await commentButton.textContent()
      console.log(`📊 댓글 개수: ${buttonText}`)
      
      console.log('👆 댓글 버튼 클릭...')
      await commentButton.click()
      
      console.log('⏳ 3초 대기... (댓글 섹션 로딩)')
      await page.waitForTimeout(3000)
      
      // 댓글 섹션 확인
      const hasTextarea = await page.locator('textarea').count()
      const hasCommentForm = await page.locator('form').count()
      
      console.log(`📝 Textarea 개수: ${hasTextarea}`)
      console.log(`📋 Form 개수: ${hasCommentForm}`)
      
      if (hasTextarea > 0) {
        console.log('✅ 댓글 섹션이 성공적으로 열렸습니다!')
      } else {
        console.log('❌ 댓글 섹션이 열리지 않았습니다.')
        
        // 페이지 새로고침 후 다시 시도
        console.log('🔄 페이지 새로고침 후 재시도...')
        await page.reload()
        await page.waitForTimeout(5000)
        
        const retryButton = page.locator('article').first().locator('button').filter({ hasText: /^\d+$/ }).first()
        if (await retryButton.count() > 0) {
          await retryButton.click()
          await page.waitForTimeout(3000)
          
          const retryTextarea = await page.locator('textarea').count()
          console.log(`🔄 재시도 Textarea 개수: ${retryTextarea}`)
        }
      }
    } else {
      console.log('❌ 댓글 버튼을 찾을 수 없습니다.')
      
      // 모든 버튼 출력
      console.log('🔍 페이지의 모든 버튼 분석...')
      const allButtons = await page.locator('button').all()
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const btn = allButtons[i]
        const text = await btn.textContent()
        console.log(`버튼 ${i+1}: "${text}"`)
      }
    }
    
    console.log('📸 최종 결과 스크린샷...')
    await page.screenshot({ 
      path: 'simple-comment-result.png', 
      fullPage: true 
    })
    
  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    console.log('⏳ 10초 대기 후 브라우저 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

simpleCommentTest().catch(console.error)