/**
 * Naver Map Crawler
 *
 * Extracts reviews from Naver Map using Playwright
 * Accepts MetricsTracker for performance monitoring
 */

import { chromium } from 'playwright'
import { MetricsTracker } from '@/types/place'

export interface CrawlResult {
  reviewText: string
  naverUrl: string
}

/**
 * Extract reviews from Naver Map
 *
 * @param placeName - Place name to search
 * @param metrics - Optional performance metrics tracker
 * @returns Review text and Naver Map URL
 */
export async function extractReviewsFromNaverMap(
  placeName: string,
  metrics?: MetricsTracker
): Promise<CrawlResult> {
  let browser

  try {
    const start = metrics?.startCrawl()

    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

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

    if (start && metrics) {
      metrics.endCrawl(start)
    }

    return {
      reviewText: reviewText.substring(0, 8000),
      naverUrl: currentUrl
    }

  } catch (error: any) {
    if (browser) {
      await browser.close()
    }

    if (metrics) {
      metrics.recordError(error, 'crawl')
    }

    throw error
  }
}
