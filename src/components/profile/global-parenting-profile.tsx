'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface GlobalParentingProfileProps {
  profile: ProfileRow
  onUpdate: (updates: Partial<ProfileRow>) => Promise<void>
}

const PARENTING_STAGES = {
  'expecting': { label: 'Expecting', emoji: '🤰', description: 'Preparing for your new arrival' },
  'newborn': { label: 'Newborn (0-3 months)', emoji: '👶', description: 'Those precious early days' },
  'infant': { label: 'Infant (3-12 months)', emoji: '🍼', description: 'Growing and developing' },
  'toddler': { label: 'Toddler (1-3 years)', emoji: '🧸', description: 'Walking, talking, exploring' },
  'preschool': { label: 'Preschool (3-5 years)', emoji: '🎨', description: 'Learning and playing' },
  'school_age': { label: 'School Age (5-12 years)', emoji: '🎒', description: 'Education and activities' },
  'teen': { label: 'Teen (13-18 years)', emoji: '🎓', description: 'Growing independence' },
  'adult_child': { label: 'Adult Child (18+ years)', emoji: '💼', description: 'Supporting their journey' }
}

const PARENTING_ROLES = {
  'mother': { label: 'Mother', emoji: '👩‍👧‍👦' },
  'father': { label: 'Father', emoji: '👨‍👧‍👦' },
  'guardian': { label: 'Guardian', emoji: '🏠' },
  'caregiver': { label: 'Caregiver', emoji: '🤱' },
  'grandparent': { label: 'Grandparent', emoji: '👴👵' },
  'expecting_parent': { label: 'Expecting Parent', emoji: '🤰👨' }
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ru', label: 'Русский' }
]

export function GlobalParentingProfile({ profile, onUpdate }: GlobalParentingProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    parenting_stage: profile.parenting_stage || 'newborn',
    parenting_role: profile.parenting_role || 'mother',
    location: profile.location || '',
    timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    language_preference: profile.language_preference || 'en',
    baby_info: {
      due_date: profile.baby_info?.due_date || '',
      birth_dates: profile.baby_info?.birth_dates || [],
      child_count: profile.baby_info?.child_count || 1,
      child_ages: profile.baby_info?.child_ages || []
    },
    privacy_settings: {
      show_location: profile.privacy_settings?.show_location ?? false,
      show_children_info: profile.privacy_settings?.show_children_info ?? true,
      allow_messages: profile.privacy_settings?.allow_messages ?? true
    }
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg text-gray-900">Parenting Profile</h3>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            Edit Profile
          </Button>
        </div>

        <div className="space-y-4">
          {/* Parenting Stage & Role */}
          <div className="flex items-center gap-3 p-4 bg-white/70 rounded-lg">
            <span className="text-2xl" role="img" aria-label="Parenting stage">
              {profile.parenting_stage ? PARENTING_STAGES[profile.parenting_stage]?.emoji : '👤'}
            </span>
            <div>
              <div className="font-medium text-gray-900">
                {profile.parenting_role ? PARENTING_ROLES[profile.parenting_role]?.label : 'Not set'} - {' '}
                {profile.parenting_stage ? PARENTING_STAGES[profile.parenting_stage]?.label : 'Stage not set'}
              </div>
              <div className="text-sm text-gray-600">
                {profile.parenting_stage ? PARENTING_STAGES[profile.parenting_stage]?.description : 'Set your parenting stage'}
              </div>
            </div>
          </div>

          {/* Children Info */}
          {profile.privacy_settings?.show_children_info && (
            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">👶 Children Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {profile.baby_info?.due_date && (
                  <div>Due Date: {new Date(profile.baby_info.due_date).toLocaleDateString()}</div>
                )}
                {profile.baby_info?.child_count && (
                  <div>Number of Children: {profile.baby_info.child_count}</div>
                )}
                {profile.baby_info?.child_ages && profile.baby_info.child_ages.length > 0 && (
                  <div>Children Ages: {profile.baby_info.child_ages.join(', ')} years old</div>
                )}
              </div>
            </div>
          )}

          {/* Location & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.privacy_settings?.show_location && profile.location && (
              <div className="p-4 bg-white/70 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📍 Location</h4>
                <div className="text-sm text-gray-600">{profile.location}</div>
              </div>
            )}

            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🌐 Language</h4>
              <div className="text-sm text-gray-600">
                {LANGUAGES.find(lang => lang.code === profile.language_preference)?.label || 'English'}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4 p-3 bg-blue-50/50 rounded border border-blue-200">
            💡 <strong>Global Parenting Community</strong><br/>
            Connect with parents from around the world! Share experiences, get advice, and support each other through every stage of parenting.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-semibold text-lg text-gray-900">Edit Parenting Profile</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsEditing(false)}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Parenting Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            👤 Your Parenting Role
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(PARENTING_ROLES).map(([role, info]) => (
              <label
                key={role}
                className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.parenting_role === role
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="parenting_role"
                  value={role}
                  checked={formData.parenting_role === role}
                  onChange={(e) => setFormData(prev => ({ ...prev, parenting_role: e.target.value as any }))}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-lg">{info.emoji}</span>
                  <span>{info.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Parenting Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            📅 Current Parenting Stage
          </label>
          <div className="space-y-2">
            {Object.entries(PARENTING_STAGES).map(([stage, info]) => (
              <label
                key={stage}
                className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.parenting_stage === stage
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="parenting_stage"
                  value={stage}
                  checked={formData.parenting_stage === stage}
                  onChange={(e) => setFormData(prev => ({ ...prev, parenting_stage: e.target.value as any }))}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <span>{info.emoji}</span>
                    <span>{info.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {info.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Location & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Location (Optional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌐 Preferred Language
            </label>
            <select
              value={formData.language_preference}
              onChange={(e) => setFormData(prev => ({ ...prev, language_preference: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Children Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">👶 Children Information</h4>
          
          {formData.parenting_stage === 'expecting' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.baby_info.due_date}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  baby_info: { ...prev.baby_info, due_date: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Children
            </label>
            <select
              value={formData.baby_info.child_count}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                baby_info: { ...prev.baby_info, child_count: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">🔒 Privacy Settings</h4>
          
          <label className="flex items-start p-4 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy_settings.show_location}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                privacy_settings: {
                  ...prev.privacy_settings,
                  show_location: e.target.checked
                }
              }))}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">Show Location</div>
              <div className="text-xs text-gray-500 mt-1">
                Display your location on your profile to connect with nearby parents.
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy_settings.show_children_info}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                privacy_settings: {
                  ...prev.privacy_settings,
                  show_children_info: e.target.checked
                }
              }))}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">Show Children Information</div>
              <div className="text-xs text-gray-500 mt-1">
                Share information about your children to get more relevant content.
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy_settings.allow_messages}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                privacy_settings: {
                  ...prev.privacy_settings,
                  allow_messages: e.target.checked
                }
              }))}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">Allow Messages</div>
              <div className="text-xs text-gray-500 mt-1">
                Let other parents send you private messages for support and friendship.
              </div>
            </div>
          </label>
        </div>
      </form>
    </div>
  )
}