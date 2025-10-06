/**
 * Main Cache Logic with Stale-While-Revalidate
 *
 * 5-level graceful degradation:
 * 1. Fresh cache (<7 days)
 * 2. Stale cache (>7 days, return + mark for next user to revalidate)
 * 3. Fresh crawl (no cache, acquire lock and crawl)
 * 4. Degraded (crawl failed, return very stale cache if available)
 * 5. Minimal (no data, return basic info)
 */

import { PlaceSummary, ApiResponse } from '@/types/place'
import { normalizePlaceName } from '@/lib/utils/normalizer'
import { createMetricsTracker, generateRequestId } from '@/lib/monitoring/performance'
import {
  getCacheByNormalizedName,
  getCacheAny,
  touchCache,
  markForRevalidation
} from '@/lib/cache/queries'
import {
  acquireLock,
  releaseLock,
  waitForLockRelease,
  isLocked
} from '@/lib/cache/lock'
import {
  savePlaceSummary,
  finishRevalidation,
  resetRevalidation
} from '@/lib/cache/database'
import { extractReviewsFromNaverMap } from '@/lib/crawler'
import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

/**
 * Generate AI summary from review text
 */
async function generateAISummary(
  placeName: string,
  reviewText: string
): Promise<Omit<PlaceSummary, 'naverMapUrl'>> {
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
    place_name_original: placeName,
    summary: result.summary,
    pros: result.pros || [],
    cons: result.cons || [],
    sentiment: result.sentiment || 'neutral',
    reviewCount: result.reviewCount || 0,
    naverMapUrl: '' // Will be set by caller
  }
}

/**
 * Perform fresh crawl with lock protection
 */
async function performFreshCrawl(
  placeName: string,
  normalizedName: string,
  requestId: string
): Promise<ApiResponse> {
  const metrics = createMetricsTracker(placeName, normalizedName, requestId)
  const lockKey = `crawl:${normalizedName}`

  try {
    // Acquire lock
    const lockAcquired = await acquireLock(lockKey, requestId)

    if (!lockAcquired) {
      // Someone else is crawling, wait for them
      const released = await waitForLockRelease(lockKey)

      if (released) {
        // Check cache again (other user should have saved result)
        const { fresh, stale } = await getCacheByNormalizedName(normalizedName)

        if (fresh) {
          metrics.recordCacheHit('fresh')
          await metrics.save()
          return { status: 'fresh', data: fresh, is_fresh: true }
        }

        if (stale) {
          metrics.recordCacheHit('stale')
          await metrics.save()
          return { status: 'stale', data: stale, is_fresh: false }
        }
      }

      // Lock timeout or cache still empty, fall through to degraded
      throw new Error('Lock timeout - other user failed to crawl')
    }

    // We have the lock, perform crawl
    const crawlStart = metrics.startCrawl()
    const { reviewText, naverUrl } = await extractReviewsFromNaverMap(placeName, metrics)
    metrics.endCrawl(crawlStart)

    // Generate AI summary
    const aiStart = metrics.startAI()
    const summary = await generateAISummary(placeName, reviewText)
    metrics.endAI(aiStart)

    const fullSummary: PlaceSummary = {
      ...summary,
      naverMapUrl: naverUrl
    }

    // Save to cache
    const dbStart = metrics.startDB()
    const saved = await savePlaceSummary(fullSummary, normalizedName)
    metrics.endDB(dbStart)

    // Release lock
    await releaseLock(lockKey)

    await metrics.save()

    return {
      status: 'fresh',
      data: saved,
      is_fresh: true
    }

  } catch (error: any) {
    // Release lock on error
    await releaseLock(lockKey)

    metrics.recordError(error, 'crawl')
    await metrics.save()

    // Level 4: Degraded - try to return any cached data
    const anyCached = await getCacheAny(normalizedName)

    if (anyCached) {
      return {
        status: 'degraded',
        data: anyCached,
        is_fresh: false,
        warning: '최신 데이터를 가져올 수 없어 이전 데이터를 보여드립니다'
      }
    }

    // Level 5: Minimal - return basic info
    return {
      status: 'minimal',
      data: {
        placeName,
        place_name_original: placeName,
        summary: '현재 리뷰 정보를 불러올 수 없습니다',
        pros: [],
        cons: [],
        sentiment: 'neutral',
        reviewCount: 0,
        naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`
      },
      is_fresh: false,
      error: error.message
    }
  }
}

/**
 * Main function: Fetch place summary with caching
 *
 * @param placeName - Original user search query
 * @returns API response with place summary
 */
export async function fetchPlaceSummary(placeName: string): Promise<ApiResponse> {
  const requestId = generateRequestId()
  const normalizedName = normalizePlaceName(placeName)

  if (!normalizedName) {
    return {
      status: 'minimal',
      data: {
        placeName,
        place_name_original: placeName,
        summary: '올바른 장소명을 입력해주세요',
        pros: [],
        cons: [],
        sentiment: 'neutral',
        reviewCount: 0,
        naverMapUrl: ''
      },
      is_fresh: false,
      error: 'Invalid place name'
    }
  }

  // Level 1: Check for fresh cache
  const { fresh, stale } = await getCacheByNormalizedName(normalizedName)

  if (fresh) {
    const metrics = createMetricsTracker(placeName, normalizedName, requestId)
    metrics.recordCacheHit('fresh')
    await touchCache(fresh.id!)
    await metrics.save()

    return {
      status: 'cached',
      data: fresh,
      is_fresh: true
    }
  }

  // Level 2: Stale cache - return immediately + mark for next user
  if (stale) {
    const metrics = createMetricsTracker(placeName, normalizedName, requestId)
    metrics.recordCacheHit('stale')
    await touchCache(stale.id!)

    // Check if someone is already revalidating
    if (!stale.is_revalidating) {
      // Try to mark for revalidation (atomic operation)
      const marked = await markForRevalidation(stale.id!)

      if (marked) {
        // This user should handle revalidation
        // But return stale data first for fast response
        const response: ApiResponse = {
          status: 'stale',
          data: stale,
          is_fresh: false,
          message: '최신 데이터를 확인 중입니다. 잠시 후 다시 검색해주세요.'
        }

        // Trigger revalidation for next user (async, no await)
        performFreshCrawl(placeName, normalizedName, requestId)
          .then(async (result) => {
            if (result.status === 'fresh') {
              await finishRevalidation(stale.id!, result.data)
            } else {
              await resetRevalidation(stale.id!)
            }
          })
          .catch(async (err) => {
            console.error('Revalidation failed:', err)
            await resetRevalidation(stale.id!)
          })

        await metrics.save()
        return response
      }
    }

    // Someone else is revalidating, just return stale
    await metrics.save()
    return {
      status: 'stale',
      data: stale,
      is_fresh: false,
      message: '데이터를 업데이트하고 있습니다. 잠시 후 다시 검색해주세요.'
    }
  }

  // Level 3: No cache, perform fresh crawl
  return await performFreshCrawl(placeName, normalizedName, requestId)
}
