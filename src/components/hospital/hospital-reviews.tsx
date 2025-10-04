'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, MessageSquare, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useResilientAuth } from '@/contexts/resilient-auth-context'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  content: string
  createdAt: Date
  likes: number
  hasLiked?: boolean
  pros: string[]
  cons: string[]
}

interface HospitalReviewsProps {
  hospitalId: string
}

export function HospitalReviews({ hospitalId }: HospitalReviewsProps) {
  const { user, isAuthenticated } = useResilientAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: '',
    pros: '',
    cons: ''
  })

  useEffect(() => {
    loadReviews()
  }, [hospitalId])

  const loadReviews = async () => {
    setLoading(true)
    try {
      // TODO: 실제 API 연동
      // 목업 데이터
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: 'user1',
          userName: '민지맘',
          rating: 5,
          content: '원장님이 정말 친절하시고 아이를 잘 다루세요. 예약을 하면 대기시간이 거의 없어서 좋습니다. 주차장도 넓어요!',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          likes: 12,
          hasLiked: false,
          pros: ['친절한 진료', '짧은 대기시간', '주차 편리'],
          cons: []
        },
        {
          id: '2',
          userId: 'user2',
          userName: '서준이엄마',
          rating: 4,
          content: '진료는 꼼꼼하게 잘 봐주시는데 예약이 너무 빨리 차서 당일 진료는 어려워요. 그래도 실력은 확실합니다.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          likes: 8,
          hasLiked: false,
          pros: ['꼼꼼한 진료', '깨끗한 시설'],
          cons: ['예약 어려움']
        },
        {
          id: '3',
          userId: 'user3',
          userName: '하윤맘',
          rating: 5,
          content: '20개월 딸아이가 처음에는 병원을 무서워했는데, 원장님이 너무 친절하게 대해주셔서 이제는 병원 가자고 하면 좋아해요. 강력 추천합니다!',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          likes: 15,
          hasLiked: true,
          pros: ['아이 친화적', '친절한 상담', '정확한 진단'],
          cons: []
        }
      ]

      setReviews(mockReviews)
      setLoading(false)
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast.error('리뷰를 불러오는데 실패했습니다')
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      return
    }

    if (!newReview.content.trim()) {
      toast.error('리뷰 내용을 입력해주세요')
      return
    }

    try {
      // TODO: 실제 API 연동
      toast.success('리뷰가 등록되었습니다')
      setShowReviewForm(false)
      setNewReview({ rating: 5, content: '', pros: '', cons: '' })
      loadReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('리뷰 등록에 실패했습니다')
    }
  }

  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      return
    }

    try {
      // TODO: 실제 API 연동
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? {
                ...review,
                likes: review.hasLiked ? review.likes - 1 : review.likes + 1,
                hasLiked: !review.hasLiked
              }
            : review
        )
      )
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-3xl font-bold text-gray-900">
                {reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'}
              </span>
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">{reviews.length}개의 리뷰</p>
          </div>

          {isAuthenticated && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              리뷰 작성
            </Button>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviews.filter((r) => r.rating === rating).length
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

            return (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 w-16">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-700">{rating}</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-600 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">리뷰 작성하기</h3>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= newReview.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">리뷰 내용</label>
            <Textarea
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              placeholder="병원에 대한 경험을 공유해주세요..."
              rows={4}
            />
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">장점</label>
              <Textarea
                value={newReview.pros}
                onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                placeholder="좋았던 점 (쉼표로 구분)"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">단점</label>
              <Textarea
                value={newReview.cons}
                onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                placeholder="아쉬운 점 (쉼표로 구분)"
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleSubmitReview} className="flex-1">
              리뷰 등록
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.userName}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(review.createdAt, { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-700">{review.content}</p>

            {(review.pros.length > 0 || review.cons.length > 0) && (
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                {review.pros.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-2">👍 장점</p>
                    <div className="flex flex-wrap gap-1">
                      {review.pros.map((pro, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
                        >
                          {pro}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {review.cons.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-orange-600 mb-2">👎 단점</p>
                    <div className="flex flex-wrap gap-1">
                      {review.cons.map((con, i) => (
                        <span
                          key={i}
                          className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded"
                        >
                          {con}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleLikeReview(review.id)}
                className={`flex items-center space-x-1 text-sm ${
                  review.hasLiked
                    ? 'text-pink-600 font-medium'
                    : 'text-gray-600 hover:text-pink-600'
                } transition-colors`}
              >
                <ThumbsUp className={`w-4 h-4 ${review.hasLiked ? 'fill-pink-600' : ''}`} />
                <span>도움됨 {review.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">아직 리뷰가 없습니다</p>
          <p className="text-sm text-gray-400">첫 번째 리뷰를 작성해보세요!</p>
        </div>
      )}
    </div>
  )
}
