'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    const checkIfInstalled = () => {
      // 홈 스크린에서 실행되었는지 확인 (iOS)
      if (window.navigator.standalone) {
        setIsInstalled(true)
        return
      }

      // 앱 모드로 실행되었는지 확인 (Android)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }

      // 일반 브라우저에서 실행 중
      setIsInstalled(false)
    }

    checkIfInstalled()

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('💾 PWA install prompt triggered')

      // 기본 설치 프롬프트 차단
      e.preventDefault()

      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(beforeInstallPromptEvent)

      // 사용자가 이전에 설치를 거부했는지 확인
      const hasDeclinedBefore = localStorage.getItem('pwa-install-declined')
      if (!hasDeclinedBefore) {
        setShowInstallPrompt(true)
      }
    }

    // 앱이 설치되었을 때
    const handleAppInstalled = () => {
      console.log('✅ PWA installed')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-declined')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt()

      // 사용자 선택 대기
      const { outcome } = await deferredPrompt.userChoice

      console.log(`👤 User choice: ${outcome}`)

      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt')
      } else {
        console.log('❌ User dismissed the install prompt')
        localStorage.setItem('pwa-install-declined', 'true')
      }

      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('❌ Error during PWA installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-declined', 'true')
  }

  // iOS Safari 감지
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  if (isInstalled) {
    return null // 이미 설치됨
  }

  if (isIOS && isSafari && !showInstallPrompt) {
    // iOS Safari용 설치 안내
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">앱으로 설치하기</h3>
            <p className="text-xs opacity-90 mb-2">
              Safari 하단 공유 버튼을 탭한 후 "홈 화면에 추가"를 선택해주세요
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                나중에
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/10 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-start gap-3">
        <Download className="w-6 h-6 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">앱으로 설치하기</h3>
          <p className="text-xs opacity-90 mb-3">
            홈 화면에 추가하여 앱처럼 빠르게 이용해보세요
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="text-xs bg-white text-blue-600 hover:bg-gray-100"
            >
              설치하기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              나중에
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-white hover:bg-white/10 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}