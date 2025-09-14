'use client'

import { useNotifications } from '@/contexts/notification-context'
import { useEffect, useState } from 'react'
import { X, CheckCircle, Info, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastItemProps {
  toast: {
    id: string
    type: 'success' | 'info' | 'warning' | 'error'
    title: string
    message?: string
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // 애니메이션을 위한 지연
    const showTimer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(showTimer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300) // 애니메이션 시간과 맞춤
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full',
        'transform transition-all duration-300 ease-out',
        getColorClasses(),
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">
          {toast.title}
        </div>

        {toast.message && (
          <div className="text-sm opacity-80 mt-1">
            {toast.message}
          </div>
        )}

        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick()
              handleClose()
            }}
            className="text-xs font-medium underline mt-2 hover:opacity-80"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </div>
  )
}