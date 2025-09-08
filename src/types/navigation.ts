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
    id: 'expecting',
    name: '예비양육자',
    emoji: '🤰',
    href: '/expecting',
    description: '임신~출산 준비 정보',
    category: 'expecting'
  },
  {
    id: 'newborn',
    name: '신생아 양육자',
    emoji: '👶',
    href: '/newborn',
    description: '0-6개월 신생아 돌봄',
    category: 'newborn'
  },
  {
    id: 'toddler',
    name: '성장기 양육자',
    emoji: '🧒',
    href: '/toddler',
    description: '7개월-5세 성장기 가이드',
    category: 'toddler'
  },
  {
    id: 'expert',
    name: '선배 양육자',
    emoji: '👩‍👧‍👦',
    href: '/expert',
    description: '경험 많은 양육자들의 노하우',
    category: 'expert'
  }
]

export const COMMUNITY_CATEGORIES = [
  'all',
  'expecting',
  'newborn', 
  'toddler',
  'expert'
] as const

export type CommunityCategory = typeof COMMUNITY_CATEGORIES[number]