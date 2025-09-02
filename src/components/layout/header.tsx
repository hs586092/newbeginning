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
import { signOut } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<{ username: string; avatar_url?: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 shadow-sm border-b border-pink-100 dark:border-pink-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🤱</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
                첫돌까지
              </h1>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/pregnancy" 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium transition-colors"
              >
                🤰 임신
              </Link>
              <Link 
                href="/birth" 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium transition-colors"
              >
                🏥 출산
              </Link>
              <Link 
                href="/newborn" 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium transition-colors"
              >
                🍼 신생아
              </Link>
              <Link 
                href="/baby-food" 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium transition-colors"
              >
                🥄 이유식
              </Link>
              <Link 
                href="/development" 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium transition-colors"
              >
                📈 발달정보
              </Link>
              <Link 
                href="/community" 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium transition-colors"
              >
                💬 커뮤니티
              </Link>
              <Link 
                href="/emergency" 
                className="text-red-500 hover:text-red-600 font-bold transition-colors"
              >
                🚨 응급
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
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
                      {profile?.username || user.email}
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

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-pink-100 dark:border-pink-800 bg-gradient-to-r from-pink-25 to-blue-25 dark:from-pink-900/10 dark:to-blue-900/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-4 py-3 overflow-x-auto">
            <Link 
              href="/pregnancy" 
              className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium whitespace-nowrap py-2 px-1 min-w-0 flex-shrink-0 transition-colors text-sm"
            >
              🤰 임신
            </Link>
            <Link 
              href="/newborn" 
              className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium whitespace-nowrap py-2 px-1 min-w-0 flex-shrink-0 transition-colors text-sm"
            >
              🍼 신생아
            </Link>
            <Link 
              href="/baby-food" 
              className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium whitespace-nowrap py-2 px-1 min-w-0 flex-shrink-0 transition-colors text-sm"
            >
              🥄 이유식
            </Link>
            <Link 
              href="/community" 
              className="text-gray-700 dark:text-gray-300 hover:text-pink-500 font-medium whitespace-nowrap py-2 px-1 min-w-0 flex-shrink-0 transition-colors text-sm"
            >
              💬 커뮤니티
            </Link>
            <Link 
              href="/emergency" 
              className="text-red-500 hover:text-red-600 font-bold whitespace-nowrap py-2 px-1 min-w-0 flex-shrink-0 transition-colors text-sm"
            >
              🚨 응급
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}