'use client'

import { useState } from 'react'
import { Share2, Copy, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ViralShareButtonsProps {
  referralCode?: string
  userId?: string
}

export function ViralShareButtons({ referralCode, userId }: ViralShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const baseUrl = 'https://fortheorlingas.com'
  const referralUrl = referralCode ? `${baseUrl}?ref=${referralCode}` : baseUrl

  const shareText = '🍼 첫돌까지 육아맘들 커뮤니티가 곧 오픈합니다! 함께 성장하는 육아 커뮤니티에서 만나요 💕'
  const shareTextWithRef = referralCode
    ? `${shareText}\n\n내 추천링크로 가입하면 특별 혜택이 있어요: ${referralUrl}`
    : shareText

  // Handle different share methods
  const handleKakaoShare = () => {
    // For production, you'd load Kakao SDK
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      (window as any).Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '첫돌까지 - 육아맘들 커뮤니티',
          description: shareText,
          imageUrl: `${baseUrl}/og-baby.png`,
          link: {
            mobileWebUrl: referralUrl,
            webUrl: referralUrl,
          },
        },
        buttons: [
          {
            title: '알림 받기',
            link: {
              mobileWebUrl: referralUrl,
              webUrl: referralUrl,
            },
          },
        ],
      })
    } else {
      // Fallback to copy link
      copyToClipboard()
    }
  }

  const handleNaverBlogShare = () => {
    const blogUrl = `https://blog.naver.com/openapi/share?url=${encodeURIComponent(referralUrl)}&title=${encodeURIComponent('첫돌까지 육아맘들 커뮤니티')}`
    window.open(blogUrl, '_blank', 'width=600,height=600')
  }

  const handleInstagramStory = () => {
    // Instagram doesn't have direct sharing API, so we copy the text for manual sharing
    copyToClipboard()
    alert('📱 인스타그램 앱을 열어서 스토리에 붙여넣기 해주세요!\n\n텍스트가 클립보드에 복사되었습니다.')
  }

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(shareTextWithRef)}`
    window.open(fbUrl, '_blank', 'width=600,height=400')
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextWithRef)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareTextWithRef).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleGenericShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '첫돌까지 - 육아맘들 커뮤니티',
        text: shareText,
        url: referralUrl,
      })
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="w-5 h-5 text-pink-600" />
          친구들에게 알려주세요!
          {referralCode && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              추천 혜택
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {referralCode
            ? '내 추천링크로 3명이 가입하면 프리미엄 1개월 무료! 🎁'
            : '첫돌까지 커뮤니티가 곧 오픈합니다. 함께 성장해요!'
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {referralCode && (
          <div className="p-3 bg-white/80 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-gray-700 mb-2">내 추천 링크:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">
                {referralUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="text-xs"
              >
                {copied ? '복사됨!' : '복사'}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* 카카오톡 공유 */}
          <Button
            onClick={handleKakaoShare}
            className="bg-yellow-400 hover:bg-yellow-500 text-black border-0 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            카카오톡
          </Button>

          {/* 네이버 블로그 공유 */}
          <Button
            onClick={handleNaverBlogShare}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <span className="text-sm">N</span>
            네이버 블로그
          </Button>

          {/* 인스타그램 스토리 */}
          <Button
            onClick={handleInstagramStory}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            인스타 스토리
          </Button>

          {/* 페이스북 공유 */}
          <Button
            onClick={handleFacebookShare}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Facebook className="w-4 h-4" />
            페이스북
          </Button>

          {/* 트위터 공유 */}
          <Button
            onClick={handleTwitterShare}
            className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
          >
            <Twitter className="w-4 h-4" />
            트위터
          </Button>

          {/* 일반 공유 (모바일 네이티브) */}
          <Button
            onClick={handleGenericShare}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {copied ? '복사됨!' : '공유하기'}
          </Button>
        </div>

        {/* 추천 혜택 안내 */}
        {referralCode && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">🎁 추천 혜택</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 1명 초대: 이모티콘 팩 증정</li>
              <li>• 3명 초대: 프리미엄 1개월 무료</li>
              <li>• 5명 초대: 육아 전문가 상담권</li>
            </ul>
          </div>
        )}

        {/* 가입 현황 (mockup) */}
        <div className="text-center py-3 bg-white/60 rounded-lg">
          <p className="text-sm text-gray-600">
            🔥 현재 <span className="font-bold text-pink-600">247명</span>이 알림을 기다리고 있어요!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}