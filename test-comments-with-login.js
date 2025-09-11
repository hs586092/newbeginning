#!/usr/bin/env node
/**
 * 로그인 상태에서 댓글 시스템 테스트
 */

import { chromium } from 'playwright'

async function testCommentsWithLogin() {
  console.log('🔐 로그인 상태에서 댓글 시스템 테스트 시작...')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // 1. 메인 사이트 접속
    console.log('📄 메인 사이트 접속: https://www.fortheorlingas.com')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    
    // 2. 로그인 버튼 찾기 및 클릭
    console.log('🔍 로그인 버튼 찾는 중...')
    const loginButton = page.locator('text=로그인').first()
    
    if (await loginButton.count() > 0) {
      console.log('✅ 로그인 버튼 발견!')
      await loginButton.click()
      await page.waitForTimeout(2000)
      
      // 3. Google 로그인 버튼 클릭 (가능한 경우)
      const googleLogin = page.locator('text=Google').first()
      if (await googleLogin.count() > 0) {
        console.log('🔍 Google 로그인 옵션 발견 (실제 로그인은 수동으로 필요)')
      }
    }
    
    // 4. 댓글 버튼 다시 찾기 (MessageCircle 아이콘으로)
    console.log('💬 댓글 버튼 찾는 중...')
    await page.waitForTimeout(3000)
    
    // 다양한 방법으로 댓글 버튼 찾기
    const commentSelectors = [
      'button:has-text("0")', // 댓글 개수가 0인 버튼
      'button:has(svg):has-text("0")', // SVG가 있고 0이 있는 버튼
      '[aria-label*="댓글"]', // 아리아 라벨에 댓글이 포함된 요소
      'button[aria-expanded]' // aria-expanded 속성이 있는 버튼
    ]
    
    let commentButton = null
    for (const selector of commentSelectors) {
      const button = page.locator(selector).first()
      if (await button.count() > 0) {
        commentButton = button
        console.log(`✅ 댓글 버튼 발견! 셀렉터: ${selector}`)
        break
      }
    }
    
    if (commentButton) {
      // 5. 댓글 버튼 클릭
      console.log('👆 댓글 버튼 클릭...')
      await commentButton.click()
      await page.waitForTimeout(3000)
      
      // 6. 다양한 방법으로 댓글 섹션 확인
      console.log('🔍 댓글 섹션 확인 중...')
      
      const checks = [
        { selector: 'textarea', name: 'Textarea' },
        { selector: 'form', name: 'Form' },
        { selector: '[placeholder*="댓글"]', name: '댓글 입력필드' },
        { selector: '.border-t', name: '구분선 (댓글 섹션)' },
        { selector: 'text=댓글 작성', name: '댓글 작성 버튼' }
      ]
      
      for (const check of checks) {
        const count = await page.locator(check.selector).count()
        console.log(`${check.name}: ${count}개`)
      }
      
      // 7. JavaScript 콘솔 에러 확인
      console.log('🔍 콘솔 에러 확인...')
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('❌ JS 에러:', msg.text())
        }
      })
      
      // 8. 현재 URL 확인
      const currentUrl = page.url()
      console.log(`📍 현재 URL: ${currentUrl}`)
      
    } else {
      console.log('❌ 댓글 버튼을 찾을 수 없습니다.')
    }
    
    // 9. 최종 스크린샷
    console.log('📸 최종 스크린샷 촬영...')
    await page.screenshot({ 
      path: 'comment-login-test.png', 
      fullPage: true 
    })
    console.log('✅ 스크린샷 저장: comment-login-test.png')
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    await browser.close()
  }
}

testCommentsWithLogin().catch(console.error)