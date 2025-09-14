#!/usr/bin/env node
/**
 * 댓글 시스템 자동 테스트 스크립트
 * Playwright로 메인 피드 댓글 기능 검증
 */

import { chromium } from 'playwright'

async function testCommentsSystem() {
  console.log('🚀 댓글 시스템 테스트 시작...')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // 1. 메인 사이트 접속
    console.log('📄 메인 사이트 접속: https://www.fortheorlingas.com')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    
    // 2. 게시글이 있는지 확인
    console.log('🔍 게시글 확인 중...')
    const posts = await page.locator('article').count()
    console.log(`📋 ${posts}개 게시글 발견`)
    
    if (posts === 0) {
      console.log('❌ 게시글이 없습니다.')
      return
    }
    
    // 3. 첫 번째 게시글의 댓글 버튼 찾기
    console.log('💬 댓글 버튼 찾는 중...')
    const commentButton = page.locator('button').filter({ hasText: /\d+/ }).filter({ has: page.locator('svg') }).first()
    
    if (await commentButton.count() > 0) {
      console.log('✅ 댓글 버튼 발견!')
      
      // 4. 댓글 버튼 클릭
      console.log('👆 댓글 버튼 클릭...')
      await commentButton.click()
      await page.waitForTimeout(2000)
      
      // 5. 댓글 섹션이 열렸는지 확인
      const commentSection = page.locator('form').filter({ has: page.locator('textarea') })
      if (await commentSection.count() > 0) {
        console.log('✅ 댓글 섹션이 성공적으로 열렸습니다!')
        
        // 6. 댓글 입력 필드 확인
        const commentInput = page.locator('textarea[placeholder*="댓글"]').first()
        if (await commentInput.count() > 0) {
          console.log('✅ 댓글 입력 필드 발견!')
          
          // 7. 기존 댓글 확인
          const existingComments = await page.locator('.bg-gray-50').filter({ has: page.locator('p') }).count()
          console.log(`📝 기존 댓글 ${existingComments}개 발견`)
          
          // 8. 답글 버튼 확인 (Reply 아이콘)
          const replyButtons = await page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' }).count()
          console.log(`🔄 답글 버튼 ${replyButtons}개 발견`)
          
          if (replyButtons > 0) {
            console.log('✅ 답글 기능이 구현되어 있습니다!')
          }
          
        } else {
          console.log('❌ 댓글 입력 필드를 찾을 수 없습니다.')
        }
      } else {
        console.log('❌ 댓글 섹션이 열리지 않았습니다.')
      }
    } else {
      console.log('❌ 댓글 버튼을 찾을 수 없습니다.')
    }
    
    // 9. 스크린샷 촬영
    console.log('📸 스크린샷 촬영...')
    await page.screenshot({ 
      path: 'comment-system-test.png', 
      fullPage: true 
    })
    console.log('✅ 스크린샷 저장: comment-system-test.png')
    
    console.log('🎉 댓글 시스템 테스트 완료!')
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    await browser.close()
  }
}

// 스크립트 직접 실행
testCommentsSystem().catch(console.error)