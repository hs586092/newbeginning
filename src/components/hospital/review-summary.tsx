'use client'

import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react'

interface ReviewSummaryProps {
  hospitalId: string
  summary?: string
  pros?: string[]
  cons?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
}

export function ReviewSummary({
  hospitalId,
  summary,
  pros,
  cons,
  sentiment = 'neutral'
}: ReviewSummaryProps) {
  // 실제 리뷰 데이터가 없으면 컴포넌트 숨김
  if (!summary && (!pros || pros.length === 0)) {
    return null
  }

  const sentimentColor = {
    positive: 'bg-green-50 border-green-200 text-green-800',
    neutral: 'bg-gray-50 border-gray-200 text-gray-800',
    negative: 'bg-red-50 border-red-200 text-red-800'
  }

  const sentimentIcon = {
    positive: '😊',
    neutral: '😐',
    negative: '😟'
  }

  return (
    <div className={`rounded-lg border p-3 ${sentimentColor[sentiment]}`}>
      <div className="flex items-start space-x-2 mb-2">
        <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">
            {sentimentIcon[sentiment]} AI 리뷰 요약
          </p>
          <p className="text-xs leading-relaxed">{summary}</p>
        </div>
      </div>

      {((pros && pros.length > 0) || (cons && cons.length > 0)) && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {pros && pros.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs font-medium">
                <ThumbsUp className="w-3 h-3" />
                <span>장점</span>
              </div>
              <ul className="text-xs space-y-0.5">
                {pros.slice(0, 3).map((pro, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cons && cons.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs font-medium">
                <ThumbsDown className="w-3 h-3" />
                <span>단점</span>
              </div>
              <ul className="text-xs space-y-0.5">
                {cons.slice(0, 3).map((con, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
