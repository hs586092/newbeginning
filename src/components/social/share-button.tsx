'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SocialSharingService } from '@/lib/services/social-sharing-service'
import {
  Share2,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Link,
  Copy,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  postId: string
  title: string
  description?: string
  compact?: boolean
  showShareCount?: boolean
  className?: string
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  kakaotalk: MessageCircle,
  line: MessageCircle,
  link_copy: Copy
}

const platformLabels = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  instagram: 'Instagram',
  kakaotalk: '카카오톡',
  line: 'Line',
  link_copy: '링크 복사'
}

const platformColors = {
  facebook: 'hover:bg-blue-600 hover:text-white',
  twitter: 'hover:bg-sky-500 hover:text-white',
  instagram: 'hover:bg-pink-600 hover:text-white',
  kakaotalk: 'hover:bg-yellow-400 hover:text-black',
  line: 'hover:bg-green-500 hover:text-white',
  link_copy: 'hover:bg-gray-600 hover:text-white'
}

export function ShareButton({
  postId,
  title,
  description,
  compact = false,
  showShareCount = true,
  className = ''
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shareCount, setShareCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleShare = async (platform: keyof typeof platformIcons) => {
    try {
      setLoading(true)

      // Try native sharing first for mobile devices
      if (platform === 'link_copy' && navigator.share) {
        const success = await SocialSharingService.nativeShare(postId, title, description)
        if (success) {
          toast.success('공유되었습니다!')
          setIsOpen(false)
          return
        }
      }

      const shareUrl = await SocialSharingService.sharePost(postId, platform)

      if (!shareUrl) {
        toast.error('공유에 실패했습니다')
        return
      }

      if (platform === 'link_copy') {
        toast.success('링크가 복사되었습니다!')
      } else {
        // Open share URL in new window
        window.open(shareUrl, '_blank', 'width=600,height=400')
        toast.success('공유되었습니다!')
      }

      // Update share count
      const totalShares = await SocialSharingService.getTotalShares(postId)
      setShareCount(totalShares)
      setIsOpen(false)
    } catch (error) {
      console.error('공유 오류:', error)
      toast.error('공유에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-2"
        >
          <Share2 className="w-4 h-4 mr-1" />
          {showShareCount && shareCount > 0 && (
            <span className="text-xs">{shareCount}</span>
          )}
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <div className="flex gap-1">
                  {Object.entries(platformIcons).map(([platform, Icon]) => (
                    <Button
                      key={platform}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(platform as keyof typeof platformIcons)}
                      disabled={loading}
                      className={`h-8 w-8 p-0 transition-colors ${platformColors[platform as keyof typeof platformColors]}`}
                      title={platformLabels[platform as keyof typeof platformLabels]}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">게시글 공유</h4>
        {showShareCount && shareCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {shareCount}회 공유됨
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(platformIcons).map(([platform, Icon]) => (
          <Button
            key={platform}
            variant="outline"
            onClick={() => handleShare(platform as keyof typeof platformIcons)}
            disabled={loading}
            className={`justify-start transition-colors ${platformColors[platform as keyof typeof platformColors]}`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {platformLabels[platform as keyof typeof platformLabels]}
          </Button>
        ))}
      </div>

      {/* Additional sharing options */}
      <div className="pt-2 border-t">
        <div className="text-xs text-muted-foreground mb-2">기타</div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const bookmarkSuccess = await SocialSharingService.bookmarkPost(postId)
                if (bookmarkSuccess) {
                  toast.success('북마크에 추가되었습니다!')
                } else {
                  toast.error('북마크 추가에 실패했습니다')
                }
              } catch (error) {
                toast.error('북마크 추가에 실패했습니다')
              }
            }}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            북마크
          </Button>
        </div>
      </div>
    </div>
  )
}