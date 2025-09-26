'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Profile fetch exception:', err)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Initial session error:', error)
          setLoading(false)
          return
        }

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)

          // Fetch user profile
          const profileData = await fetchProfile(initialSession.user.id)
          setProfile(profileData)
        }

        setLoading(false)
      } catch (err) {
        console.error('Initial session exception:', err)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession?.user?.email)

        setSession(newSession)
        setUser(newSession?.user || null)

        if (newSession?.user) {
          // Fetch or create profile for new user
          const profileData = await fetchProfile(newSession.user.id)

          if (!profileData && event === 'SIGNED_IN') {
            // Create profile for new user
            const { data: newProfile, error } = await supabase
              .from('profiles')
              .insert({
                id: newSession.user.id,
                email: newSession.user.email,
                full_name: newSession.user.user_metadata?.full_name || '',
                username: newSession.user.user_metadata?.username || null,
                avatar_url: newSession.user.user_metadata?.avatar_url || null,
              })
              .select()
              .single()

            if (error) {
              console.error('Profile creation error:', error)
            } else {
              setProfile(newProfile)
            }
          } else {
            setProfile(profileData)
          }
        } else {
          setProfile(null)
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}