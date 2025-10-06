'use client'

import { useState } from 'react'
import { Search, ThumbsUp, ThumbsDown, ExternalLink, Loader2 } from 'lucide-react'

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

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlaceSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/summarize-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeName: query.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '요약에 실패했습니다')
      }

      // API returns { status, data, is_fresh }
      if (data.data) {
        setResult({
          placeName: data.data.placename || data.data.place_name_original,
          summary: data.data.summary,
          pros: data.data.pros || [],
          cons: data.data.cons || [],
          sentiment: data.data.sentiment,
          naverMapUrl: data.data.navermapurl || data.data.naverMapUrl,
          reviewCount: data.data.reviewcount || data.data.reviewCount || 0
        })
      } else {
        throw new Error('응답 형식이 올바르지 않습니다')
      }

    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200'
      case 'negative':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '긍정적'
      case 'negative':
        return '부정적'
      default:
        return '중립적'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            moree<span className="text-blue-600">.ai</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI가 요약하는 모든 리뷰
          </p>
          <p className="text-base text-gray-500">
            카페, 식당, 병원 등 어떤 장소든 검색하면 네이버 리뷰를 한눈에 요약해드립니다
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="장소명을 입력하세요 (예: 스타벅스 강남점, 무지개의원)"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 pr-14"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">리뷰를 분석하고 있습니다...</p>
            <p className="text-sm text-gray-500 mt-2">약 10-15초 소요됩니다</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              다른 장소명으로 다시 시도해주세요
            </p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className={`border-2 rounded-lg p-6 ${getSentimentColor(result.sentiment)}`}>
            {/* Place Name & Link */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {result.placeName}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-white rounded-full">
                    {getSentimentText(result.sentiment)}
                  </span>
                  <span>• 리뷰 약 {result.reviewCount}개</span>
                </div>
              </div>
              <a
                href={result.naverMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
              >
                네이버 보기
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-white rounded-lg">
              <p className="text-gray-800 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Pros & Cons */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Pros */}
              {result.pros.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">장점</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {result.cons.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-gray-900">단점</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.cons.map((con, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-red-600 mr-2">−</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Examples */}
        {!result && !loading && !error && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">예시로 검색해보세요:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['스타벅스 강남점', '무지개의원', '애플스토어 가로수길', '교보문고 광화문점'].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:border-blue-500 hover:text-blue-600 text-sm transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
