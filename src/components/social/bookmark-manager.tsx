'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SocialSharingService } from '@/lib/services/social-sharing-service'
import { BookmarkWithPost } from '@/types/database.types'
import {
  Bookmark,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  FolderOpen,
  FileText,
  Calendar,
  User,
  Share2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'
import { toast } from 'sonner'

interface BookmarkManagerProps {
  className?: string
}

export function BookmarkManager({ className = '' }: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editCategory, setEditCategory] = useState('')

  useEffect(() => {
    loadBookmarks()
    loadCategories()
  }, [selectedCategory])

  const loadBookmarks = async () => {
    try {
      setLoading(true)
      const result = await SocialSharingService.getUserBookmarks(
        selectedCategory === 'all' ? undefined : selectedCategory
      )
      setBookmarks(result)
    } catch (error) {
      console.error('북마크 로드 오류:', error)
      toast.error('북마크를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const result = await SocialSharingService.getBookmarkCategories()
      setCategories(result)
    } catch (error) {
      console.error('카테고리 로드 오류:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBookmarks()
      return
    }

    try {
      setLoading(true)
      const result = await SocialSharingService.searchBookmarks(searchQuery)
      setBookmarks(result)
    } catch (error) {
      console.error('검색 오류:', error)
      toast.error('검색에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (postId: string) => {
    try {
      const success = await SocialSharingService.removeBookmark(postId)
      if (success) {
        setBookmarks(prev => prev.filter(b => b.post_id !== postId))
        toast.success('북마크가 제거되었습니다')
      } else {
        toast.error('북마크 제거에 실패했습니다')
      }
    } catch (error) {
      console.error('북마크 제거 오류:', error)
      toast.error('북마크 제거에 실패했습니다')
    }
  }

  const handleUpdateBookmark = async (postId: string) => {
    try {
      const promises = []

      if (editNotes !== '') {
        promises.push(SocialSharingService.updateBookmarkNotes(postId, editNotes))
      }

      if (editCategory !== '') {
        promises.push(SocialSharingService.updateBookmarkCategory(postId, editCategory))
      }

      const results = await Promise.all(promises)
      const success = results.every(result => result)

      if (success) {
        toast.success('북마크가 수정되었습니다')
        loadBookmarks()
        loadCategories()
        setEditingBookmark(null)
      } else {
        toast.error('북마크 수정에 실패했습니다')
      }
    } catch (error) {
      console.error('북마크 수정 오류:', error)
      toast.error('북마크 수정에 실패했습니다')
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const exportData = await SocialSharingService.exportBookmarks(format)
      if (exportData) {
        const blob = new Blob([exportData], {
          type: format === 'json' ? 'application/json' : 'text/csv'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bookmarks.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('북마크가 내보내졌습니다')
      } else {
        toast.error('내보내기에 실패했습니다')
      }
    } catch (error) {
      console.error('내보내기 오류:', error)
      toast.error('내보내기에 실패했습니다')
    }
  }

  const filteredBookmarks = searchQuery
    ? bookmarks
    : bookmarks.filter(bookmark =>
        selectedCategory === 'all' || bookmark.category === selectedCategory
      )

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            북마크 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            북마크 관리
            <Badge variant="secondary">{bookmarks.length}</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="북마크 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              전체
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '북마크가 없습니다'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? '다른 검색어를 시도해보세요'
                : '게시글을 북마크하면 여기에 표시됩니다'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Post thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    {bookmark.posts.image_url ? (
                      <Image
                        src={bookmark.posts.image_url}
                        alt="게시글 이미지"
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <FileText className="w-8 h-8" />
                    )}
                  </div>

                  {/* Post info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-base line-clamp-2 mb-1">
                          {bookmark.posts.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {bookmark.posts.profiles.full_name || bookmark.posts.profiles.username}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(bookmark.created_at), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingBookmark(bookmark.id)
                            setEditNotes(bookmark.notes || '')
                            setEditCategory(bookmark.category || '')
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBookmark(bookmark.post_id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Category and notes */}
                    {bookmark.category && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {bookmark.category}
                      </Badge>
                    )}

                    {bookmark.notes && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {bookmark.notes}
                      </p>
                    )}

                    {/* Edit form */}
                    {editingBookmark === bookmark.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700">카테고리</label>
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            placeholder="카테고리 입력"
                            className="w-full mt-1 px-3 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-700">메모</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="메모를 입력하세요"
                            rows={2}
                            className="w-full mt-1 px-3 py-2 text-sm border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateBookmark(bookmark.post_id)}
                          >
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingBookmark(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Post link */}
                    <div className="mt-2">
                      <a
                        href={`/post/${bookmark.post_id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        게시글 보기 →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}