#!/usr/bin/env node
/**
 * 댓글 시스템 디버깅 테스트 - 콘솔 로그 수집
 */

import { chromium } from 'playwright'

async function debugCommentTest() {
  console.log('🔍 댓글 시스템 디버깅 테스트 시작...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // 콘솔 로그 수집
  const consoleLogs = []
  page.on('console', msg => {
    const logEntry = `[${msg.type().toUpperCase()}] ${msg.text()}`
    consoleLogs.push(logEntry)
    console.log('🟡 브라우저 콘솔:', logEntry)
  })
  
  // 네트워크 오류 수집
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('🔴 네트워크 오류:', response.status(), response.url())
    }
  })
  
  try {
    console.log('📄 사이트 접속: https://www.fortheorlingas.com')
    await page.goto('https://www.fortheorlingas.com')
    await page.waitForLoadState('networkidle')
    
    console.log('⏳ 페이지 로딩 대기...')
    await page.waitForTimeout(3000)
    
    // 댓글 버튼 찾기
    const commentButton = page.locator('article').first().locator('button').filter({ hasText: /^\d+$/ }).first()
    
    if (await commentButton.count() > 0) {
      const commentCount = await commentButton.textContent()
      console.log(`✅ 댓글 버튼 발견! 댓글 수: ${commentCount}`)
      
      // 클릭 전 상태 확인
      const beforeClick = {
        textareas: await page.locator('textarea').count(),
        forms: await page.locator('form').count(),
        showComments: await page.evaluate(() => {
          const articles = document.querySelectorAll('article')
          if (articles.length > 0) {
            const article = articles[0]
            const commentSection = article.querySelector('.mt-4.pt-4.border-t')
            return commentSection ? 'visible' : 'hidden'
          }
          return 'no articles'
        })
      }
      
      console.log('📊 클릭 전 상태:', beforeClick)
      
      console.log('👆 댓글 버튼 클릭...')
      await commentButton.click()
      
      console.log('⏳ 클릭 후 3초 대기...')
      await page.waitForTimeout(3000)
      
      // 클릭 후 상태 확인
      const afterClick = {
        textareas: await page.locator('textarea').count(),
        forms: await page.locator('form').count(),
        showComments: await page.evaluate(() => {
          const articles = document.querySelectorAll('article')
          if (articles.length > 0) {
            const article = articles[0]
            const commentSection = article.querySelector('.mt-4.pt-4.border-t')
            return commentSection ? 'visible' : 'hidden'
          }
          return 'no articles'
        }),
        loadingElement: await page.locator('.animate-spin').count()
      }
      
      console.log('📊 클릭 후 상태:', afterClick)
      
      // React DevTools 정보 확인 (가능한 경우)
      const reactInfo = await page.evaluate(() => {
        // React DevTools가 있는지 확인
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          return 'React DevTools available'
        }
        return 'React DevTools not available'
      })
      console.log('⚛️ React 정보:', reactInfo)
      
    } else {
      console.log('❌ 댓글 버튼을 찾을 수 없습니다.')
    }
    
    console.log('\n📋 수집된 콘솔 로그:')
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`)
    })
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  } finally {
    console.log('⏳ 10초 대기 후 브라우저 종료...')
    await page.waitForTimeout(10000)
    await browser.close()
  }
}

debugCommentTest().catch(console.error)