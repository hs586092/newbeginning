'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { GlobalParentingProfile } from '@/components/profile/global-parenting-profile'
import type { Database } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface ProfileClientProps {
  user: User
  initialProfile: ProfileRow | null
}

export function ProfileClient({ user, initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState<ProfileRow | null>(initialProfile)

  const handleUpdateProfile = async (updates: Partial<ProfileRow>) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id)
      
      if (error) throw error

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success('프로필이 성공적으로 업데이트되었습니다!')
      
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('프로필 업데이트 중 오류가 발생했습니다.')
      throw error
    }
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">프로필을 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Basic Profile Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Profile</h1>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-2xl font-medium text-white">
                  {(profile.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.username || user.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                {profile.parenting_role && profile.parenting_stage && (
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.parenting_role} • {profile.parenting_stage} stage
                  </p>
                )}
                {profile.location && profile.privacy_settings?.show_location && (
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {profile.location}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 text-gray-900">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.username || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile.language_preference || 'English'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Parenting Profile */}
        <GlobalParentingProfile 
          profile={profile} 
          onUpdate={handleUpdateProfile} 
        />

        {/* Privacy Policy Link */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-lg" role="img" aria-label="Information">ℹ️</span>
            <div className="flex-1">
              <h4 className="font-medium text-amber-800 mb-1">
                Privacy Protection Notice
              </h4>
              <p className="text-sm text-amber-700 mb-2">
                Your personal information is securely protected and processed according to international privacy standards.
              </p>
              <a 
                href="/privacy" 
                className="text-sm text-amber-600 hover:text-amber-800 font-medium underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Privacy Policy →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}