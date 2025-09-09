'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  FAMILY_ROLE_LABELS, 
  FAMILY_ROLE_EMOJI,
  LANGUAGE_STYLE_LABELS,
  ADDRESS_STYLE_LABELS,
  type FamilyRole, 
  type LanguagePreference,
  type AddressStyle,
  getPregnancyWeekDisplay,
  getBabyAgeDisplay,
  getFamilyRoleDescription
} from '@/lib/korean-culture'
import type { Database } from '@/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface KoreanPreferencesProps {
  profile: ProfileRow
  onUpdate: (updates: Partial<ProfileRow>) => Promise<void>
}

export function KoreanPreferences({ profile, onUpdate }: KoreanPreferencesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    language_preference: profile.language_preference || 'mixed' as LanguagePreference,
    family_role: profile.family_role || 'new_mom' as FamilyRole,
    baby_info: {
      due_date: profile.baby_info?.due_date || '',
      birth_date: profile.baby_info?.birth_date || '',
      baby_count: profile.baby_info?.baby_count || 1,
      baby_names: profile.baby_info?.baby_names || []
    },
    cultural_preferences: {
      use_honorifics: profile.cultural_preferences?.use_honorifics ?? true,
      preferred_address_style: profile.cultural_preferences?.preferred_address_style || 'respectful' as AddressStyle,
      show_family_info: profile.cultural_preferences?.show_family_info ?? true
    }
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      language_preference: profile.language_preference || 'mixed' as LanguagePreference,
      family_role: profile.family_role || 'new_mom' as FamilyRole,
      baby_info: {
        due_date: profile.baby_info?.due_date || '',
        birth_date: profile.baby_info?.birth_date || '',
        baby_count: profile.baby_info?.baby_count || 1,
        baby_names: profile.baby_info?.baby_names || []
      },
      cultural_preferences: {
        use_honorifics: profile.cultural_preferences?.use_honorifics ?? true,
        preferred_address_style: profile.cultural_preferences?.preferred_address_style || 'respectful' as AddressStyle,
        show_family_info: profile.cultural_preferences?.show_family_info ?? true
      }
    })
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-pink-200 dark:border-pink-600">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">한국 문화 설정</h3>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            수정하기
          </Button>
        </div>

        <div className="space-y-4">
          {/* Family Role Display */}
          <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
            <span className="text-2xl" role="img" aria-label="가족 역할">
              {profile.family_role ? FAMILY_ROLE_EMOJI[profile.family_role] : '👤'}
            </span>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {profile.family_role ? FAMILY_ROLE_LABELS[profile.family_role] : '역할 미설정'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {profile.family_role ? getFamilyRoleDescription(profile.family_role) : '가족에서의 역할을 설정해주세요'}
              </div>
            </div>
          </div>

          {/* Baby Info Display */}
          {profile.cultural_preferences?.show_family_info && (
            <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">👶 아기 정보</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {profile.baby_info?.due_date && (
                  <div>출산예정일: {new Date(profile.baby_info.due_date).toLocaleDateString('ko-KR')} ({getPregnancyWeekDisplay(profile.baby_info.due_date)})</div>
                )}
                {profile.baby_info?.birth_date && (
                  <div>생일: {new Date(profile.baby_info.birth_date).toLocaleDateString('ko-KR')} ({getBabyAgeDisplay(profile.baby_info.birth_date)})</div>
                )}
                {profile.baby_info?.baby_count && profile.baby_info.baby_count > 1 && (
                  <div>아기 수: {profile.baby_info.baby_count}명</div>
                )}
              </div>
            </div>
          )}

          {/* Language Preferences Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">🗣️ 언어 스타일</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {profile.language_preference ? LANGUAGE_STYLE_LABELS[profile.language_preference] : '혼용'}
              </div>
            </div>

            <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">👋 호칭 스타일</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {profile.cultural_preferences?.preferred_address_style 
                  ? ADDRESS_STYLE_LABELS[profile.cultural_preferences.preferred_address_style]
                  : '정중하게 (님/씨)'}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-600">
            💡 <strong>한국 문화 설정이란?</strong><br/>
            육아 커뮤니티에서 서로 존중하며 소통할 수 있도록 돕는 기능입니다. 
            존댓말/반말 선택, 가족 내 역할, 호칭 방식 등을 설정하여 
            더욱 자연스럽고 편안한 대화를 나눌 수 있어요.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-pink-200 dark:border-pink-600">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">한국 문화 설정 수정</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={isSaving}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Family Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            👤 가족에서의 역할
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(FAMILY_ROLE_LABELS) as [FamilyRole, string][]).map(([role, label]) => (
              <label
                key={role}
                className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.family_role === role
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-pink-300 bg-white dark:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="family_role"
                  value={role}
                  checked={formData.family_role === role}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_role: e.target.value as FamilyRole }))}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-lg">{FAMILY_ROLE_EMOJI[role]}</span>
                  <span>{label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Baby Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">👶 아기 정보</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                출산예정일 (예비부모)
              </label>
              <input
                type="date"
                value={formData.baby_info.due_date}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  baby_info: { ...prev.baby_info, due_date: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                생일 (이미 태어난 경우)
              </label>
              <input
                type="date"
                value={formData.baby_info.birth_date}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  baby_info: { ...prev.baby_info, birth_date: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              아기 수
            </label>
            <select
              value={formData.baby_info.baby_count}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                baby_info: { ...prev.baby_info, baby_count: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>1명</option>
              <option value={2}>2명 (쌍둥이)</option>
              <option value={3}>3명 (삼둥이)</option>
              <option value={4}>4명 이상</option>
            </select>
          </div>
        </div>

        {/* Language Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🗣️ 언어 스타일 선택
          </label>
          <div className="space-y-3">
            {(Object.entries(LANGUAGE_STYLE_LABELS) as [LanguagePreference, string][]).map(([style, label]) => (
              <label
                key={style}
                className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.language_preference === style
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="language_preference"
                  value={style}
                  checked={formData.language_preference === style}
                  onChange={(e) => setFormData(prev => ({ ...prev, language_preference: e.target.value as LanguagePreference }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {style === 'formal' && '항상 존댓말로 대화합니다. 격식 있는 소통을 선호해요.'}
                    {style === 'informal' && '친근한 반말로 대화합니다. 편안한 분위기를 좋아해요.'}
                    {style === 'mixed' && '상황에 맞춰 존댓말과 반말을 섞어 사용합니다.'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Address Style Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            👋 호칭 스타일 선택
          </label>
          <div className="space-y-3">
            {(Object.entries(ADDRESS_STYLE_LABELS) as [AddressStyle, string][]).map(([style, label]) => (
              <label
                key={style}
                className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.cultural_preferences.preferred_address_style === style
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300 bg-white dark:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="address_style"
                  value={style}
                  checked={formData.cultural_preferences.preferred_address_style === style}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cultural_preferences: {
                      ...prev.cultural_preferences,
                      preferred_address_style: e.target.value as AddressStyle
                    }
                  }))}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {style === 'casual' && '이름이나 닉네임으로 부르는 것을 선호합니다.'}
                    {style === 'respectful' && '이름 뒤에 "님"이나 "씨"를 붙여 호칭합니다.'}
                    {style === 'formal' && '"선생님", "부모님" 등 격식 있는 호칭을 사용합니다.'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">🔒 프라이버시 설정</h4>
          
          <label className="flex items-start p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.cultural_preferences.use_honorifics}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                cultural_preferences: {
                  ...prev.cultural_preferences,
                  use_honorifics: e.target.checked
                }
              }))}
              className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">존댓말 사용 권장</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                다른 사용자들에게 정중한 언어 사용을 권장합니다.
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.cultural_preferences.show_family_info}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                cultural_preferences: {
                  ...prev.cultural_preferences,
                  show_family_info: e.target.checked
                }
              }))}
              className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">가족 정보 공개</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                프로필에서 아기 정보와 가족 역할을 다른 사용자에게 보여줍니다.
              </div>
            </div>
          </label>
        </div>
      </form>
    </div>
  )
}