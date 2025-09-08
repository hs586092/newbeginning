'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  User, 
  LogOut, 
  PenSquare, 
  FileText
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export function Header() {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    isLoading,
    signOut 
  } = useAuth()

  const handleSignOut = async () => {
    try {
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

  return (
    <header className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 shadow-sm border-b border-pink-100 dark:border-pink-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🤱</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
                첫돌까지
              </h1>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {isLoading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
            ) : isAuthenticated ? (
              <>
                <Link href="/write">
                  <Button size="sm" className="flex items-center h-9 px-3">
                    <PenSquare className="w-4 h-4 mr-1.5 sm:mr-2" />
                    <span className="text-sm">글쓰기</span>
                  </Button>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {profile?.username || user?.email}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link 
                        href="/my-posts"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        내 게시글
                      </Link>
                      <Link 
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        프로필
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

    </header>
  )
}