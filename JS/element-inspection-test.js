#!/usr/bin/env node
/**
 * DOM 요소 정밀 분석 테스트
 */

import { chromium } from 'playwright'

async function elementInspectionTest() {
  console.log('🔬 DOM 요소 정밀 분석 시작...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    console.log('🟡 브라우저:', msg.text())
  })
  
  try {
    console.log('📄 사이트 접속...')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // 첫 번째 article 분석
    const firstArticle = page.locator('article').first()
    
    console.log('🔍 모든 클릭 가능한 요소 분석...')
    
    // 모든 버튼과 클릭 가능한 요소 찾기
    const clickableElements = await page.evaluate(() => {
      const elements = []
      const article = document.querySelector('article')
      if (!article) return elements
      
      // 모든 버튼 찾기
      const buttons = article.querySelectorAll('button')
      buttons.forEach((btn, index) => {
        const rect = btn.getBoundingClientRect()
        elements.push({
          type: 'button',
          index: index + 1,
          text: btn.textContent?.trim() || '',
          ariaLabel: btn.getAttribute('aria-label'),
          className: btn.className,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          isVisible: rect.width > 0 && rect.height > 0,
          hasEventListener: btn.onclick !== null
        })
      })
      
      // 모든 링크도 확인
      const links = article.querySelectorAll('a')
      links.forEach((link, index) => {
        const rect = link.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          elements.push({
            type: 'link',
            index: index + 1,
            text: link.textContent?.trim() || '',
            href: link.href,
            className: link.className,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          })
        }
      })
      
      return elements
    })
    
    console.log(`\n📊 발견된 클릭 가능한 요소: ${clickableElements.length}개`)
    
    clickableElements.forEach(element => {
      console.log(`\n${element.type.toUpperCase()} ${element.index}:`)
      console.log(`  텍스트: "${element.text}"`)
      if (element.ariaLabel) console.log(`  aria-label: "${element.ariaLabel}"`)
      if (element.href) console.log(`  href: "${element.href}"`)
      console.log(`  위치: (${element.x}, ${element.y}) 크기: ${element.width}x${element.height}`)
      console.log(`  보이는가: ${element.isVisible}`)
      if (element.hasEventListener !== undefined) console.log(`  이벤트 리스너: ${element.hasEventListener}`)
      console.log(`  클래스: ${element.className}`)
      
      // 댓글 버튼으로 추정되는 요소 확인
      if (element.type === 'button' && /^\d+$/.test(element.text)) {
        console.log(`  ⭐ 댓글 버튼으로 추정됨!`)
      }
    })
    
    // 실제 클릭할 위치 확인
    console.log('\n🎯 클릭 테스트 시도...')
    
    const commentButton = clickableElements.find(el => 
      el.type === 'button' && /^\d+$/.test(el.text)
    )
    
    if (commentButton) {
      console.log(`📍 댓글 버튼 위치: (${commentButton.x + commentButton.width/2}, ${commentButton.y + commentButton.height/2})`)
      
      // 정확한 좌표로 클릭
      await page.mouse.click(
        commentButton.x + commentButton.width/2, 
        commentButton.y + commentButton.height/2
      )
      
      console.log('✅ 마우스 클릭 완료')
      await page.waitForTimeout(3000)
      
      // 클릭 후 상태 확인
      const afterClick = await page.evaluate(() => {
        const article = document.querySelector('article')
        const commentSection = article?.querySelector('.mt-4.pt-4.border-t')
        return {
          commentSectionExists: !!commentSection,
          textareaCount: document.querySelectorAll('textarea').length,
          formCount: document.querySelectorAll('form').length
        }
      })
      
      console.log('📊 클릭 후 상태:', afterClick)
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    console.log('⏳ 10초 대기 후 브라우저 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

elementInspectionTest().catch(console.error)