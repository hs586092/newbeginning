#!/usr/bin/env node
/**
 * 새로운 댓글 시스템 아키텍처 테스트
 * Context + Portal 기반 시스템 검증
 */

import { chromium } from 'playwright'

async function newArchitectureTest() {
  console.log('🏗️ 새로운 댓글 시스템 아키텍처 테스트 시작...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // 콘솔 로그 수집
  const consoleLogs = []
  page.on('console', msg => {
    const logEntry = `[${msg.type().toUpperCase()}] ${msg.text()}`
    consoleLogs.push(logEntry)
    console.log('🟡 브라우저:', logEntry)
  })
  
  try {
    console.log('📄 사이트 접속: https://www.fortheorlingas.com')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // 1단계: PostCardV2 렌더링 확인
    console.log('🔍 1단계: PostCardV2 컴포넌트 렌더링 확인...')
    
    const articles = await page.locator('article').count()
    console.log(`📊 Article 개수: ${articles}`)
    
    if (articles === 0) {
      console.log('❌ PostCard가 렌더링되지 않았습니다.')
      return
    }
    
    // 2단계: 새로운 댓글 버튼 찾기 
    console.log('🔍 2단계: 새로운 댓글 버튼 찾기...')
    
    const firstArticle = page.locator('article').first()
    
    // 새로운 아키텍처의 댓글 버튼 찾기 (숫자 + "열림" 텍스트 또는 단순 숫자)
    const commentButtons = await firstArticle.locator('button').all()
    console.log(`🔘 첫 번째 article 내 버튼 개수: ${commentButtons.length}`)
    
    let commentButton = null
    for (let i = 0; i < commentButtons.length; i++) {
      const btn = commentButtons[i]
      const text = await btn.textContent()
      const ariaLabel = await btn.getAttribute('aria-label')
      
      console.log(`버튼 ${i + 1}: "${text}" / aria-label: "${ariaLabel}"`)
      
      // 댓글 버튼 식별 (aria-label에 "댓글"이 포함되거나 숫자만 있는 버튼)
      if (ariaLabel?.includes('댓글') || /^\d+(\s*열림)?$/.test(text?.trim() || '')) {
        commentButton = btn
        console.log(`  ⭐ 댓글 버튼 발견!`)
        break
      }
    }
    
    if (!commentButton) {
      console.log('❌ 댓글 버튼을 찾을 수 없습니다.')
      return
    }
    
    // 3단계: 댓글 버튼 클릭 테스트
    console.log('🔍 3단계: 댓글 버튼 클릭 테스트...')
    
    await commentButton.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    
    console.log('👆 댓글 버튼 클릭...')
    await commentButton.click()
    
    // 4단계: Portal 기반 댓글 모달 확인
    console.log('🔍 4단계: Portal 댓글 모달 확인...')
    await page.waitForTimeout(3000)
    
    // Portal로 생성된 모달 확인
    const modal = page.locator('.fixed.inset-0.z-50')
    const modalVisible = await modal.isVisible()
    console.log(`📝 댓글 모달 표시: ${modalVisible}`)
    
    if (modalVisible) {
      console.log('🎉 성공! Portal 기반 댓글 모달이 열렸습니다!')
      
      // 모달 내용 확인
      const modalHeader = await modal.locator('h3').textContent()
      console.log(`📋 모달 제목: "${modalHeader}"`)
      
      // 댓글 폼 확인
      const textarea = await modal.locator('textarea').count()
      const forms = await modal.locator('form').count()
      console.log(`📝 모달 내 Textarea: ${textarea}개, Form: ${forms}개`)
      
      // 닫기 버튼 테스트
      console.log('🔍 5단계: 모달 닫기 테스트...')
      const closeButton = modal.locator('button[aria-label="댓글 닫기"]')
      if (await closeButton.count() > 0) {
        await closeButton.click()
        await page.waitForTimeout(2000)
        
        const modalStillVisible = await modal.isVisible()
        console.log(`📝 모달 닫기 후 상태: ${modalStillVisible ? '여전히 열림' : '정상적으로 닫힘'}`)
      }
    } else {
      console.log('❌ Portal 댓글 모달이 열리지 않았습니다.')
      
      // 대신 인라인 댓글 섹션 확인
      const inlineComments = await firstArticle.locator('.mt-4.pt-4.border-t').count()
      console.log(`📝 인라인 댓글 섹션: ${inlineComments}개`)
    }
    
    // 최종 스크린샷
    console.log('📸 최종 스크린샷 촬영...')
    await page.screenshot({ 
      path: 'new-architecture-test.png', 
      fullPage: true 
    })
    console.log('✅ 스크린샷 저장: new-architecture-test.png')
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    console.log('\n📋 수집된 콘솔 로그:')
    consoleLogs.slice(-20).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`)
    })
    
    console.log('⏳ 10초 대기 후 브라우저 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

newArchitectureTest().catch(console.error)