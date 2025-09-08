import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/ko"

dayjs.extend(relativeTime)
dayjs.locale('ko')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return dayjs(date).fromNow()
}

export function formatFullDate(date: string | Date) {
  return dayjs(date).format('YYYY년 MM월 DD일 HH:mm')
}

export function truncateText(text: string, length: number = 100) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getCategoryLabel(category: string) {
  switch (category) {
    case 'community':
      return '커뮤니티'
    case 'expecting':
      return '예비맘'
    case 'newborn':
      return '신생아맘'
    case 'toddler':
      return '성장기맘'
    case 'expert':
      return '선배맘'
    default:
      return category
  }
}

export function getCategoryColor(category: string) {
  switch (category) {
    case 'community':
      return 'bg-purple-100 text-purple-800'
    case 'expecting':
      return 'bg-pink-100 text-pink-800'
    case 'newborn':
      return 'bg-blue-100 text-blue-800'
    case 'toddler':
      return 'bg-green-100 text-green-800'
    case 'expert':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Educational content helper functions
export function isEducationalContent(category: string): boolean {
  return ['expecting', 'newborn', 'toddler', 'expert'].includes(category)
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'expecting':
      return '🤰'
    case 'newborn':
      return '👶'
    case 'toddler':
      return '🧒'
    case 'expert':
      return '👩‍👧‍👦'
    case 'community':
      return '💬'
    default:
      return '📝'
  }
}

export function formatReadTime(minutes: number): string {
  return `${minutes}분 읽기`
}

export function getTargetAudienceLabel(audience: string): string {
  switch (audience) {
    case 'expecting_parents':
      return '예비 부모'
    case 'new_parents':
      return '신생아 부모'
    case 'toddler_parents':
      return '유아 부모'
    case 'all_parents':
      return '모든 부모'
    default:
      return audience
  }
}