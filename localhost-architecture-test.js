#!/usr/bin/env node
/**
 * 로컬호스트 댓글 시스템 아키텍처 검증
 * 개발 환경에서 새로운 아키텍처 테스트
 */

import { chromium } from 'playwright'

async function localhostArchitectureTest() {
  console.log('🏠 로컬호스트 댓글 시스템 아키텍처 검증 시작...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
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
    console.log('📄 로컬호스트 접속: http://localhost:3000')
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // 인증 상태 로딩 대기 (최대 10초)
    console.log('⏳ 인증 상태 로딩 대기...')
    await page.waitForTimeout(10000)
    
    // 스크린샷으로 현재 상태 확인
    await page.screenshot({ path: 'localhost-initial.png' })
    console.log('📸 초기 상태 스크린샷: localhost-initial.png')
    
    // 1단계: 페이지 콘텐츠 확인
    console.log('🔍 1단계: 페이지 콘텐츠 확인...')
    
    const articles = await page.locator('article').count()
    console.log(`📊 Article 개수: ${articles}`)
    
    // CustomerCentricPage 확인
    const customerPage = await page.locator('.max-w-7xl').count()
    console.log(`🏠 CustomerCentricPage 컨테이너: ${customerPage}개`)
    
    if (articles > 0) {
      console.log('✅ SocialFeed가 렌더링됨!')
      
      // 2단계: PostInteractionsV2 확인
      console.log('🔍 2단계: PostInteractionsV2 컴포넌트 확인...')
      
      const v2Labels = await page.locator('.bg-green-100.text-green-700:has-text("V2")').count()
      console.log(`🏷️ V2 라벨 개수: ${v2Labels}`)
      
      if (v2Labels > 0) {
        console.log('✅ PostInteractionsV2 컴포넌트 확인됨!')
        
        // 3단계: 댓글 버튼 클릭 테스트
        console.log('🔍 3단계: V2 댓글 버튼 클릭 테스트...')
        
        const v2CommentButton = page.locator('.border-green-300:has(.bg-green-100.text-green-700:has-text("V2"))').first()
        
        if (await v2CommentButton.count() > 0) {
          await v2CommentButton.scrollIntoViewIfNeeded()
          await page.waitForTimeout(1000)
          
          const preClickLogCount = consoleLogs.length
          
          console.log('👆 V2 댓글 버튼 클릭...')
          await v2CommentButton.click()
          await page.waitForTimeout(3000)
          
          // Portal 모달 확인
          const modal = page.locator('.fixed.inset-0.z-50')
          const modalVisible = await modal.isVisible()
          console.log(`📝 Portal 댓글 모달: ${modalVisible ? 'YES' : 'NO'}`)
          
          // 클릭 후 콘솔 로그 분석
          const postClickLogs = consoleLogs.slice(preClickLogCount)
          const relevantLogs = postClickLogs.filter(log => 
            log.includes('PostInteractionsV2') || 
            log.includes('네이티브') ||
            log.includes('댓글')
          )
          
          console.log(`📊 관련 콘솔 로그: ${relevantLogs.length}개`)
          relevantLogs.forEach((log, index) => {
            console.log(`  ${index + 1}. ${log}`)
          })
          
          // 결과 종합
          const hasV2 = v2Labels > 0
          const hasEvents = relevantLogs.length > 0
          const hasModal = modalVisible
          
          console.log('\n🎯 === 로컬호스트 아키텍처 검증 결과 ===')
          console.log(`✅ PostInteractionsV2: ${hasV2 ? 'YES' : 'NO'}`)
          console.log(`✅ 네이티브 DOM 이벤트: ${hasEvents ? 'YES' : 'NO'}`)
          console.log(`✅ Portal 모달: ${hasModal ? 'YES' : 'NO'}`)
          
          const score = [hasV2, hasEvents, hasModal].filter(Boolean).length
          console.log(`🏆 최종 점수: ${score}/3`)
          
          if (score === 3) {
            console.log('🎉 완벽! 모든 아키텍처 구성요소가 작동합니다!')
          } else if (score >= 2) {
            console.log('👍 양호! 주요 구성요소가 작동합니다.')
          } else {
            console.log('⚠️ 개선 필요: 구성요소에 문제가 있습니다.')
          }
          
        } else {
          console.log('❌ V2 댓글 버튼을 찾을 수 없습니다.')
        }
        
      } else {
        console.log('❌ PostInteractionsV2 컴포넌트를 찾을 수 없습니다.')
      }
      
    } else {
      console.log('ℹ️ SocialFeed 렌더링되지 않음 (인증 상태 또는 로딩 중)')
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ path: 'localhost-final.png', fullPage: true })
    console.log('📸 최종 상태 스크린샷: localhost-final.png')
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    console.log('\n📋 수집된 콘솔 로그 (최근 20개):')
    consoleLogs.slice(-20).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`)
    })
    
    console.log('⏳ 10초 대기 후 브라우저 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

localhostArchitectureTest().catch(console.error)