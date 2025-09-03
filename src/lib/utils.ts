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
    case 'job_offer':
      return '구인'
    case 'job_seek':
      return '구직'
    case 'community':
      return '커뮤니티'
    case 'pregnancy_info':
      return '임신 정보'
    case 'parenting_guide':
      return '육아 가이드'
    case 'health_tips':
      return '건강 정보'
    case 'nutrition_guide':
      return '영양 가이드'
    case 'development_info':
      return '발달 정보'
    case 'safety_tips':
      return '안전 수칙'
    default:
      return category
  }
}

export function getCategoryColor(category: string) {
  switch (category) {
    case 'job_offer':
      return 'bg-blue-100 text-blue-800'
    case 'job_seek':
      return 'bg-green-100 text-green-800'
    case 'community':
      return 'bg-purple-100 text-purple-800'
    case 'pregnancy_info':
      return 'bg-pink-100 text-pink-800'
    case 'parenting_guide':
      return 'bg-blue-100 text-blue-800'
    case 'health_tips':
      return 'bg-green-100 text-green-800'
    case 'nutrition_guide':
      return 'bg-orange-100 text-orange-800'
    case 'development_info':
      return 'bg-purple-100 text-purple-800'
    case 'safety_tips':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Educational content helper functions
export function isEducationalContent(category: string): boolean {
  return ['pregnancy_info', 'parenting_guide', 'health_tips', 'nutrition_guide', 'development_info', 'safety_tips'].includes(category)
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'pregnancy_info':
      return '🤱'
    case 'parenting_guide':
      return '👶'
    case 'health_tips':
      return '🏥'
    case 'nutrition_guide':
      return '🥗'
    case 'development_info':
      return '🎯'
    case 'safety_tips':
      return '🛡️'
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