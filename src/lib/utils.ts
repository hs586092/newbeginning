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
    default:
      return 'bg-gray-100 text-gray-800'
  }
}