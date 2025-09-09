import type { Database } from '@/types/database.types'

export type FamilyRole = Database['public']['Tables']['profiles']['Row']['family_role']
export type LanguagePreference = Database['public']['Tables']['profiles']['Row']['language_preference']
export type AddressStyle = NonNullable<Database['public']['Tables']['profiles']['Row']['cultural_preferences']>['preferred_address_style']

// Korean cultural mapping for family roles
export const FAMILY_ROLE_LABELS: Record<NonNullable<FamilyRole>, string> = {
  'expecting_mom': '예비맘',
  'expecting_dad': '예비아빠', 
  'new_mom': '초보맘',
  'new_dad': '초보아빠',
  'experienced_parent': '육아맘/아빠',
  'grandparent': '할머니/할아버지',
  'caregiver': '육아도우미'
}

export const FAMILY_ROLE_EMOJI: Record<NonNullable<FamilyRole>, string> = {
  'expecting_mom': '🤰',
  'expecting_dad': '👨‍👩‍👧‍👦',
  'new_mom': '👩‍👶',
  'new_dad': '👨‍👶',
  'experienced_parent': '👪',
  'grandparent': '👴👵',
  'caregiver': '🤱'
}

// Language style utilities
export const LANGUAGE_STYLE_LABELS: Record<NonNullable<LanguagePreference>, string> = {
  'formal': '존댓말 (정중한 대화)',
  'informal': '반말 (친근한 대화)',
  'mixed': '상황에 맞게 (혼용)'
}

export const ADDRESS_STYLE_LABELS: Record<NonNullable<AddressStyle>, string> = {
  'casual': '편하게 (이름/닉네임)',
  'respectful': '정중하게 (님/씨)',
  'formal': '공식적으로 (선생님/부모님)'
}

// Korean honorific utilities
export function getHonorificSuffix(addressStyle: AddressStyle | undefined): string {
  switch (addressStyle) {
    case 'formal': return '님'
    case 'respectful': return '님' 
    case 'casual': 
    default: return ''
  }
}

export function formatUserName(
  username: string, 
  addressStyle: AddressStyle | undefined,
  familyRole: FamilyRole | undefined
): string {
  const honorific = getHonorificSuffix(addressStyle)
  const emoji = familyRole ? FAMILY_ROLE_EMOJI[familyRole] : ''
  
  return `${emoji ? emoji + ' ' : ''}${username}${honorific}`
}

export function getGreeting(
  languagePreference: LanguagePreference | undefined,
  familyRole: FamilyRole | undefined,
  timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon'
): string {
  const isFormal = languagePreference === 'formal' || languagePreference === 'mixed'
  
  const greetings = {
    morning: {
      formal: '좋은 아침이에요',
      informal: '좋은 아침이야'
    },
    afternoon: {
      formal: '안녕하세요',
      informal: '안녕'
    },
    evening: {
      formal: '안녕하세요',
      informal: '안녕'
    }
  }
  
  return greetings[timeOfDay][isFormal ? 'formal' : 'informal']
}

export function getResponseLanguage(
  languagePreference: LanguagePreference | undefined,
  context: 'comment' | 'post' | 'interaction' = 'interaction'
): {
  thankYou: string
  please: string
  sorry: string
  congratulations: string
  goodLuck: string
} {
  const isFormal = languagePreference === 'formal' || 
    (languagePreference === 'mixed' && context === 'post')
    
  return {
    thankYou: isFormal ? '감사합니다' : '고마워',
    please: isFormal ? '부탁드려요' : '부탁해',
    sorry: isFormal ? '죄송해요' : '미안해',
    congratulations: isFormal ? '축하드려요' : '축하해',
    goodLuck: isFormal ? '힘내세요' : '힘내'
  }
}

export function getFamilyRoleDescription(role: FamilyRole | undefined): string {
  if (!role) return ''
  
  const descriptions: Record<NonNullable<FamilyRole>, string> = {
    'expecting_mom': '곧 태어날 아기를 기다리고 있어요',
    'expecting_dad': '곧 아빠가 될 예비아빠예요',
    'new_mom': '첫 육아를 시작한 새내기 엄마예요',
    'new_dad': '첫 육아를 시작한 새내기 아빠예요',
    'experienced_parent': '육아 경험이 있는 선배 부모예요',
    'grandparent': '손자녀를 사랑하는 할머니/할아버지예요',
    'caregiver': '아이들을 돌보는 전문가예요'
  }
  
  return descriptions[role]
}

export function getPregnancyWeekDisplay(dueDate: string): string {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  const currentWeek = 40 - diffWeeks
  
  if (currentWeek <= 0) return '임신 전'
  if (currentWeek >= 40) return '출산 예정'
  
  return `임신 ${currentWeek}주차`
}

export function getBabyAgeDisplay(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const diffTime = now.getTime() - birth.getTime()
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44))
  
  if (diffMonths < 1) {
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return `생후 ${diffDays}일`
  }
  
  if (diffMonths >= 12) {
    const years = Math.floor(diffMonths / 12)
    const remainingMonths = diffMonths % 12
    return remainingMonths > 0 ? `${years}세 ${remainingMonths}개월` : `${years}세`
  }
  
  return `생후 ${diffMonths}개월`
}

// Cultural validation helpers
export function isAppropriateLanguage(
  content: string,
  targetPreference: LanguagePreference | undefined
): { appropriate: boolean; suggestion?: string } {
  // Simple heuristic for Korean formal/informal language detection
  const formalPatterns = /습니다|습니까|해요|해요\?|세요|셔요|이에요|예요/g
  const informalPatterns = /야|아|해|해\?|이야|냐|니/g
  
  const formalMatches = (content.match(formalPatterns) || []).length
  const informalMatches = (content.match(informalPatterns) || []).length
  
  if (targetPreference === 'formal' && informalMatches > formalMatches) {
    return {
      appropriate: false,
      suggestion: '존댓말로 작성해보시는 것은 어떨까요?'
    }
  }
  
  if (targetPreference === 'informal' && formalMatches > informalMatches * 2) {
    return {
      appropriate: false, 
      suggestion: '좀 더 친근하게 대화해보세요!'
    }
  }
  
  return { appropriate: true }
}

export function generateCulturallyAppropriateResponse(
  context: {
    userPreference?: LanguagePreference
    authorPreference?: LanguagePreference
    familyRole?: FamilyRole
    responseType: 'like' | 'comment' | 'support' | 'congratulations'
  }
): string {
  const { userPreference, authorPreference, familyRole, responseType } = context
  const preferFormal = userPreference === 'formal' || authorPreference === 'formal'
  
  const responses = {
    like: {
      formal: '공감해요! 좋은 글 감사합니다 ✨',
      informal: '공감돼! 좋은 글이야 ✨'
    },
    comment: {
      formal: '좋은 정보 나눠주셔서 감사해요',
      informal: '좋은 정보 고마워'
    },
    support: {
      formal: '힘내세요! 응원하고 있어요 💪',
      informal: '힘내! 응원할게 💪'
    },
    congratulations: {
      formal: '축하드려요! 정말 기뻐요 🎉',
      informal: '축하해! 정말 기뻐 🎉'
    }
  }
  
  return responses[responseType][preferFormal ? 'formal' : 'informal']
}