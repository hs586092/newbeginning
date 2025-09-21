/**
 * 북마크 페이지
 * 사용자가 저장한 게시글들을 관리할 수 있는 페이지
 */

import { Metadata } from 'next'
import { BookmarksPageClient } from './bookmarks-page-client'

export const metadata: Metadata = {
  title: '북마크 | 첫돌까지',
  description: '저장된 게시글들을 확인하고 관리하세요'
}

export default function BookmarksPage() {
  return <BookmarksPageClient />
}