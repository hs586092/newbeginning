/**
 * Playwright로 실제 웹사이트에서 병원 데이터 확인
 */

import { chromium } from 'playwright'

async function testWebsite() {
  console.log('🧪 웹사이트 병원 데이터 확인 시작...\n')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // 콘솔 로그 캡처
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('병원') || text.includes('getNearbyHospitals') || text.includes('Supabase')) {
        console.log(`[Browser Console]: ${text}`)
      }
    })

    // 페이지 로드
    console.log('📍 페이지 로드 중: https://fortheorlingas.com/hospital\n')
    await page.goto('https://fortheorlingas.com/hospital', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // 5초 대기 (데이터 로딩)
    console.log('⏳ 데이터 로딩 대기 중...\n')
    await page.waitForTimeout(5000)

    // 스크린샷 저장
    await page.screenshot({ path: '/tmp/hospital-page.png', fullPage: true })
    console.log('📸 스크린샷 저장: /tmp/hospital-page.png\n')

    // 병원 카드 확인
    const hospitalCards = await page.locator('[class*="hospital"]').count()
    console.log(`🏥 발견된 병원 카드: ${hospitalCards}개\n`)

    // 병원 이름 추출
    const hospitalNames = await page.locator('h3, h2, [class*="hospital"] [class*="name"]').allTextContents()
    console.log('📋 발견된 병원 이름들:')
    hospitalNames.slice(0, 10).forEach((name, i) => {
      if (name.trim()) {
        console.log(`  ${i + 1}. ${name.trim()}`)
      }
    })
    console.log()

    // Mock 데이터 키워드 검색
    const pageContent = await page.content()
    const mockKeywords = ['우리아이 소아과', '서울 아동병원', '행복한 소아청소년과', '건강한 아이들 의원', '02-1234-5678']

    console.log('🔍 Mock 데이터 키워드 검색:')
    for (const keyword of mockKeywords) {
      if (pageContent.includes(keyword)) {
        console.log(`  ❌ Mock 데이터 발견: "${keyword}"`)
      }
    }

    // 실제 네이버 데이터 키워드 검색
    const realKeywords = ['무지개의원', '삼성쑥쑥성장소아청소년과의원', '강남연세소아과의원', '휘마의원', '소화의원']

    console.log('\n✅ 실제 네이버 데이터 키워드 검색:')
    for (const keyword of realKeywords) {
      if (pageContent.includes(keyword)) {
        console.log(`  ✅ 실제 데이터 발견: "${keyword}"`)
      }
    }

    console.log('\n✅ 확인 완료!')

  } catch (error: any) {
    console.error('❌ 에러 발생:', error.message)
  } finally {
    await browser.close()
  }
}

testWebsite()
