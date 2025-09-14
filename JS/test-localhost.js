#!/usr/bin/env node
/**
 * 로컬호스트에서 댓글 시스템 테스트
 */

import { chromium } from 'playwright'

async function testLocalhost() {
  console.log('🏠 로컬호스트 댓글 시스템 테스트...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    const logEntry = `[${msg.type().toUpperCase()}] ${msg.text()}`
    console.log('🟡 로컬:', logEntry)
  })
  
  try {
    console.log('📄 로컬호스트 접속: http://localhost:3000')
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // 첫 번째 article 요소 찾기
    const firstArticle = page.locator('article').first()
    console.log(`📄 Article 개수: ${await page.locator('article').count()}`)
    
    // Article 내의 모든 버튼 분석
    const buttonsInArticle = firstArticle.locator('button')
    const buttonCount = await buttonsInArticle.count()
    console.log(`🔘 첫 번째 article 내 버튼 개수: ${buttonCount}`)
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttonsInArticle.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      console.log(`버튼 ${i + 1}:`)
      console.log(`  텍스트: "${text}"`)
      console.log(`  aria-label: "${ariaLabel}"`)
      
      // 댓글 버튼인지 확인
      if (/^\d+$/.test(text?.trim() || '') || ariaLabel?.includes('댓글')) {
        console.log(`  ⭐ 이것이 댓글 버튼입니다!`)
        
        console.log(`👆 댓글 버튼 클릭 시도...`)
        
        try {
          await button.scrollIntoViewIfNeeded()
          await page.waitForTimeout(500)
          await button.click()
          console.log(`✅ 클릭 완료`)
          
          // 클릭 후 잠시 대기
          await page.waitForTimeout(3000)
          
          // 댓글 섹션 확인
          const commentSection = firstArticle.locator('.mt-4.pt-4.border-t')
          const commentSectionVisible = await commentSection.isVisible()
          console.log(`📝 댓글 섹션 보이는가: ${commentSectionVisible}`)
          
          // textarea 확인
          const textareaCount = await page.locator('textarea').count()
          console.log(`📝 Textarea 개수: ${textareaCount}`)
          
          break
          
        } catch (clickError) {
          console.error(`❌ 클릭 오류:`, clickError.message)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    console.log('⏳ 10초 대기 후 브라우저 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

testLocalhost().catch(console.error)