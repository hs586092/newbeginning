'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MentionUser {
  id: string
  username: string
  email: string
}

interface UseMentionProps {
  onMention?: (user: MentionUser) => void
  minChars?: number
  maxSuggestions?: number
}

export function useMention({ onMention, minChars = 1, maxSuggestions = 8 }: UseMentionProps = {}) {
  const [suggestions, setSuggestions] = useState<MentionUser[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 })
  const supabase = createClient()

  // 사용자 검색
  const searchUsers = useCallback(async (term: string) => {
    if (!term || term.length < minChars) {
      setSuggestions([])
      return
    }

    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('user_id, username, email')
        .ilike('username', `%${term}%`)
        .limit(maxSuggestions)

      if (error) {
        console.error('사용자 검색 오류:', error)
        return
      }

      const mentionUsers: MentionUser[] = (users || []).map(user => ({
        id: user.user_id,
        username: user.username || user.email?.split('@')[0] || 'Unknown',
        email: user.email || ''
      }))

      setSuggestions(mentionUsers)
      setSelectedIndex(0)
    } catch (error) {
      console.error('사용자 검색 중 오류:', error)
      setSuggestions([])
    }
  }, [supabase, minChars, maxSuggestions])

  // 텍스트에서 멘션 감지
  const detectMention = useCallback((text: string, caretPos: number) => {
    const beforeCaret = text.substring(0, caretPos)
    const mentionMatch = beforeCaret.match(/@(\w*)$/)

    if (mentionMatch) {
      const searchTerm = mentionMatch[1]
      const mentionStart = caretPos - mentionMatch[0].length

      setSearchTerm(searchTerm)
      setMentionPosition({ start: mentionStart, end: caretPos })
      setIsOpen(true)
      searchUsers(searchTerm)
    } else {
      setIsOpen(false)
      setSuggestions([])
      setSearchTerm('')
    }
  }, [searchUsers])

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return false

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
        return true
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        return true
      case 'Enter':
      case 'Tab':
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          selectUser(suggestions[selectedIndex])
        }
        return true
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        return true
      default:
        return false
    }
  }, [isOpen, suggestions, selectedIndex])

  // 사용자 선택
  const selectUser = useCallback((user: MentionUser) => {
    if (onMention) {
      onMention(user)
    }
    setIsOpen(false)
    setSuggestions([])
    setSearchTerm('')
  }, [onMention])

  // 멘션 교체 함수
  const replaceMention = useCallback((text: string, user: MentionUser) => {
    const beforeMention = text.substring(0, mentionPosition.start)
    const afterMention = text.substring(mentionPosition.end)
    const mention = `@${user.username} `

    return {
      newText: beforeMention + mention + afterMention,
      newCaretPos: beforeMention.length + mention.length
    }
  }, [mentionPosition])

  return {
    suggestions,
    selectedIndex,
    isOpen,
    searchTerm,
    detectMention,
    handleKeyDown,
    selectUser,
    replaceMention,
    closeSuggestions: () => setIsOpen(false)
  }
}

// 멘션 구문 파싱 및 렌더링을 위한 유틸리티
export function parseMentions(text: string) {
  const mentionRegex = /@(\w+)/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    // 멘션 이전 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      })
    }

    // 멘션 추가
    parts.push({
      type: 'mention',
      content: match[0], // @username
      username: match[1] // username
    })

    lastIndex = match.index + match[0].length
  }

  // 마지막 텍스트 추가
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    })
  }

  return parts
}

// 멘션 렌더링 컴포넌트
export function MentionText({ text, className = '' }: { text: string; className?: string }) {
  const parts = parseMentions(text)

  return (
    <span className={className}>
      {parts.map((part, index) => (
        part.type === 'mention' ? (
          <span
            key={index}
            className="text-blue-600 font-medium bg-blue-50 px-1 py-0.5 rounded"
            title={`@${part.username}`}
          >
            {part.content}
          </span>
        ) : (
          <span key={index}>{part.content}</span>
        )
      ))}
    </span>
  )
}