#!/usr/bin/env node
/**
 * 수정된 댓글 시스템 최종 테스트
 */

import { chromium } from 'playwright'

async function finalCommentTest() {
  console.log('🔥 수정된 댓글 시스템 최종 테스트!')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    console.log('📄 메인 사이트 접속: https://www.fortheorlingas.com')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    
    // 콘솔 로그 수신
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('🟢 브라우저 콘솔:', msg.text())
      } else if (msg.type() === 'error') {
        console.log('🔴 브라우저 오류:', msg.text())
      }
    })
    
    console.log('⏳ 5초 대기...')
    await page.waitForTimeout(5000)
    
    // 첫 번째 게시글의 댓글 버튼 찾기
    console.log('🎯 댓글 버튼 찾기...')
    const commentButton = page.locator('article').first().locator('button').filter({ hasText: /^\d+$/ }).first()
    
    if (await commentButton.count() > 0) {
      const commentCount = await commentButton.textContent()
      console.log(`✅ 댓글 버튼 발견! 현재 댓글 수: ${commentCount}`)
      
      console.log('👆 댓글 버튼 클릭...')
      await commentButton.click()
      
      console.log('⏳ 댓글 섹션 로딩 대기...')
      await page.waitForTimeout(5000)
      
      // 다양한 방법으로 댓글 섹션 확인
      const textareas = await page.locator('textarea').count()
      const forms = await page.locator('form').count()
      const commentForms = await page.locator('form').filter({ has: page.locator('textarea') }).count()
      
      console.log(`📊 결과:`)
      console.log(`   - Textarea: ${textareas}개`)
      console.log(`   - Form: ${forms}개`) 
      console.log(`   - 댓글 폼: ${commentForms}개`)
      
      if (textareas > 0) {
        console.log('🎉 성공! 댓글 섹션이 열렸습니다!')
        
        // 댓글 입력 테스트 (로그인이 필요할 수 있음)
        const textarea = page.locator('textarea').first()
        const placeholder = await textarea.getAttribute('placeholder')
        console.log(`📝 입력 필드 placeholder: "${placeholder}"`)
        
      } else {
        console.log('❌ 댓글 섹션이 여전히 열리지 않습니다.')
        
        // 페이지의 모든 텍스트 확인
        const pageText = await page.textContent('body')
        if (pageText.includes('댓글')) {
          console.log('✅ 페이지에 "댓글" 텍스트는 존재합니다.')
        }
      }
    } else {
      console.log('❌ 댓글 버튼을 찾을 수 없습니다.')
    }
    
    // 최종 스크린샷
    console.log('📸 최종 스크린샷 촬영...')
    await page.screenshot({ 
      path: 'final-comment-test-result.png', 
      fullPage: true 
    })
    console.log('✅ 스크린샷 저장: final-comment-test-result.png')
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    console.log('⏳ 10초 대기 후 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

finalCommentTest().catch(console.error)