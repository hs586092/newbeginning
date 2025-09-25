'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { PointsEarned } from '@/types/database.types'
import { Star, Award, Trophy } from 'lucide-react'

interface PointsNotificationProps {
  pointsEarned?: PointsEarned | null
  onClose?: () => void
  duration?: number
}

export function PointsNotification({
  pointsEarned,
  onClose,
  duration = 3000
}: PointsNotificationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (pointsEarned) {
      setVisible(true)

      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => {
          onClose?.()
        }, 300) // Wait for animation to complete
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [pointsEarned, duration, onClose])

  if (!pointsEarned) return null

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ease-in-out
      ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg border border-yellow-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Star className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">+{pointsEarned.points}</span>
              <span className="text-sm">포인트 획득!</span>
            </div>

            <p className="text-sm opacity-90">
              {pointsEarned.description}
            </p>

            {/* Badge earned notification */}
            {pointsEarned.badge_earned && (
              <div className="mt-2 p-2 bg-white/20 rounded-md">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">새 뱃지 획득!</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">{pointsEarned.badge_earned.icon}</span>
                  <span className="text-sm">{pointsEarned.badge_earned.name}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setVisible(false)
              setTimeout(() => onClose?.(), 300)
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to manage points notifications
export function usePointsNotification() {
  const [notification, setNotification] = useState<PointsEarned | null>(null)

  const showNotification = (pointsEarned: PointsEarned) => {
    setNotification(pointsEarned)
  }

  const hideNotification = () => {
    setNotification(null)
  }

  return {
    notification,
    showNotification,
    hideNotification
  }
}