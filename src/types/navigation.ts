export interface NavigationItem {
  id: string
  name: string
  emoji: string
  href: string
  description?: string
  color?: 'default' | 'danger' | 'featured'
  category?: string
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'educational',
    name: '정보센터',
    emoji: '📚',
    href: '/educational',
    description: '전문가가 검증한 임신·육아 정보',
    color: 'featured'
  },
  {
    id: 'pregnancy',
    name: '임신',
    emoji: '🤰',
    href: '/pregnancy',
    description: '임신 관련 경험과 정보',
    category: 'pregnancy'
  },
  {
    id: 'birth',
    name: '출산',
    emoji: '🏥',
    href: '/birth',
    description: '출산 준비와 분만 정보',
    category: 'pregnancy'
  },
  {
    id: 'newborn',
    name: '신생아',
    emoji: '🍼',
    href: '/newborn',
    description: '0-3개월 신생아 돌봄',
    category: 'newborn'
  },
  {
    id: 'baby-food',
    name: '이유식',
    emoji: '🥄',
    href: '/baby-food',
    description: '이유식 레시피와 노하우',
    category: 'babyfood'
  },
  {
    id: 'development',
    name: '발달정보',
    emoji: '📈',
    href: '/development',
    description: '아기 성장과 발달 정보',
    category: 'infant'
  },
  {
    id: 'community',
    name: '커뮤니티',
    emoji: '💬',
    href: '/community',
    description: '엄마들의 소통 공간',
    category: 'daily'
  },
  {
    id: 'emergency',
    name: '응급',
    emoji: '🚨',
    href: '/emergency',
    description: '응급상황 대처와 안전',
    color: 'danger',
    category: 'emergency'
  }
]

export const COMMUNITY_CATEGORIES = [
  'all',
  'pregnancy',
  'newborn', 
  'infant',
  'babyfood',
  'sleep',
  'health',
  'daily',
  'emergency'
] as const

export type CommunityCategory = typeof COMMUNITY_CATEGORIES[number]