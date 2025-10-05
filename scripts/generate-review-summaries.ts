/**
 * 네이버 지도 리뷰를 읽고 AI로 요약 생성
 *
 * 동작:
 * 1. 네이버 지도에서 리뷰 텍스트 읽기 (상위 20개)
 * 2. OpenAI로 요약 (장점, 단점, 전체 요약)
 * 3. hospital_review_summaries 테이블에 저장
 * 4. 네이버 지도 링크도 함께 저장
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

interface ReviewText {
  text: string
  rating?: number
}

interface ReviewSummary {
  summary: string
  pros: string[]
  cons: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  totalReviews: number
  averageRating: number
  naverMapUrl: string
}

async function extractReviewsFromNaverMap(hospitalName: string): Promise<{ reviews: ReviewText[], naverUrl: string }> {
  console.log(`\n🔍 "${hospitalName}" 네이버 지도 리뷰 읽기...`)

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospitalName)}`
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    await page.waitForTimeout(5000)

    // iframe에서 검색 결과 찾기
    const searchFrame = page.frames().find(f => f.url().includes('pcmap.place.naver.com/place/list'))

    if (!searchFrame) {
      throw new Error('검색 결과 iframe을 찾을 수 없습니다')
    }

    // 첫 번째 검색 결과 클릭
    const firstResult = searchFrame.locator('a').first()
    await firstResult.click()
    console.log('   ✓ 검색 결과 클릭')
    await page.waitForTimeout(5000) // 5초 대기

    // 모든 iframe URL 출력 (디버깅용)
    console.log('   📍 현재 모든 iframe:')
    page.frames().forEach((f, i) => {
      console.log(`      [${i}] ${f.url()}`)
    })

    // 상세 페이지 iframe 찾기 (여러 패턴 시도)
    let detailFrame = page.frames().find(f =>
      f.url().includes('pcmap.place.naver.com/place/') &&
      !f.url().includes('/list')
    )

    // 대안: entry iframe 찾기
    if (!detailFrame) {
      detailFrame = page.frames().find(f =>
        f.url().includes('pcmap.place.naver.com') &&
        !f.url().includes('/list')
      )
    }

    if (!detailFrame) {
      throw new Error('상세 페이지 iframe을 찾을 수 없습니다')
    }

    console.log(`   ✓ 상세 페이지 iframe 발견: ${detailFrame.url()}`)

    // 리뷰 탭 클릭 시도
    try {
      const reviewTab = detailFrame.locator('a:has-text("리뷰")').or(detailFrame.locator('button:has-text("리뷰")'))
      if (await reviewTab.count() > 0) {
        await reviewTab.first().click()
        console.log('   ✓ 리뷰 탭 클릭')
        await page.waitForTimeout(3000)
      }
    } catch (e) {
      console.log('   ⚠️ 리뷰 탭 없음 (전체 페이지 사용)')
    }

    // 현재 URL (네이버 지도 링크)
    const currentUrl = page.url()

    // 상세 페이지에서 텍스트 추출
    const detailText = await detailFrame.evaluate(() => {
      return document.body.innerText
    })

    console.log(`✅ 텍스트 추출 완료 (${detailText.length}자)`)

    // 리뷰 섹션 텍스트만 추출 시도
    let reviewText = detailText

    // "리뷰" 키워드 이후 텍스트만 추출
    const reviewIndex = detailText.indexOf('리뷰')
    if (reviewIndex !== -1) {
      reviewText = detailText.substring(reviewIndex, reviewIndex + 10000)
      console.log(`   → 리뷰 섹션 발견 (${reviewText.length}자)`)
    }

    const reviews: ReviewText[] = [{
      text: reviewText.substring(0, 8000) // 최대 8000자
    }]

    await browser.close()

    return {
      reviews,
      naverUrl: currentUrl
    }

  } catch (error: any) {
    console.error('❌ 리뷰 추출 실패:', error.message)
    await browser.close()

    // 실패해도 네이버 지도 URL은 반환
    const fallbackUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospitalName)}`
    return {
      reviews: [],
      naverUrl: fallbackUrl
    }
  }
}

async function generateAISummary(
  hospitalName: string,
  reviewTexts: ReviewText[]
): Promise<Omit<ReviewSummary, 'naverMapUrl'> | null> {

  if (reviewTexts.length === 0) {
    console.log('⚠️ 리뷰 없음 - 요약 생성 스킵')
    return null
  }

  console.log(`🤖 Claude AI 요약 생성 중...`)

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  const reviewContent = reviewTexts.map((r, i) => `[리뷰 ${i + 1}]\n${r.text}`).join('\n\n')

  const prompt = `다음은 "${hospitalName}" 병원의 네이버 지도 페이지 텍스트입니다.
이 중에서 실제 환자/보호자 리뷰로 보이는 내용만 추출하여 요약해주세요.

${reviewContent}

다음 형식의 JSON으로만 응답해주세요 (다른 설명 없이):
{
  "summary": "1-2문장으로 전체 요약",
  "pros": ["장점1", "장점2", "장점3"],
  "cons": ["단점1", "단점2"],
  "sentiment": "positive|neutral|negative",
  "hasReviews": true|false
}

리뷰를 찾을 수 없으면 hasReviews를 false로 설정하세요.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // JSON 추출 (```json ... ``` 형식일 수도 있음)
    let jsonText = content.text.trim()
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
      jsonText = jsonText.slice(3, -3).trim()
    }

    const result = JSON.parse(jsonText)

    if (!result.hasReviews) {
      console.log('⚠️ AI가 리뷰를 찾지 못함')
      return null
    }

    console.log(`✅ 요약 생성 완료`)
    console.log(`   - 요약: ${result.summary}`)
    console.log(`   - 장점: ${result.pros.join(', ')}`)
    console.log(`   - 단점: ${result.cons.join(', ')}`)

    return {
      summary: result.summary,
      pros: result.pros || [],
      cons: result.cons || [],
      sentiment: result.sentiment || 'neutral',
      totalReviews: reviewTexts.length,
      averageRating: 0 // 별점 정보가 없으므로 0
    }

  } catch (error: any) {
    console.error('❌ AI 요약 실패:', error.message)
    return null
  }
}

async function saveSummaryToSupabase(
  hospitalId: string,
  summary: ReviewSummary
) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log(`💾 Supabase에 요약 저장 중...`)

  const { error } = await supabase
    .from('hospital_review_summaries')
    .upsert({
      hospital_id: hospitalId,
      summary: summary.summary,
      pros: summary.pros,
      cons: summary.cons,
      sentiment: summary.sentiment,
      total_reviews: summary.totalReviews,
      average_rating: summary.averageRating,
      naver_map_url: summary.naverMapUrl,
      last_updated: new Date().toISOString()
    })

  if (error) {
    console.error('❌ 저장 실패:', error.message)
  } else {
    console.log('✅ 저장 완료')
  }
}

async function main() {
  console.log('🚀 네이버 지도 리뷰 AI 요약 생성 시작 (Claude API)\n')

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY가 설정되지 않았습니다.')
    console.log('\n.env.local에 다음을 추가하세요:')
    console.log('ANTHROPIC_API_KEY=your-api-key\n')
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 강남구 병원 목록 가져오기 (1개만 테스트)
  const { data: hospitals, error } = await supabase
    .from('hospitals')
    .select('id, name')
    .limit(1)

  if (error || !hospitals) {
    console.error('❌ 병원 목록 조회 실패:', error)
    return
  }

  console.log(`📋 총 ${hospitals.length}개 병원의 리뷰를 요약합니다\n`)

  for (const hospital of hospitals) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🏥 ${hospital.name}`)
    console.log('='.repeat(60))

    // 1. 네이버 지도에서 리뷰 읽기
    const { reviews, naverUrl } = await extractReviewsFromNaverMap(hospital.name)

    if (reviews.length === 0) {
      console.log('⚠️ 리뷰 추출 실패 - 다음 병원으로')
      continue
    }

    // 2. AI 요약 생성
    const summaryData = await generateAISummary(hospital.name, reviews)

    if (!summaryData) {
      console.log('⚠️ 요약 생성 실패 - 다음 병원으로')
      continue
    }

    // 3. Supabase에 저장
    await saveSummaryToSupabase(hospital.id, {
      ...summaryData,
      naverMapUrl: naverUrl
    })

    // API 제한 대비 대기
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n🎉 모든 요약 생성 완료!')
}

main()
