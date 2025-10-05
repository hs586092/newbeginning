'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  User,
  LogOut,
  PenSquare,
  FileText,
  MessageCircle,
  Menu,
  X
} from 'lucide-react'
import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { toast } from 'sonner'

export function Header() {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    signOut,
    canSignOut,
    currentState
  } = useAuth()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      // Check if sign out is allowed (prevent concurrent operations)
      if (!canSignOut()) {
        toast.error('이미 로그아웃 진행 중입니다.')
        return
      }

      const result = await signOut()

      if (!result.success) {
        toast.error(result.error || '로그아웃 중 오류가 발생했습니다.')
      } else {
        toast.success('성공적으로 로그아웃되었습니다.')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
      >
        본문 바로가기
      </a>
      <header className="bg-white shadow-sm border-b border-gray-200 transition-colors sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                  moree<span className="text-blue-600">.ai</span>
                </h1>
              </Link>
            </div>

            {/* User Actions */}
            <nav className="flex items-center space-x-2 sm:space-x-4" role="navigation" aria-label="User menu">
              {isLoading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" role="status" aria-label="Loading"></div>
              ) : isAuthenticated ? (
                <>
                  {/* Desktop Navigation */}
                  <div className="hidden sm:flex items-center space-x-4">
                    {/* 채팅 버튼 */}
                    <Link href="/chat" aria-label="채팅 페이지로 이동">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center h-10 px-3"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span className="text-sm">채팅</span>
                      </Button>
                    </Link>

                    {/* 알림 벨 */}
                    <NotificationBell />

                    {/* 글쓰기 버튼 */}
                    <Link href="/write" aria-label="새 게시글 작성하기">
                      <Button
                        size="sm"
                        className="flex items-center h-10 px-3"
                      >
                        <PenSquare className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span className="text-sm">글쓰기</span>
                      </Button>
                    </Link>

                    {/* User Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors max-w-[200px]" aria-label="사용자 메뉴 열기" aria-expanded="false" aria-haspopup="true">
                        <User className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm font-medium truncate min-w-0">
                          {profile?.username || user?.email?.split('@')[0] || '사용자'}
                        </span>
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" role="menu" aria-label="사용자 메뉴">
                        <div className="py-1">
                          <Link
                            href="/my-posts"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            role="menuitem"
                          >
                            <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                            내 게시글
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            role="menuitem"
                          >
                            <User className="w-4 h-4 mr-2" aria-hidden="true" />
                            프로필
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left transition-colors"
                            role="menuitem"
                            aria-label="로그아웃하기"
                          >
                            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                            로그아웃
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation - Essential Actions Only */}
                  <div className="flex sm:hidden items-center space-x-1">
                    {/* 알림 벨 */}
                    <NotificationBell />

                    {/* 글쓰기 버튼 - 모바일에서 중요 */}
                    <Link href="/write" aria-label="새 게시글 작성하기">
                      <Button
                        size="sm"
                        className="flex items-center h-11 px-3 min-w-[44px]" // 터치 친화적 크기
                      >
                        <PenSquare className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </Link>

                    {/* 모바일 메뉴 버튼 */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 px-3 min-w-[44px]" // 터치 친화적 크기
                      onClick={toggleMobileMenu}
                      aria-label="메뉴 열기/닫기"
                      aria-expanded={isMobileMenuOpen}
                    >
                      {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center h-10 px-3"
                    >
                      <User className="w-4 h-4 mr-2" aria-hidden="true" />
                      <span className="text-sm">로그인</span>
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && isAuthenticated && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden"
          onClick={toggleMobileMenu}
          aria-label="메뉴 배경"
        >
          <div
            className="fixed top-16 right-0 w-64 bg-white shadow-lg border-l"
            onClick={(e) => e.stopPropagation()}
            role="menu"
            aria-label="모바일 메뉴"
          >
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.username || user?.email?.split('@')[0] || '사용자'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <Link
                href="/chat"
                className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]" // 터치 친화적 높이
                role="menuitem"
                onClick={toggleMobileMenu}
              >
                <MessageCircle className="w-5 h-5 mr-3 text-gray-400" />
                채팅
              </Link>

              <Link
                href="/my-posts"
                className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                role="menuitem"
                onClick={toggleMobileMenu}
              >
                <FileText className="w-5 h-5 mr-3 text-gray-400" />
                내 게시글
              </Link>

              <Link
                href="/profile"
                className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                role="menuitem"
                onClick={toggleMobileMenu}
              >
                <User className="w-5 h-5 mr-3 text-gray-400" />
                프로필
              </Link>

              <button
                onClick={() => {
                  handleSignOut()
                  toggleMobileMenu()
                }}
                className="flex items-center w-full px-4 py-4 text-red-600 hover:bg-red-50 text-left transition-colors min-h-[44px]" // 로그아웃은 빨간색으로 강조
                role="menuitem"
                aria-label="로그아웃하기"
              >
                <LogOut className="w-5 h-5 mr-3" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}