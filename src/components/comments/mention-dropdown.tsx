'use client'

import { forwardRef } from 'react'
import { User, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MentionUser {
  id: string
  username: string
  email: string
}

interface MentionDropdownProps {
  suggestions: MentionUser[]
  selectedIndex: number
  onSelect: (user: MentionUser) => void
  isOpen: boolean
  position?: { x: number; y: number }
  className?: string
}

export const MentionDropdown = forwardRef<HTMLDivElement, MentionDropdownProps>(
  ({ suggestions, selectedIndex, onSelect, isOpen, position = { x: 0, y: 0 }, className }, ref) => {
    if (!isOpen || suggestions.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto',
          className
        )}
        style={{
          left: position.x,
          top: position.y + 4
        }}
      >
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 border-b border-gray-100 mb-1">
            <AtSign className="w-3 h-3" />
            <span>사용자 멘션</span>
          </div>

          {suggestions.map((user, index) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors text-sm',
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                index === selectedIndex
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {user.username[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  @{user.username}
                </div>
                {user.email && (
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                )}
              </div>

              {index === selectedIndex && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </button>
          ))}

          <div className="px-2 py-1 text-xs text-gray-400 border-t border-gray-100 mt-1">
            ↑↓ 탐색 • Enter 선택 • Esc 닫기
          </div>
        </div>
      </div>
    )
  }
)

MentionDropdown.displayName = 'MentionDropdown'