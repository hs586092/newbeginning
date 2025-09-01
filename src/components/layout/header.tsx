'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  PenSquare, 
  FileText,
  Briefcase,
  Users
} from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<{ username: string; avatar_url?: string } | null>(null)
  const router = useRouter()
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
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">BUDICONNECTS</h1>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                전체
              </Link>
              <Link 
                href="/jobs" 
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center"
              >
                <Briefcase className="w-4 h-4 mr-1" />
                구인구직
              </Link>
              <Link 
                href="/community" 
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center"
              >
                <Users className="w-4 h-4 mr-1" />
                커뮤니티
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/write">
                  <Button size="sm" className="flex items-center">
                    <PenSquare className="w-4 h-4 mr-2" />
                    글쓰기
                  </Button>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {profile?.username || user.email}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link 
                        href="/my-posts"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        내 게시글
                      </Link>
                      <Link 
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        프로필
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
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
      <div className="md:hidden border-t">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-6 py-3 overflow-x-auto">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
            >
              전체
            </Link>
            <Link 
              href="/jobs" 
              className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
            >
              구인구직
            </Link>
            <Link 
              href="/community" 
              className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
            >
              커뮤니티
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}