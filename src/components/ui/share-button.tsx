'use client'

import { useState } from 'react'
import { Share2, Copy, Twitter, Facebook, Link, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ShareButtonProps {
  postId: string
  postTitle: string
  postContent?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  showLabel?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 p-1',
  md: 'h-9 w-9 p-2',
  lg: 'h-10 w-10 p-2'
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export function ShareButton({
  postId,
  postTitle,
  postContent,
  size = 'md',
  variant = 'ghost',
  showLabel = false,
  className
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generate share URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/post/${postId}`
    : `https://fortheorlingas.com/post/${postId}`

  // Prepare share text
  const shareText = `${postTitle} - 첫돌까지 육아맘들`
  const shareDescription = postContent ?
    `${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}`
    : '육아맘들의 진솔한 이야기'

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('링크가 복사되었습니다!', {
        duration: 2000,
        position: 'bottom-center'
      })
      setIsOpen(false)
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.')
      console.error('Copy failed:', error)
    }
  }

  // Share to Twitter
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    setIsOpen(false)
  }

  // Share to Facebook
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420')
    setIsOpen(false)
  }

  // Share to KakaoTalk (Web version)
  const shareToKakao = () => {
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`
    window.open(kakaoUrl, '_blank', 'width=550,height=420')
    setIsOpen(false)
  }

  // Native Web Share API (if available)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareDescription,
          url: shareUrl,
        })
        setIsOpen(false)
      } catch (error) {
        console.error('Native share failed:', error)
      }
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showLabel ? 'sm' : undefined}
          className={cn(
            !showLabel && sizeClasses[size],
            'transition-colors duration-200',
            className
          )}
          aria-label="게시글 공유하기"
          title="게시글 공유하기"
        >
          <Share2 className={cn(iconSizes[size])} />
          {showLabel && (
            <span className="ml-1 text-sm">공유</span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* Native Share API (mobile) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <>
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Copy Link */}
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          링크 복사
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Social Media Sharing */}
        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToKakao} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-yellow-500" />
          카카오톡
        </DropdownMenuItem>

        {/* Internal sharing option */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // TODO: Implement internal sharing to community
            toast.info('커뮤니티 내 공유 기능은 곧 출시됩니다!')
            setIsOpen(false)
          }}
          className="cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 mr-2 text-blue-500" />
          커뮤니티에 공유
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}