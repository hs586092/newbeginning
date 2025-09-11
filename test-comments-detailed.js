#!/usr/bin/env node
/**
 * 댓글 시스템 상세 테스트 스크립트
 */

import { chromium } from 'playwright'

async function testCommentsDetailed() {
  console.log('🔍 댓글 시스템 상세 테스트 시작...')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // 1. 메인 사이트 접속
    console.log('📄 메인 사이트 접속: https://www.fortheorlingas.com')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    
    // 2. 모든 버튼 찾기
    console.log('🔍 모든 버튼 분석 중...')
    const buttons = await page.locator('button').all()
    console.log(`📋 총 ${buttons.length}개 버튼 발견`)
    
    // 3. MessageCircle 아이콘이 있는 버튼 찾기
    console.log('💬 댓글 버튼(MessageCircle) 찾는 중...')
    const commentButtons = await page.locator('button:has(svg)').all()
    
    for (let i = 0; i < Math.min(commentButtons.length, 10); i++) {
      const button = commentButtons[i]
      const text = await button.textContent()
      const innerHTML = await button.innerHTML()
      console.log(`버튼 ${i + 1}: "${text}" - HTML: ${innerHTML.substring(0, 100)}...`)
    }
    
    // 4. 특정 패턴으로 댓글 버튼 찾기
    console.log('🎯 댓글 버튼 패턴 매칭...')
    const commentButton = page.locator('button').filter({ hasText: /^\d+$/ }).first()
    
    if (await commentButton.count() > 0) {
      const buttonText = await commentButton.textContent()
      console.log(`✅ 댓글 버튼 발견! 텍스트: "${buttonText}"`)
      
      // 5. 댓글 버튼 클릭
      console.log('👆 댓글 버튼 클릭...')
      await commentButton.click()
      await page.waitForTimeout(3000)
      
      // 6. 댓글 섹션 확인 (여러 방법으로)
      console.log('🔍 댓글 섹션 확인 중...')
      
      // 방법 1: textarea 찾기
      const textarea = await page.locator('textarea').count()
      console.log(`📝 Textarea 개수: ${textarea}`)
      
      // 방법 2: form 찾기
      const forms = await page.locator('form').count()
      console.log(`📋 Form 개수: ${forms}`)
      
      // 방법 3: 댓글 관련 텍스트 찾기
      const commentText = await page.locator('text=댓글').count()
      console.log(`💬 "댓글" 텍스트 개수: ${commentText}`)
      
      // 7. DOM 변화 확인
      console.log('🔄 DOM 변화 확인 중...')
      const articles = await page.locator('article').all()
      
      for (let i = 0; i < Math.min(articles.length, 2); i++) {
        const article = articles[i]
        const hasTextarea = await article.locator('textarea').count()
        const hasForm = await article.locator('form').count()
        console.log(`게시글 ${i + 1}: textarea=${hasTextarea}, form=${hasForm}`)
      }
      
    } else {
      console.log('❌ 댓글 버튼을 찾을 수 없습니다.')
    }
    
    // 8. 최종 스크린샷
    console.log('📸 최종 스크린샷 촬영...')
    await page.screenshot({ 
      path: 'comment-detailed-test.png', 
      fullPage: true 
    })
    console.log('✅ 스크린샷 저장: comment-detailed-test.png')
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    await browser.close()
  }
}

testCommentsDetailed().catch(console.error)