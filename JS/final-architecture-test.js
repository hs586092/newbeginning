#!/usr/bin/env node
/**
 * 최종 댓글 시스템 아키텍처 검증
 * SocialFeed + PostInteractionsV2 + Portal 기반 시스템 통합 테스트
 */

import { chromium } from 'playwright'

async function finalArchitectureTest() {
  console.log('🎯 최종 댓글 시스템 아키텍처 검증 시작...')
  
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
    console.log('📄 사이트 접속: https://newbeginning-cmhzclnub-hs586092s-projects.vercel.app')
    await page.goto('https://newbeginning-cmhzclnub-hs586092s-projects.vercel.app')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // 1단계: SocialFeed 렌더링 확인
    console.log('🔍 1단계: SocialFeed 컴포넌트 렌더링 확인...')
    
    const articles = await page.locator('article').count()
    console.log(`📊 Article 개수: ${articles}`)
    
    if (articles === 0) {
      console.log('❌ SocialFeed 게시글이 렌더링되지 않았습니다.')
      return
    }
    
    // 2단계: PostInteractionsV2 확인 (V2 라벨 찾기)
    console.log('🔍 2단계: PostInteractionsV2 컴포넌트 확인...')
    
    const v2Labels = await page.locator('.bg-green-100.text-green-700:has-text("V2")').count()
    console.log(`🏷️ V2 라벨 개수: ${v2Labels}`)
    
    if (v2Labels === 0) {
      console.log('❌ PostInteractionsV2 컴포넌트가 로드되지 않았습니다.')
      return
    }
    
    console.log('✅ PostInteractionsV2 컴포넌트 확인됨!')
    
    // 3단계: 네이티브 DOM 이벤트 댓글 버튼 찾기 및 클릭
    console.log('🔍 3단계: 네이티브 DOM 댓글 버튼 테스트...')
    
    const firstArticle = page.locator('article').first()
    
    // V2 댓글 버튼 찾기 (녹색 경계선과 V2 라벨이 있는 버튼)
    const v2CommentButton = firstArticle.locator('.border-green-300:has(.bg-green-100.text-green-700:has-text("V2"))')
    
    const v2ButtonCount = await v2CommentButton.count()
    console.log(`🔘 V2 댓글 버튼 개수: ${v2ButtonCount}`)
    
    if (v2ButtonCount === 0) {
      console.log('❌ V2 댓글 버튼을 찾을 수 없습니다.')
      return
    }
    
    // 버튼 정보 출력
    const buttonText = await v2CommentButton.textContent()
    const buttonDataId = await v2CommentButton.getAttribute('data-post-id')
    console.log(`🎯 V2 댓글 버튼 발견: "${buttonText}" (Post ID: ${buttonDataId})`)
    
    // 4단계: 댓글 버튼 클릭 및 콘솔 로그 확인
    console.log('🔍 4단계: V2 댓글 버튼 클릭 테스트...')
    
    await v2CommentButton.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    
    // 클릭 전 콘솔 로그 개수 확인
    const preClickLogCount = consoleLogs.length
    
    console.log('👆 V2 댓글 버튼 클릭...')
    await v2CommentButton.click()
    
    // 클릭 후 잠시 대기
    await page.waitForTimeout(3000)
    
    // 5단계: Portal 기반 댓글 모달 확인
    console.log('🔍 5단계: Portal 댓글 모달 확인...')
    
    const modal = page.locator('.fixed.inset-0.z-50')
    const modalVisible = await modal.isVisible()
    console.log(`📝 댓글 모달 표시: ${modalVisible}`)
    
    // 6단계: 네이티브 DOM 이벤트 로그 확인
    console.log('🔍 6단계: 네이티브 DOM 이벤트 로그 분석...')
    
    const postClickLogs = consoleLogs.slice(preClickLogCount)
    const nativeDOMEventLogs = postClickLogs.filter(log => 
      log.includes('PostInteractionsV2') || 
      log.includes('네이티브 DOM') ||
      log.includes('댓글 토글')
    )
    
    console.log(`📊 클릭 후 관련 콘솔 로그: ${nativeDOMEventLogs.length}개`)
    nativeDOMEventLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`)
    })
    
    // 7단계: 종합 결과 분석
    console.log('🔍 7단계: 종합 결과 분석...')
    
    const hasV2Component = v2Labels > 0
    const hasNativeDOMEvents = nativeDOMEventLogs.length > 0
    const hasPortalModal = modalVisible
    
    console.log('\n📊 === 최종 아키텍처 검증 결과 ===')
    console.log(`✅ PostInteractionsV2 로드: ${hasV2Component ? 'YES' : 'NO'}`)
    console.log(`✅ 네이티브 DOM 이벤트: ${hasNativeDOMEvents ? 'YES' : 'NO'}`)
    console.log(`✅ Portal 댓글 모달: ${hasPortalModal ? 'YES' : 'NO'}`)
    
    const architectureScore = [hasV2Component, hasNativeDOMEvents, hasPortalModal].filter(Boolean).length
    console.log(`🎯 아키텍처 구현 점수: ${architectureScore}/3`)
    
    if (architectureScore === 3) {
      console.log('🎉 완벽! 모든 새로운 아키텍처 구성요소가 정상 작동합니다!')
    } else if (architectureScore >= 2) {
      console.log('👍 양호! 주요 아키텍처 구성요소가 작동합니다.')
    } else {
      console.log('⚠️ 개선 필요: 일부 아키텍처 구성요소에 문제가 있습니다.')
    }
    
    // 모달이 열렸다면 닫기 테스트
    if (modalVisible) {
      console.log('🔍 8단계: 모달 닫기 테스트...')
      const closeButton = modal.locator('button[aria-label="댓글 닫기"]')
      if (await closeButton.count() > 0) {
        await closeButton.click()
        await page.waitForTimeout(2000)
        
        const modalStillVisible = await modal.isVisible()
        console.log(`📝 모달 닫기 후 상태: ${modalStillVisible ? '여전히 열림' : '정상적으로 닫힘'}`)
      }
    }
    
    // 최종 스크린샷
    console.log('📸 최종 아키텍처 스크린샷 촬영...')
    await page.screenshot({ 
      path: 'final-architecture-test.png', 
      fullPage: true 
    })
    console.log('✅ 스크린샷 저장: final-architecture-test.png')
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    console.log('\n📋 수집된 콘솔 로그 (최근 30개):')
    consoleLogs.slice(-30).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`)
    })
    
    console.log('⏳ 10초 대기 후 브라우저 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

finalArchitectureTest().catch(console.error)