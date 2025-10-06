/**
 * Naver Map Crawler
 *
 * Extracts reviews from Naver Map using Puppeteer (Vercel compatible)
 * Accepts MetricsTracker for performance monitoring
 */

import { MetricsTracker } from '@/types/place'

export interface CrawlResult {
  reviewText: string
  naverUrl: string
}

/**
 * Get browser instance (Vercel-compatible)
 */
async function getBrowser() {
  // Check if running on Vercel
  if (process.env.VERCEL) {
    const chromium = require('@sparticuz/chromium')
    const puppeteer = require('puppeteer-core')

    // Add extra flags for iframe support
    const args = [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]

    return await puppeteer.launch({
      args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
  } else {
    // Local development - use Playwright
    const { chromium: playwrightChromium } = require('playwright')
    return await playwrightChromium.launch({ headless: true })
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

    browser = await getBrowser()
    const page = await browser.newPage()

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 })

    const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    // Wait longer for dynamic content
    await sleep(8000)

    // Extract ALL text from the page (including iframes)
    const allText = await page.evaluate(() => {
      return document.body.innerText
    })

    // Get current URL
    const currentUrl = page.url()

    await browser.close()

    // Check if we got meaningful content
    if (allText.length < 100) {
      throw new Error('검색 결과를 찾을 수 없습니다')
    }

    // Extract review section if exists
    let reviewText = allText
    const reviewIndex = allText.indexOf('리뷰')
    if (reviewIndex !== -1) {
      reviewText = allText.substring(reviewIndex, reviewIndex + 10000)
    } else {
      // If no "리뷰" found, use full text
      reviewText = allText
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
