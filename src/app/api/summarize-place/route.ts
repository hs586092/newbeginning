/**
 * 장소 리뷰 요약 API
 *
 * POST /api/summarize-place
 * Body: { placeName: string }
 *
 * 동작:
 * 1. 네이버 지도에서 장소 검색
 * 2. 리뷰 텍스트 크롤링
 * 3. Claude AI로 요약 생성
 * 4. 요약 + 네이버 링크 반환
 */

import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'
import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

interface PlaceSummary {
  placeName: string
  summary: string
  pros: string[]
  cons: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  naverMapUrl: string
  reviewCount: number
  error?: string
}

async function extractReviewsFromNaverMap(placeName: string): Promise<{ reviewText: string, naverUrl: string }> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    await page.waitForTimeout(5000)

    // iframe에서 검색 결과 찾기
    const searchFrame = page.frames().find(f => f.url().includes('pcmap.place.naver.com/place/list'))

    if (!searchFrame) {
      throw new Error('검색 결과를 찾을 수 없습니다')
    }

    // 첫 번째 검색 결과 클릭
    const firstResult = searchFrame.locator('a').first()
    await firstResult.click()
    await page.waitForTimeout(5000)

    // 상세 페이지 iframe 찾기
    let detailFrame = page.frames().find(f =>
      f.url().includes('pcmap.place.naver.com') &&
      !f.url().includes('/list')
    )

    if (!detailFrame) {
      throw new Error('상세 페이지를 찾을 수 없습니다')
    }

    // 리뷰 탭 클릭 시도
    try {
      const reviewTab = detailFrame.locator('a:has-text("리뷰")').or(detailFrame.locator('button:has-text("리뷰")'))
      if (await reviewTab.count() > 0) {
        await reviewTab.first().click()
        await page.waitForTimeout(3000)
      }
    } catch (e) {
      // 리뷰 탭 없으면 전체 페이지 사용
    }

    // 현재 URL (네이버 지도 링크)
    const currentUrl = page.url()

    // 상세 페이지에서 텍스트 추출
    const detailText = await detailFrame.evaluate(() => {
      return document.body.innerText
    })

    await browser.close()

    // 리뷰 섹션 텍스트만 추출 시도
    let reviewText = detailText
    const reviewIndex = detailText.indexOf('리뷰')
    if (reviewIndex !== -1) {
      reviewText = detailText.substring(reviewIndex, reviewIndex + 10000)
    }

    return {
      reviewText: reviewText.substring(0, 8000),
      naverUrl: currentUrl
    }

  } catch (error: any) {
    await browser.close()
    throw error
  }
}

async function generateAISummary(placeName: string, reviewText: string): Promise<Omit<PlaceSummary, 'naverMapUrl'>> {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  const prompt = `다음은 "${placeName}"의 네이버 지도 페이지 텍스트입니다.
이 중에서 실제 사용자 리뷰로 보이는 내용만 추출하여 요약해주세요.

${reviewText}

다음 형식의 JSON으로만 응답해주세요 (다른 설명 없이):
{
  "summary": "1-2문장으로 전체 요약",
  "pros": ["장점1", "장점2", "장점3"],
  "cons": ["단점1", "단점2"],
  "sentiment": "positive|neutral|negative",
  "reviewCount": 대략적인리뷰개수(숫자),
  "hasReviews": true|false
}

리뷰를 찾을 수 없으면 hasReviews를 false로 설정하세요.`

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

  // JSON 추출
  let jsonText = content.text.trim()
  const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
    jsonText = jsonText.slice(3, -3).trim()
  }

  const result = JSON.parse(jsonText)

  if (!result.hasReviews) {
    throw new Error('리뷰를 찾을 수 없습니다')
  }

  return {
    placeName,
    summary: result.summary,
    pros: result.pros || [],
    cons: result.cons || [],
    sentiment: result.sentiment || 'neutral',
    reviewCount: result.reviewCount || 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const { placeName } = await request.json()

    if (!placeName || typeof placeName !== 'string') {
      return NextResponse.json(
        { error: '장소명을 입력해주세요' },
        { status: 400 }
      )
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI API 키가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // 1. 네이버 지도에서 리뷰 크롤링
    const { reviewText, naverUrl } = await extractReviewsFromNaverMap(placeName)

    // 2. AI 요약 생성
    const summary = await generateAISummary(placeName, reviewText)

    // 3. 결과 반환
    const response: PlaceSummary = {
      ...summary,
      naverMapUrl: naverUrl
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('요약 생성 실패:', error)

    return NextResponse.json(
      {
        error: error.message || '리뷰 요약에 실패했습니다',
        placeName: '',
        summary: '',
        pros: [],
        cons: [],
        sentiment: 'neutral' as const,
        naverMapUrl: '',
        reviewCount: 0
      },
      { status: 500 }
    )
  }
}
